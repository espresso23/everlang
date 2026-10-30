import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { pool } from "@/lib/sql";
import { reviewCard } from "@/lib/learning/srs";
export const POST = api("/api/reviews", async (r, u) => {
  const b = z
    .object({
      id: z.string().uuid(),
      rating: z.number().int().min(1).max(4),
      version: z.number().int().positive(),
      requestId: z.string().uuid(),
    })
    .parse(await r.json());
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const previous = await c.query(
      "SELECT card_id FROM review_logs WHERE id=$1 AND user_id=$2",
      [b.requestId, u.id],
    );
    if (previous.rowCount) {
      await c.query("COMMIT");
      return { saved: true, duplicate: true };
    }
    const row = (
      await c.query(
        "SELECT * FROM vocabulary WHERE id=$1 AND user_id=$2 FOR UPDATE",
        [b.id, u.id],
      )
    ).rows[0];
    if (!row) throw new HttpError(404, "Không tìm thấy thẻ.");
    if (
      row.version !== b.version ||
      row.suspended ||
      new Date(row.due).getTime() > Date.now()
    )
      throw new HttpError(409, "Thẻ đã được ôn hoặc thay đổi. Hãy tải lại.");
    const result = await reviewCard(row.card, b.rating);
    await c.query(
      "UPDATE vocabulary SET card=$3,due=$4,version=version+1 WHERE id=$1 AND user_id=$2",
      [b.id, u.id, JSON.stringify(result.card), result.card.dueAt],
    );
    await c.query(
      "INSERT INTO review_logs(id,user_id,card_id,rating,log) VALUES($1,$2,$3,$4,$5)",
      [b.requestId, u.id, b.id, b.rating, JSON.stringify(result.revlog)],
    );
    await c.query("COMMIT");
    return { saved: true };
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
