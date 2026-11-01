import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { getKnowledge } from "@everlang/backend/knowledge";
import {
  gradeKnowledge,
  knowledgeKey,
} from "@everlang/contracts/knowledge-contract";
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
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class KnowledgeAttemptsService {
  async post(r: Request, u: Viewer) {
    const b = body.parse(r.body);
    const existing = async () => {
      const row = (
        await ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.knowledge_attempts, "row")
          .where("user_id=:p1 AND request_id=:p2")
          .setParameters({ p1: u.id, p2: b.requestId })
          .getRawMany()
      )[0];
      if (!row) return null;
      const sameAnswers =
        JSON.stringify(Object.entries(row.answers).sort()) ===
        JSON.stringify(Object.entries(b.answers).sort());
      if (
        row.entry_key !== b.key ||
        row.revision !== b.revision ||
        !sameAnswers
      )
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
    const rows = await ormDataSource
      .createQueryBuilder()
      .insert()
      .into(Entities.knowledge_attempts, [
        "id",
        "user_id",
        "request_id",
        "entry_key",
        "revision",
        "answers",
        "snapshot",
        "result",
      ])
      .values({
        id: () => ":p1",
        user_id: () => ":p2",
        request_id: () => ":p3",
        entry_key: () => ":p4",
        revision: () => ":p5",
        answers: () => ":p6",
        snapshot: () => ":p7",
        result: () => ":p8",
      })
      .updateEntity(false)
      .orUpdate([], ["user_id", "request_id"])
      .returning("id")
      .setParameters({
        p1: randomUUID(),
        p2: u.id,
        p3: b.requestId,
        p4: b.key,
        p5: b.revision,
        p6: JSON.stringify(b.answers),
        p7: JSON.stringify(entry),
        p8: JSON.stringify(result),
      })
      .execute()
      .then((result) => result.raw);
    if (!rows.length) return existing();
    return { id: rows[0].id, result, duplicate: false };
  }
}
