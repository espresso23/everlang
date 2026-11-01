import {
  createQueryRunner,
  rollback,
  advisoryTransactionLock,
  closeOrm,
  type QueryRunner,
} from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { connectDb } from "@everlang/backend/db";
import mongoose from "mongoose";
import { gradeSchema } from "@everlang/backend/ai";
import { installProcessErrorHandlers } from "@everlang/backend/process-errors";
installProcessErrorHandlers("records-import");
const [legacyId, email, confirm] = process.argv.slice(2);
z.string().uuid().parse(legacyId);
z.email().parse(email);
if (confirm !== "--confirm-owner")
  throw new Error(
    "Xác nhận quyền sở hữu bằng --confirm-owner sau khi đối chiếu dữ liệu cũ.",
  );
let c: QueryRunner | undefined;
try {
  await connectDb();
  c = await createQueryRunner();
  await c.startTransaction();
  await advisoryTransactionLock(c, null, String(legacyId));
  const user = (
    await c.manager
      .createQueryBuilder()
      .select(["id"])
      .from(Entities.users, "row")
      .where("email=:p1 AND email_verified=true")
      .setParameters({ p1: email })
      .getRawMany()
  )[0];
  if (!user) throw new Error("Cần tài khoản đã xác minh.");
  const prior = (
    await c.manager
      .createQueryBuilder()
      .select(["user_id"])
      .from(Entities.legacy_imports, "row")
      .where("legacy_id=:p1")
      .setParameters({ p1: legacyId })
      .getRawMany()
  )[0];
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
    const result = await c.manager
      .createQueryBuilder()
      .insert()
      .into(Entities.submissions, [
        "id",
        "user_id",
        "sentence_id",
        "translation",
        "snapshot",
        "report",
        "status",
        "dedup_key",
        "model",
        "prompt_version",
        "rubric_version",
        "created_at",
        "completed_at",
      ])
      .values({
        id: () => ":p1",
        user_id: () => ":p2",
        sentence_id: () => ":p3",
        translation: () => ":p4",
        snapshot: () => ":p5",
        report: () => ":p6",
        status: () => "'completed'",
        dedup_key: () => ":p7",
        model: () => "'legacy'",
        prompt_version: () => "'legacy'",
        rubric_version: () => "'legacy'",
        created_at: () => ":p8",
        completed_at: () => ":p8",
      })
      .updateEntity(false)
      .orUpdate([], ["dedup_key"])
      .returning("id")
      .setParameters({
        p1: id,
        p2: user.id,
        p3: String(row.sentenceId),
        p4: row.userTranslation,
        p5: JSON.stringify({ ...sentence, _id: String(sentence._id) }),
        p6: JSON.stringify(report),
        p7: "legacy-" + row._id,
        p8: row.submittedAt,
      })
      .execute()
      .then((result) => result.raw);
    count += result.length || 0;
  }
  const favorites = await db
    .collection("usersentencestates")
    .find({ userId: legacyId, favorite: true })
    .toArray();
  for (const f of favorites)
    await c.manager
      .createQueryBuilder()
      .insert()
      .into(Entities.favorites, ["user_id", "sentence_id"])
      .values({ user_id: () => ":p1", sentence_id: () => ":p2" })
      .updateEntity(false)
      .orIgnore()
      .setParameters({ p1: user.id, p2: String(f.sentenceId) })
      .execute()
      .then((result) => result.raw);
  await c.manager
    .createQueryBuilder()
    .insert()
    .into(Entities.legacy_imports, ["legacy_id", "user_id"])
    .values({ legacy_id: () => ":p1", user_id: () => ":p2" })
    .updateEntity(false)
    .orIgnore()
    .setParameters({ p1: legacyId, p2: user.id })
    .execute()
    .then((result) => result.raw);
  await c.commitTransaction();
  console.info(`Imported ${count} reports; MongoDB originals preserved.`);
} catch (e) {
  if (c) await rollback(c);
  throw e;
} finally {
  if (c) await c.release();
  await closeOrm();
  await mongoose.disconnect();
}
