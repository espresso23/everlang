import { createQueryRunner, rollback } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";

import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { reviewCard } from "@everlang/backend/learning/srs";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class ReviewsService {
  async post(r: Request, u: Viewer) {
    const b = z
      .object({
        id: z.string().uuid(),
        rating: z.number().int().min(1).max(4),
        version: z.number().int().positive(),
        requestId: z.string().uuid(),
      })
      .parse(r.body);
    const c = await createQueryRunner();
    try {
      await c.startTransaction();
      const previous = await c.manager
        .createQueryBuilder()
        .select(["card_id"])
        .from(Entities.review_logs, "row")
        .where("id=:p1 AND user_id=:p2")
        .setParameters({ p1: b.requestId, p2: u.id })
        .getRawMany();
      if (previous.length) {
        await c.commitTransaction();
        return { saved: true, duplicate: true };
      }
      const row = (
        await c.manager
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.vocabulary, "row")
          .where("id=:p1 AND user_id=:p2")
          .setLock("pessimistic_write")
          .setParameters({ p1: b.id, p2: u.id })
          .getRawMany()
      )[0];
      if (!row) throw new HttpError(404, "Không tìm thấy thẻ.");
      if (
        row.version !== b.version ||
        row.suspended ||
        new Date(row.due).getTime() > Date.now()
      )
        throw new HttpError(409, "Thẻ đã được ôn hoặc thay đổi. Hãy tải lại.");
      const result = await reviewCard(row.card, b.rating);
      await c.manager
        .createQueryBuilder()
        .update(Entities.vocabulary)
        .set({
          card: () => ":p3",
          due: () => ":p4",
          version: () => "version+1",
        })
        .where("id=:p1 AND user_id=:p2")
        .setParameters({
          p1: b.id,
          p2: u.id,
          p3: JSON.stringify(result.card),
          p4: result.card.dueAt,
        })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.review_logs, [
          "id",
          "user_id",
          "card_id",
          "rating",
          "log",
        ])
        .values({
          id: () => ":p1",
          user_id: () => ":p2",
          card_id: () => ":p3",
          rating: () => ":p4",
          log: () => ":p5",
        })
        .updateEntity(false)
        .setParameters({
          p1: b.requestId,
          p2: u.id,
          p3: b.id,
          p4: b.rating,
          p5: JSON.stringify(result.revlog),
        })
        .execute()
        .then((result) => result.raw);
      await c.commitTransaction();
      return { saved: true };
    } catch (e) {
      await rollback(c);
      throw e;
    } finally {
      await c.release();
    }
  }
}
