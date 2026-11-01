import { ormDataSource, createQueryRunner, rollback, } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { exams } from "@everlang/backend/content-store";
import { examSchema, publicExam, scoreExam } from "@everlang/contracts/exams";
import { getGradingQueue } from "@everlang/backend/redis";
const mini = {
    title: "Đọc & Viết — bài luyện ngắn beta",
    format: "TOPIK-II-PBT",
    formatVersion: "practice-1",
    kind: "mini",
    source: "EverLang tự biên soạn",
    rights: "Nội dung biên soạn beta; không phải đề thi chính thức",
    minutes: 10,
    questions: [
        {
            id: "r1",
            skill: "reading",
            prompt: "매일 조금씩 공부하면 실력이 늘 수 있다. 이 문장의 내용과 같은 것은?",
            options: [
                "꾸준히 공부하는 것이 도움이 된다.",
                "하루에 모든 내용을 외워야 한다.",
                "복습은 필요하지 않다.",
                "공부 시간은 길수록 항상 좋다.",
            ],
            answer: "꾸준히 공부하는 것이 도움이 된다.",
            points: 2,
            explanation: "조금씩 매일 공부하는 것은 꾸준한 학습을 뜻한다.",
        },
        {
            id: "w1",
            skill: "writing",
            prompt: "자신에게 효과적인 외국어 학습 방법을 100~200자로 설명하세요.",
            options: [],
            answer: "꾸준한 연습, 복습 방법, 구체적인 예시를 포함한 글.",
            points: 20,
            explanation: "Nêu phương pháp, lý do và ví dụ cụ thể.",
        },
    ],
};
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class ExamsService {
    async get(r: Request, u: Viewer) {
        await exams.create({ title: mini.title, document: examSchema.parse(mini), published: true, version: 1 }, true);
        const attemptId = queryParams(r).get("attempt");
        if (attemptId) {
            const a = (await ormDataSource
                .createQueryBuilder()
                .select(["*"])
                .from(Entities.exam_attempts, "row")
                .where("id=:p1 AND user_id=:p2")
                .setParameters({ p1: attemptId, p2: u.id })
                .getRawMany())[0];
            if (!a)
                throw new HttpError(404, "Không tìm thấy bài thi.");
            return {
                ...a,
                snapshot: a.submitted_at ? a.snapshot : publicExam(a.snapshot),
            };
        }
        const items = await exams.list();
        return {
            items: items.map((e) => ({
                id: String(e._id),
                title: e.title,
                kind: e.document.kind,
                minutes: e.document.minutes,
                source: e.document.source,
            })),
            attempts: await ormDataSource
                .createQueryBuilder()
                .select(["id", "exam_id", "started_at", "submitted_at", "result"])
                .from(Entities.exam_attempts, "row")
                .where("user_id=:p1")
                .orderBy("started_at", "DESC")
                .limit(20)
                .setParameters({ p1: u.id })
                .getRawMany(),
        };
    }
    async post(r: Request, u: Viewer) {
        const b = z
            .object({ examId: z.string().regex(/^[a-f\d]{24}$/i) })
            .parse(r.body);
        const e = await exams.get(b.examId);
        if (!e)
            throw new HttpError(404, "Không tìm thấy đề thi.");
        const doc = examSchema.parse(e.document);
        const existing = (await ormDataSource
            .createQueryBuilder()
            .select(["id"])
            .from(Entities.exam_attempts, "row")
            .where("user_id=:p1 AND exam_id=:p2 AND submitted_at IS NULL")
            .orderBy("started_at", "DESC")
            .limit(1)
            .setParameters({ p1: u.id, p2: b.examId })
            .getRawMany())[0];
        if (existing)
            return { id: existing.id };
        const id = randomUUID();
        const inserted = await ormDataSource
            .createQueryBuilder()
            .insert()
            .into(Entities.exam_attempts, [
            "id",
            "user_id",
            "exam_id",
            "snapshot",
            "deadline",
        ])
            .values({
            id: () => ":p1",
            user_id: () => ":p2",
            exam_id: () => ":p3",
            snapshot: () => ":p4",
            deadline: () => "now()+(:p5::integer*interval '1 minute')",
        })
            .updateEntity(false)
            .orIgnore()
            .returning("id")
            .setParameters({
            p1: id,
            p2: u.id,
            p3: b.examId,
            p4: JSON.stringify(doc),
            p5: doc.minutes,
        })
            .execute()
            .then((result) => result.raw);
        return {
            id: inserted[0]?.id ||
                (await ormDataSource
                    .createQueryBuilder()
                    .select(["id"])
                    .from(Entities.exam_attempts, "row")
                    .where("user_id=:p1 AND exam_id=:p2 AND submitted_at IS NULL")
                    .setParameters({ p1: u.id, p2: b.examId })
                    .getRawMany())[0].id,
        };
    }
    async patch(r: Request, u: Viewer) {
        const b = z
            .object({
            id: z.string().uuid(),
            version: z.number().int().positive(),
            answers: z.record(z.string(), z.string().max(10000)),
            submit: z.boolean().default(false),
        })
            .parse(r.body);
        const c = await createQueryRunner();
        let queued = false;
        try {
            await c.startTransaction();
            const a = (await c.manager
                .createQueryBuilder()
                .select(["*"])
                .from(Entities.exam_attempts, "row")
                .where("id=:p1 AND user_id=:p2")
                .setLock("pessimistic_write")
                .setParameters({ p1: b.id, p2: u.id })
                .getRawMany())[0];
            if (!a)
                throw new HttpError(404, "Không tìm thấy bài thi.");
            if (a.submitted_at) {
                await c.commitTransaction();
                return { saved: true, submitted: true };
            }
            if (a.version !== b.version)
                throw new HttpError(409, "Bài thi đã được cập nhật ở nơi khác.");
            const expired = new Date(a.deadline).getTime() <= Date.now();
            const answers = expired ? a.answers : b.answers;
            if (b.submit || expired) {
                const result = scoreExam(a.snapshot, answers);
                await c.manager
                    .createQueryBuilder()
                    .update(Entities.exam_attempts)
                    .set({
                    answers: () => ":p3",
                    submitted_at: () => "now()",
                    result: () => ":p4",
                    version: () => "version+1",
                })
                    .where("id=:p1 AND user_id=:p2")
                    .setParameters({
                    p1: b.id,
                    p2: u.id,
                    p3: JSON.stringify(answers),
                    p4: JSON.stringify(result),
                })
                    .execute()
                    .then((result) => result.raw);
                queued = result.writingStatus === "queued";
            }
            else
                await c.manager
                    .createQueryBuilder()
                    .update(Entities.exam_attempts)
                    .set({ answers: () => ":p3", version: () => "version+1" })
                    .where("id=:p1 AND user_id=:p2")
                    .setParameters({ p1: b.id, p2: u.id, p3: JSON.stringify(answers) })
                    .execute()
                    .then((result) => result.raw);
            await c.commitTransaction();
        }
        catch (e) {
            await rollback(c);
            throw e;
        }
        finally {
            await c.release();
        }
        if (queued)
            await getGradingQueue().add("exam-writing", { attemptId: b.id }, {
                jobId: "exam-" + b.id,
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 },
                removeOnComplete: 100,
            });
        return { saved: true };
    }
    async put(r: Request, _u: Viewer) {
        const b = examSchema.parse(r.body);
        const item = await exams.create({
            title: b.title,
            document: b,
            published: true,
            version: 1,
        });
        return { id: String(item._id) };
    }
}
