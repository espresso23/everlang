import { randomUUID } from "node:crypto";
import { z } from "zod";
import { connectDb } from "../lib/db";
import { pool } from "../lib/sql";
import mongoose from "mongoose";
import { gradeSchema } from "../lib/ai";
const [legacyId, email, confirm] = process.argv.slice(2);
z.string().uuid().parse(legacyId);
z.email().parse(email);
if (confirm !== "--confirm-owner")
  throw new Error(
    "Xác nhận quyền sở hữu bằng --confirm-owner sau khi đối chiếu dữ liệu cũ.",
  );
await connectDb();
const c = await pool.connect();
try {
  await c.query("BEGIN");
  await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [legacyId]);
  const user = (
    await c.query(
      "SELECT id FROM auth_user WHERE email=$1 AND email_verified=true",
      [email],
    )
  ).rows[0];
  if (!user) throw new Error("Cần tài khoản đã xác minh.");
  const prior = (
    await c.query("SELECT user_id FROM legacy_imports WHERE legacy_id=$1", [
      legacyId,
    ])
  ).rows[0];
  if (prior && prior.user_id !== user.id)
    throw new Error("Dữ liệu đã gắn với tài khoản khác.");
  const db = mongoose.connection.db!;
  const old = await db
    .collection("submissions")
    .find({ userId: legacyId })
    .toArray();
  let count = 0;
  for (const row of old) {
    const sentence = await db
      .collection("sentences")
      .findOne({ _id: row.sentenceId });
    if (!sentence) continue;
    const report = gradeSchema.parse(row);
    const id = randomUUID();
    const result = await c.query(
      "INSERT INTO submissions(id,user_id,sentence_id,translation,snapshot,report,status,dedup_key,model,prompt_version,rubric_version,created_at,completed_at) VALUES($1,$2,$3,$4,$5,$6,'completed',$7,'legacy','legacy','legacy',$8,$8) ON CONFLICT(dedup_key) DO NOTHING",
      [
        id,
        user.id,
        String(row.sentenceId),
        row.userTranslation,
        JSON.stringify({ ...sentence, _id: String(sentence._id) }),
        JSON.stringify(report),
        "legacy-" + row._id,
        row.submittedAt,
      ],
    );
    count += result.rowCount || 0;
  }
  const favorites = await db
    .collection("usersentencestates")
    .find({ userId: legacyId, favorite: true })
    .toArray();
  for (const f of favorites)
    await c.query(
      "INSERT INTO favorites(user_id,sentence_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [user.id, String(f.sentenceId)],
    );
  await c.query(
    "INSERT INTO legacy_imports(legacy_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
    [legacyId, user.id],
  );
  await c.query("COMMIT");
  console.info(`Imported ${count} reports; MongoDB originals preserved.`);
} catch (e) {
  await c.query("ROLLBACK");
  throw e;
} finally {
  c.release();
  await pool.end();
  await mongoose.disconnect();
}
