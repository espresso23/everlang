import { z } from "zod";
import { api } from "@/lib/api";
import { query } from "@/lib/sql";
import { connectDb } from "@/lib/db";
import { publishedSentence } from "@/lib/content";
import { Sentence } from "@/lib/models/Sentence";
export const GET = api("/api/user/favorites", async (_, u) => {
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
});
export const POST = api("/api/user/favorites", async (r, u) => {
  const body = z
    .object({ sentenceId: z.string(), favorite: z.boolean() })
    .parse(await r.json());
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
});
