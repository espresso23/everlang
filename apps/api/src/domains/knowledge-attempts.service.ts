import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { query } from "@everlang/backend/sql";
import { getKnowledge } from "@everlang/backend/knowledge";
import { gradeKnowledge, knowledgeKey } from "@everlang/contracts/knowledge-contract";
const body = z
  .object({
    key: knowledgeKey,
    revision: z.number().int().positive(),
    requestId: z.string().uuid(),
    answers: z
      .record(z.string().max(60), z.string().max(500))
      .refine((x) => Object.keys(x).length <= 15),
  })
  .strict();
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class KnowledgeAttemptsService {
async post(r: Request, u: Viewer) {
  const b = body.parse(r.body);
  const existing = async () => {
    const row = (
      await query(
        "SELECT * FROM knowledge_attempts WHERE user_id=$1 AND request_id=$2",
        [u.id, b.requestId],
      )
    )[0];
    if (!row) return null;
    const sameAnswers =
      JSON.stringify(Object.entries(row.answers).sort()) ===
      JSON.stringify(Object.entries(b.answers).sort());
    if (row.entry_key !== b.key || row.revision !== b.revision || !sameAnswers)
      throw new HttpError(409, "Mã lần nộp đã dùng cho nội dung khác.");
    return { id: row.id, result: row.result, duplicate: true };
  };
  const previous = await existing();
  if (previous) return previous;
  const entry = await getKnowledge(b.key, b.revision);
  if (
    !entry.questions.length ||
    Object.keys(b.answers).some(
      (id) => !entry.questions.some((q) => q.id === id),
    ) ||
    entry.questions.some((q) => !b.answers[q.id]?.trim())
  )
    throw new HttpError(400, "Hãy trả lời đầy đủ các câu hỏi của bài.");
  const result = gradeKnowledge(entry, b.answers);
  const rows = await query(
    "INSERT INTO knowledge_attempts(id,user_id,request_id,entry_key,revision,answers,snapshot,result) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(user_id,request_id) DO NOTHING RETURNING id",
    [
      randomUUID(),
      u.id,
      b.requestId,
      b.key,
      b.revision,
      JSON.stringify(b.answers),
      JSON.stringify(entry),
      JSON.stringify(result),
    ],
  );
  if (!rows.length) return existing();
  return { id: rows[0].id, result, duplicate: false };

}
}
