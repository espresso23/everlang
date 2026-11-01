import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { z } from "zod";
import { connectDb } from "@everlang/backend/db";
import { publishedSentence } from "@everlang/backend/content";
import { Sentence } from "@everlang/backend/models/Sentence";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class UserFavoritesService {
  async get(_: Request, u: Viewer) {
    const rows = await ormDataSource
      .createQueryBuilder()
      .select(["sentence_id"])
      .from(Entities.favorites, "row")
      .where("user_id=:p1")
      .orderBy("created_at", "DESC")
      .setParameters({ p1: u.id })
      .getRawMany();
    await connectDb();
    const items = await Sentence.find({
      _id: { $in: rows.map((r) => r.sentence_id) },
      status: "published",
    }).lean();
    return {
      favorites: items.map((sentence) => ({
        sentence: { ...sentence, _id: String(sentence._id) },
      })),
    };
  }
  async post(r: Request, u: Viewer) {
    const body = z
      .object({ sentenceId: z.string(), favorite: z.boolean() })
      .parse(r.body);
    await publishedSentence(body.sentenceId);
    if (body.favorite)
      await ormDataSource
        .createQueryBuilder()
        .insert()
        .into(Entities.favorites, ["user_id", "sentence_id"])
        .values({ user_id: () => ":p1", sentence_id: () => ":p2" })
        .updateEntity(false)
        .orIgnore()
        .setParameters({ p1: u.id, p2: body.sentenceId })
        .execute()
        .then((result) => result.raw);
    else
      await ormDataSource
        .createQueryBuilder()
        .delete()
        .from(Entities.favorites)
        .where("user_id=:p1 AND sentence_id=:p2")
        .setParameters({ p1: u.id, p2: body.sentenceId })
        .execute()
        .then((result) => result.raw);
    return body;
  }
}
