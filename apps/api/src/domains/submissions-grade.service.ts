import { rateLimit } from "@everlang/backend/rate-limit";
import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { publishedSentence } from "@everlang/backend/content";
import { getGradingQueue } from "@everlang/backend/redis";
import { reportView, type StoredSubmission, } from "@everlang/backend/learning/submissions";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { HttpResult } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class SubmissionsGradeService {
    async post(r: Request, u: Viewer) {
        const b = z
            .object({
            sentenceId: z.string(),
            userTranslation: z.string().trim().min(1).max(5000),
            forceRegrade: z.boolean().default(false),
            requestId: z.string().uuid(),
        })
            .parse(r.body);
        if (!(await rateLimit(u.id, "grade")))
            throw new HttpError(429, "Bạn gửi quá nhanh. Vui lòng chờ một phút.");
        const sentence = await publishedSentence(b.sentenceId);
        const model = process.env.OPENROUTER_MODEL || "qwen/qwen3.8-flash";
        const promptVersion = "everlang-translation-2";
        const normalized = b.userTranslation
            .normalize("NFC")
            .replace(/\p{P}/gu, "")
            .replace(/\s+/g, " ")
            .trim();
        const attemptHash = (force: boolean) => createHash("sha256")
            .update(JSON.stringify([
            u.id,
            b.sentenceId,
            sentence.contentVersion,
            normalized,
            model,
            promptVersion,
            force ? b.requestId : "cached",
        ]))
            .digest("hex");
        let hash = attemptHash(b.forceRegrade);
        for (let pass = 0; pass < 2; pass++) {
            const id = randomUUID();
            await ormDataSource
                .createQueryBuilder()
                .insert()
                .into(Entities.submissions, [
                "id",
                "user_id",
                "sentence_id",
                "translation",
                "snapshot",
                "dedup_key",
                "model",
                "prompt_version",
                "rubric_version",
            ])
                .values({
                id: () => ":p1",
                user_id: () => ":p2",
                sentence_id: () => ":p3",
                translation: () => ":p4",
                snapshot: () => ":p5",
                dedup_key: () => ":p6",
                model: () => ":p7",
                prompt_version: () => ":p8",
                rubric_version: () => "'self-study-1'",
            })
                .updateEntity(false)
                .orUpdate([], ["dedup_key"])
                .setParameters({
                p1: id,
                p2: u.id,
                p3: b.sentenceId,
                p4: b.userTranslation,
                p5: JSON.stringify({...sentence,gradingRequestId:b.requestId}),
                p6: hash,
                p7: model,
                p8: promptVersion,
            })
                .execute()
                .then((result) => result.raw);
            const row = (await ormDataSource
                .createQueryBuilder()
                .select(["*"])
                .from(Entities.submissions, "row")
                .where("dedup_key=:p1 AND user_id=:p2")
                .setParameters({ p1: hash, p2: u.id })
                .getRawMany<StoredSubmission>())[0];
            if (row.status === "failed" && !b.forceRegrade && pass === 0 && row.snapshot?.gradingRequestId !== b.requestId) {
                hash = attemptHash(true);
                continue;
            }
            if (row.status === "completed")
                return { ...reportView(row), cached: true };
            if (row.status === "failed")
                return HttpResult.json({
                    error: row.error ||
                        "Lượt chấm trước chưa xử lý được bài này. Nháp được giữ nguyên; bạn có thể chấm lại.",
                    code: "GRADING_PREVIOUS_FAILED",
                    submissionId: row.id,
                    retryable: true,
                }, { status: 409 });
            await getGradingQueue().add("translation", { submissionId: row.id }, {
                jobId: row.id,
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 },
                removeOnComplete: 100,
                removeOnFail: 200,
            });
            return HttpResult.json({ jobId: row.id, status: row.status }, { status: 202 });
        }
        throw new HttpError(409, "Không thể tạo lượt chấm mới. Hãy thử lại.");
    }
}
