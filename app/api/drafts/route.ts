import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { query } from "@/lib/sql";
import { publishedSentence } from "@/lib/content";
export const GET = api("/api/drafts", async (_, u) => ({
  drafts: await query(
    "SELECT sentence_id,text,version FROM drafts WHERE user_id=$1",
    [u.id],
  ),
}));
export const PUT = api("/api/drafts", async (r, u) => {
  const b = z
    .object({
      sentenceId: z.string(),
      text: z.string().max(5000),
      version: z.number().int().nonnegative(),
    })
    .parse(await r.json());
  await publishedSentence(b.sentenceId);
  const rows =
    b.version === 0
      ? await query(
          "INSERT INTO drafts(user_id,sentence_id,text) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING version",
          [u.id, b.sentenceId, b.text],
        )
      : await query(
          "UPDATE drafts SET text=$3,version=version+1,updated_at=now() WHERE user_id=$1 AND sentence_id=$2 AND version=$4 RETURNING version",
          [u.id, b.sentenceId, b.text, b.version],
        );
  if (!rows.length)
    throw new HttpError(
      409,
      "Bản nháp đã thay đổi ở thiết bị khác. Tải lại trước khi sửa tiếp; bản nhập vẫn còn trên máy này.",
    );
  return rows[0];
});
