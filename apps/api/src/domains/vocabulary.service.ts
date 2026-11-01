import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { query } from "@everlang/backend/sql";
import { newCard, ALGORITHM } from "@everlang/backend/learning/srs";
const fields = z.object({
  term: z.string().trim().min(1).max(200),
  meaning: z.string().trim().min(1).max(1000),
  context: z.string().max(2000).default(""),
  note: z.string().max(2000).default(""),
  kind: z.enum(["word", "phrase", "grammar"]).default("word"),
  sourceId: z.string().max(100).optional(),
});
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class VocabularyService {
async get(r: Request, u: Viewer) {
  const dueOnly = queryParams(r).get("due") === "true";
  const items = await query(
    `SELECT * FROM vocabulary WHERE user_id=$1 ${dueOnly ? "AND NOT suspended AND due<=now()" : ""} ORDER BY due,id LIMIT 500`,
    [u.id],
  );
  const totals = (await query<{count: string; server_now: Date}>(
    "SELECT count(*) AS count, now() AS server_now FROM vocabulary WHERE user_id=$1 AND NOT suspended AND due<=now()",
    [u.id],
  ))[0];
  return {
    items,
    dueCount: Number(totals.count),
    serverNow: totals.server_now.toISOString(),
  };

}
async post(r: Request, u: Viewer) {
  const b = fields.parse(r.body);
  const id = randomUUID();
  const card = await newCard(id);
  const rows = await query(
    "INSERT INTO vocabulary(id,user_id,term,meaning,context,note,kind,source_id,card,due,algorithm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10) ON CONFLICT DO NOTHING RETURNING *",
    [
      id,
      u.id,
      b.term,
      b.meaning,
      b.context,
      b.note,
      b.kind,
      b.sourceId,
      JSON.stringify(card),
      ALGORITHM,
    ],
  );
  return { item: rows[0], duplicate: !rows.length };

}
async put(r: Request, u: Viewer) {
  const b = fields
    .extend({
      id: z.string().uuid(),
      version: z.number().int().positive(),
      suspended: z.boolean(),
    })
    .parse(r.body);
  let rows;
  try {
    rows = await query(
      "UPDATE vocabulary SET term=$3,meaning=$4,context=$5,note=$6,kind=$7,suspended=$8,version=version+1 WHERE id=$1 AND user_id=$2 AND version=$9 RETURNING *",
      [
        b.id,
        u.id,
        b.term,
        b.meaning,
        b.context,
        b.note,
        b.kind,
        b.suspended,
        b.version,
      ],
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505")
      throw new HttpError(
        409,
        "Đã có thẻ nhập tay với từ và loại này. Hãy giữ riêng nghĩa từ bộ từ.",
      );
    throw e;
  }
  if (!rows.length) throw new HttpError(409, "Thẻ đã thay đổi. Hãy tải lại.");
  return { item: rows[0] };

}
}
