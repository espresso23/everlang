import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { publishedSentence } from "@everlang/backend/content";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class DraftsService {
  async get(_: Request, u: Viewer) {
    return {
      drafts: await ormDataSource
        .createQueryBuilder()
        .select(["sentence_id", "text", "version"])
        .from(Entities.drafts, "row")
        .where("user_id=:p1")
        .setParameters({ p1: u.id })
        .getRawMany(),
    };
  }
  async put(r: Request, u: Viewer) {
    const b = z
      .object({
        sentenceId: z.string(),
        text: z.string().max(5000),
        version: z.number().int().nonnegative(),
      })
      .parse(r.body);
    await publishedSentence(b.sentenceId);
    const rows =
      b.version === 0
        ? await ormDataSource
            .createQueryBuilder()
            .insert()
            .into(Entities.drafts, ["user_id", "sentence_id", "text"])
            .values({
              user_id: () => ":p1",
              sentence_id: () => ":p2",
              text: () => ":p3",
            })
            .updateEntity(false)
            .orIgnore()
            .returning("version")
            .setParameters({ p1: u.id, p2: b.sentenceId, p3: b.text })
            .execute()
            .then((result) => result.raw)
        : await ormDataSource
            .createQueryBuilder()
            .update(Entities.drafts)
            .set({
              text: () => ":p3",
              version: () => "version+1",
              updated_at: () => "now()",
            })
            .where("user_id=:p1 AND sentence_id=:p2 AND version=:p4")
            .returning("version")
            .setParameters({
              p1: u.id,
              p2: b.sentenceId,
              p3: b.text,
              p4: b.version,
            })
            .execute()
            .then((result) => result.raw);
    if (!rows.length)
      throw new HttpError(
        409,
        "Bản nháp đã thay đổi ở thiết bị khác. Tải lại trước khi sửa tiếp; bản nhập vẫn còn trên máy này.",
      );
    return rows[0];
  }
}
