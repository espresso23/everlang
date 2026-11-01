import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { newCard, ALGORITHM } from "@everlang/backend/learning/srs";
const fields = z.object({
  term: z.string().trim().min(1).max(200),
  meaning: z.string().trim().min(1).max(1000),
  context: z.string().max(2000).default(""),
  note: z.string().max(2000).default(""),
  kind: z.enum(["word", "phrase", "grammar"]).default("word"),
  sourceId: z.string().max(100).optional(),
});
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class VocabularyService {
  async get(r: Request, u: Viewer) {
    const dueOnly = queryParams(r).get("due") === "true";
    const items = await (dueOnly
      ? ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.vocabulary, "row")
          .where("user_id=:p1 AND NOT suspended AND due<=now()")
          .orderBy("due", "ASC")
          .addOrderBy("id", "ASC")
          .limit(500)
          .setParameters({ p1: u.id })
          .getRawMany()
      : ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.vocabulary, "row")
          .where("user_id=:p1")
          .orderBy("due", "ASC")
          .addOrderBy("id", "ASC")
          .limit(500)
          .setParameters({ p1: u.id })
          .getRawMany());
    const totals = (
      await ormDataSource
        .createQueryBuilder()
        .select(["count(*) AS count", "now() AS server_now"])
        .from(Entities.vocabulary, "row")
        .where("user_id=:p1 AND NOT suspended AND due<=now()")
        .setParameters({ p1: u.id })
        .getRawMany<{ count: string; server_now: Date }>()
    )[0];
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
    const rows = await ormDataSource
      .createQueryBuilder()
      .insert()
      .into(Entities.vocabulary, [
        "id",
        "user_id",
        "term",
        "meaning",
        "context",
        "note",
        "kind",
        "source_id",
        "card",
        "due",
        "algorithm",
      ])
      .values({
        id: () => ":p1",
        user_id: () => ":p2",
        term: () => ":p3",
        meaning: () => ":p4",
        context: () => ":p5",
        note: () => ":p6",
        kind: () => ":p7",
        source_id: () => ":p8",
        card: () => ":p9",
        due: () => "now()",
        algorithm: () => ":p10",
      })
      .updateEntity(false)
      .orIgnore()
      .returning("*")
      .setParameters({
        p1: id,
        p2: u.id,
        p3: b.term,
        p4: b.meaning,
        p5: b.context,
        p6: b.note,
        p7: b.kind,
        p8: b.sourceId,
        p9: JSON.stringify(card),
        p10: ALGORITHM,
      })
      .execute()
      .then((result) => result.raw);
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
      rows = await ormDataSource
        .createQueryBuilder()
        .update(Entities.vocabulary)
        .set({
          term: () => ":p3",
          meaning: () => ":p4",
          context: () => ":p5",
          note: () => ":p6",
          kind: () => ":p7",
          suspended: () => ":p8",
          version: () => "version+1",
        })
        .where("id=:p1 AND user_id=:p2 AND version=:p9")
        .returning("*")
        .setParameters({
          p1: b.id,
          p2: u.id,
          p3: b.term,
          p4: b.meaning,
          p5: b.context,
          p6: b.note,
          p7: b.kind,
          p8: b.suspended,
          p9: b.version,
        })
        .execute()
        .then((result) => result.raw);
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
