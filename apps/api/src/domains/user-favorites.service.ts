import { z } from "zod";
import { query } from "@everlang/backend/sql";
import { connectDb } from "@everlang/backend/db";
import { publishedSentence } from "@everlang/backend/content";
import { Sentence } from "@everlang/backend/models/Sentence";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class UserFavoritesService {
async get(_: Request, u: Viewer) {
  const rows = await query(
    "SELECT sentence_id FROM favorites WHERE user_id=$1 ORDER BY created_at DESC",
    [u.id],
  );
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
    await query(
      "INSERT INTO favorites(user_id,sentence_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [u.id, body.sentenceId],
    );
  else
    await query("DELETE FROM favorites WHERE user_id=$1 AND sentence_id=$2", [
      u.id,
      body.sentenceId,
    ]);
  return body;

}
}
