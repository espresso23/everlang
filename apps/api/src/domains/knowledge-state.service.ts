import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { HttpError } from "@everlang/backend/http";
import {
  knowledgeKey,
  stateSchema,
} from "@everlang/contracts/knowledge-contract";
import { getKnowledge, knowledgeTitles } from "@everlang/backend/knowledge";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class KnowledgeStateService {
  async get(r: Request, u: Viewer) {
    if (!queryParams(r).has("key")) {
      const items = await ormDataSource
        .createQueryBuilder()
        .select([
          "entry_key",
          "revision",
          "bookmarked",
          "section",
          "read",
          "updated_at",
        ])
        .from(Entities.knowledge_state, "row")
        .where("user_id=:p1 AND (bookmarked OR section<>'')")
        .orderBy("updated_at", "DESC")
        .limit(100)
        .setParameters({ p1: u.id })
        .getRawMany();
      const titles = new Map(
        (await knowledgeTitles(items.map((row) => row.entry_key))).map(
          (row) => [row.key, row.title],
        ),
      );
      return {
        items: items.map((row) => ({
          ...row,
          title: titles.get(row.entry_key) || "Tài liệu đã lưu",
        })),
      };
    }
    const key = knowledgeKey.parse(queryParams(r).get("key"));
    return {
      state:
        (
          await ormDataSource
            .createQueryBuilder()
            .select(["*"])
            .from(Entities.knowledge_state, "row")
            .where("user_id=:p1 AND entry_key=:p2")
            .setParameters({ p1: u.id, p2: key })
            .getRawMany()
        )[0] || null,
    };
  }
  async put(r: Request, u: Viewer) {
    const b = stateSchema.parse(r.body);
    const entry = await getKnowledge(b.key);
    if (entry.revision !== b.revision)
      throw new HttpError(
        409,
        "Tài liệu có phiên bản mới. Hãy mở lại bài trước khi lưu.",
      );
    if (b.section && !entry.sections.some((s) => s.id === b.section))
      throw new HttpError(400, "Vị trí đọc không thuộc bài.");
    const values = [
      u.id,
      b.key,
      b.revision,
      b.bookmarked,
      b.note,
      b.section,
      b.read,
      b.version,
    ];

    const rows = await (b.version === 0
      ? ormDataSource
          .createQueryBuilder()
          .insert()
          .into(Entities.knowledge_state, [
            "user_id",
            "entry_key",
            "revision",
            "bookmarked",
            "note",
            "section",
            "read",
          ])
          .values({
            user_id: () => ":p1",
            entry_key: () => ":p2",
            revision: () => ":p3",
            bookmarked: () => ":p4",
            note: () => ":p5",
            section: () => ":p6",
            read: () => ":p7",
          })
          .updateEntity(false)
          .orIgnore()
          .returning("*")
          .setParameters({
            p1: (b.version === 0 ? values.slice(0, 7) : values)[0],
            p2: (b.version === 0 ? values.slice(0, 7) : values)[1],
            p3: (b.version === 0 ? values.slice(0, 7) : values)[2],
            p4: (b.version === 0 ? values.slice(0, 7) : values)[3],
            p5: (b.version === 0 ? values.slice(0, 7) : values)[4],
            p6: (b.version === 0 ? values.slice(0, 7) : values)[5],
            p7: (b.version === 0 ? values.slice(0, 7) : values)[6],
          })
          .execute()
          .then((result) => result.raw)
      : ormDataSource
          .createQueryBuilder()
          .update(Entities.knowledge_state)
          .set({
            revision: () => ":p3",
            bookmarked: () => ":p4",
            note: () => ":p5",
            section: () => ":p6",
            read: () => ":p7",
            version: () => "version+1",
            updated_at: () => "now()",
          })
          .where("user_id=:p1 AND entry_key=:p2 AND version=:p8")
          .returning("*")
          .setParameters({
            p1: (b.version === 0 ? values.slice(0, 7) : values)[0],
            p2: (b.version === 0 ? values.slice(0, 7) : values)[1],
            p3: (b.version === 0 ? values.slice(0, 7) : values)[2],
            p4: (b.version === 0 ? values.slice(0, 7) : values)[3],
            p5: (b.version === 0 ? values.slice(0, 7) : values)[4],
            p6: (b.version === 0 ? values.slice(0, 7) : values)[5],
            p7: (b.version === 0 ? values.slice(0, 7) : values)[6],
            p8: (b.version === 0 ? values.slice(0, 7) : values)[7],
          })
          .execute()
          .then((result) => result.raw));
    if (!rows.length)
      throw new HttpError(
        409,
        "Ghi chú đã đổi trên thiết bị khác. Bản bạn nhập vẫn được giữ; tải bản mới để đối chiếu.",
      );
    return { state: rows[0] };
  }
}
