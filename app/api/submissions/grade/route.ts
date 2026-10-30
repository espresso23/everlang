import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { publishedSentence } from "@/lib/content";
import { query } from "@/lib/sql";
import { getGradingQueue, rateLimit } from "@/lib/redis";
import { reportView, type StoredSubmission } from "@/lib/learning/submissions";
export const POST = api("/api/submissions/grade", async (r, u) => {
  const b = z
    .object({
      sentenceId: z.string(),
      userTranslation: z.string().trim().min(1).max(5000),
      forceRegrade: z.boolean().default(false),
      requestId: z.string().uuid(),
    })
    .parse(await r.json());
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
  const hash = createHash("sha256")
    .update(
      JSON.stringify([
        u.id,
        b.sentenceId,
        sentence.contentVersion,
        normalized,
        model,
        promptVersion,
        b.forceRegrade ? b.requestId : "cached",
      ]),
    )
    .digest("hex");
  const id = randomUUID();
  await query(
    "INSERT INTO submissions(id,user_id,sentence_id,translation,snapshot,dedup_key,model,prompt_version,rubric_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'self-study-1') ON CONFLICT(dedup_key) DO NOTHING",
    [
      id,
      u.id,
      b.sentenceId,
      b.userTranslation,
      JSON.stringify(sentence),
      hash,
      model,
      promptVersion,
    ],
  );
  const row = (
    await query<StoredSubmission>(
      "SELECT * FROM submissions WHERE dedup_key=$1 AND user_id=$2",
      [hash, u.id],
    )
  )[0];
  if (row.status === "completed") return { ...reportView(row), cached: true };
  if (row.status === "failed")
    throw new HttpError(
      502,
      "Lượt chấm trước thất bại. Dùng Chấm lại bằng AI để tạo lượt mới.",
    );
  await getGradingQueue().add(
    "translation",
    { submissionId: row.id },
    {
      jobId: row.id,
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  );
  return NextResponse.json(
    { jobId: row.id, status: row.status },
    { status: 202 },
  );
});
