import { createQueryRunner, rollback, advisoryTransactionLock } from "./orm";
import { Entities } from "./entities";
import type { QueryRunner } from "@everlang/backend/orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "./http";
import { newCard, ALGORITHM } from "./learning/srs";
import { catalogSetDetail } from "./vocabulary-catalog";
import { catalogLearningBody } from "@everlang/contracts/vocabulary-catalog-contract";

export function catalogDay(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"]
    .map((k) => parts.find((p) => p.type === k)!.value)
    .join("-");
}
async function budget(client: QueryRunner, userId: string) {
  const profile = (
    await client.manager
      .createQueryBuilder()
      .select(["timezone"])
      .from(Entities.profiles, "row")
      .where("user_id=:p1")
      .setParameters({ p1: userId })
      .getRawMany()
  )[0];
  const timezone = profile?.timezone || "Asia/Ho_Chi_Minh";
  const day = catalogDay(new Date(), timezone);
  const preferences = (
    await client.manager
      .createQueryBuilder()
      .select(["new_per_day", "version"])
      .from(Entities.catalog_preferences, "row")
      .where("user_id=:p1")
      .setParameters({ p1: userId })
      .getRawMany()
  )[0] || { new_per_day: 10, version: 0 };
  const used = Number(
    (
      await client.manager
        .createQueryBuilder()
        .select(["count(*)"])
        .from(Entities.catalog_introductions, "row")
        .where(
          "user_id=:p1 AND counted AND (introduced_at AT TIME ZONE :p2)::date=:p3::date",
        )
        .setParameters({ p1: userId, p2: timezone, p3: day })
        .getRawMany()
    )[0].count,
  );
  return { preferences, used, day, timezone };
}
export async function catalogLearning(
  userId: string,
  setKey: string,
  revision?: number,
) {
  const detail = await catalogSetDetail(setKey, revision);
  const keys = detail.senses.map((s) => s.key);
  const terms = detail.senses.map((s) =>
    s.content.kind === "sense" ? s.content.term : "",
  );
  const client = await createQueryRunner();
  try {
    return {
      ...(await budget(client, userId)),
      progress: await client.manager
        .createQueryBuilder()
        .select(["sense_key", "status", "version", "revision"])
        .from(Entities.catalog_progress, "row")
        .where("user_id=:p1 AND sense_key=ANY(:p2::text[])")
        .setParameters({ p1: userId, p2: keys })
        .getRawMany(),
      cards: await client.manager
        .createQueryBuilder()
        .select([
          "id",
          "sense_key",
          "version",
          "suspended",
          "content_snapshot->>'revision' AS source_revision",
        ])
        .from(Entities.vocabulary, "row")
        .where("user_id=:p1 AND sense_key=ANY(:p2::text[])")
        .setParameters({ p1: userId, p2: keys })
        .getRawMany(),
      legacy: await client.manager
        .createQueryBuilder()
        .select(["id", "term", "meaning", "kind", "version"])
        .from(Entities.vocabulary, "row")
        .where("user_id=:p1 AND sense_key='' AND term=ANY(:p2::text[])")
        .setParameters({ p1: userId, p2: terms })
        .getRawMany(),
    };
  } finally {
    await client.release();
  }
}
export async function saveCatalogLearning(
  userId: string,
  body: z.infer<typeof catalogLearningBody>,
) {
  const detail = await catalogSetDetail(body.setKey, body.setRevision);
  const record = detail.senses.find(
    (s) => s.key === body.senseKey && s.revision === body.senseRevision,
  );
  if (!record || record.content.kind !== "sense")
    throw new HttpError(404, "Nghĩa không thuộc phiên bản bộ từ đang học.");
  const sense = record.content;
  const client = await createQueryRunner();
  try {
    await client.startTransaction();
    await advisoryTransactionLock(client, 814925, String(userId));
    const current = (
      await client.manager
        .createQueryBuilder()
        .select(["*"])
        .from(Entities.catalog_progress, "row")
        .where("user_id=:p1 AND sense_key=:p2")
        .setParameters({ p1: userId, p2: body.senseKey })
        .getRawMany()
    )[0];
    const existing = (
      await client.manager
        .createQueryBuilder()
        .select(["*"])
        .from(Entities.vocabulary, "row")
        .where("user_id=:p1 AND sense_key=:p2")
        .setParameters({ p1: userId, p2: body.senseKey })
        .getRawMany()
    )[0];
    if (body.action === "save" && existing) {
      await client.commitTransaction();
      return {
        duplicate: true,
        cardId: existing.id,
        progress: current || null,
      };
    }
    if ((current?.version || 0) !== body.version)
      throw new HttpError(
        409,
        "Trạng thái đã đổi trên thiết bị khác. Hãy tải lại trước khi chọn.",
      );
    let cardId: string | undefined;
    if (body.action === "save") {
      const snapshot = {
        key: record.key,
        revision: record.revision,
        content: sense,
        fromSet: { key: detail.set.key, revision: detail.set.revision },
      };
      const kind = sense.pos === "Cụm từ" ? "phrase" : "word";
      if (body.attachCardId) {
        const attached = (
          await client.manager
            .createQueryBuilder()
            .update(Entities.vocabulary)
            .set({
              sense_key: () => ":p3",
              content_snapshot: () => ":p4",
              source_id: () => ":p5",
              version: () => "version+1",
            })
            .where(
              "id=:p1 AND user_id=:p2 AND sense_key='' AND version=:p6 AND term=:p7 AND kind=:p8",
            )
            .returning("id")
            .setParameters({
              p1: body.attachCardId,
              p2: userId,
              p3: record.key,
              p4: JSON.stringify(snapshot),
              p5: `catalog:${record.key}:${record.revision}`,
              p6: body.attachVersion,
              p7: sense.term,
              p8: kind,
            })
            .execute()
            .then((result) => result.raw)
        )[0];
        if (!attached)
          throw new HttpError(
            409,
            "Thẻ nhập tay đã đổi hoặc không thuộc từ/nghĩa này. Hãy tải lại.",
          );
        cardId = attached.id;
      } else {
        const introduced = (
          await client.manager
            .createQueryBuilder()
            .select(["1"])
            .from(Entities.catalog_introductions, "row")
            .where("user_id=:p1 AND sense_key=:p2")
            .setParameters({ p1: userId, p2: record.key })
            .getRawMany()
        ).length;
        const b = await budget(client, userId);
        if (!introduced && b.used >= b.preferences.new_per_day)
          throw new HttpError(
            429,
            `Bạn đã dùng ${b.used}/${b.preferences.new_per_day} từ mới hôm nay. Vẫn có thể đọc bài, ôn hoặc đổi mục tiêu ngày.`,
          );
        cardId = randomUUID();
        const card = await newCard(cardId);
        await client.manager
          .createQueryBuilder()
          .insert()
          .into(Entities.vocabulary, [
            "id",
            "user_id",
            "term",
            "meaning",
            "context",
            "kind",
            "source_id",
            "card",
            "due",
            "algorithm",
            "sense_key",
            "content_snapshot",
          ])
          .values({
            id: () => ":p1",
            user_id: () => ":p2",
            term: () => ":p3",
            meaning: () => ":p4",
            context: () => ":p5",
            kind: () => ":p6",
            source_id: () => ":p7",
            card: () => ":p8",
            due: () => "now()",
            algorithm: () => ":p9",
            sense_key: () => ":p10",
            content_snapshot: () => ":p11",
          })
          .updateEntity(false)
          .setParameters({
            p1: cardId,
            p2: userId,
            p3: sense.term,
            p4: sense.meaning,
            p5: sense.examples[0].ko,
            p6: kind,
            p7: `catalog:${record.key}:${record.revision}`,
            p8: JSON.stringify(card),
            p9: ALGORITHM,
            p10: record.key,
            p11: JSON.stringify(snapshot),
          })
          .execute()
          .then((result) => result.raw);
      }
      await client.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.catalog_introductions, [
          "user_id",
          "sense_key",
          "counted",
        ])
        .values({
          user_id: () => ":p1",
          sense_key: () => ":p2",
          counted: () => ":p3",
        })
        .updateEntity(false)
        .orIgnore()
        .setParameters({ p1: userId, p2: record.key, p3: !body.attachCardId })
        .execute()
        .then((result) => result.raw);
    }
    const status =
      body.action === "save"
        ? "learning"
        : body.action === "reset"
          ? "unmarked"
          : body.action;
    const progress = (
      await (current
        ? client.manager
            .createQueryBuilder()
            .update(Entities.catalog_progress)
            .set({
              revision: () => ":p3",
              set_key: () => ":p4",
              status: () => ":p5",
              version: () => "version+1",
              updated_at: () => "now()",
            })
            .where("user_id=:p1 AND sense_key=:p2")
            .returning("*")
            .setParameters({
              p1: userId,
              p2: record.key,
              p3: record.revision,
              p4: body.setKey,
              p5: status,
            })
            .execute()
            .then((result) => result.raw)
        : client.manager
            .createQueryBuilder()
            .insert()
            .into(Entities.catalog_progress, [
              "user_id",
              "sense_key",
              "revision",
              "set_key",
              "status",
            ])
            .values({
              user_id: () => ":p1",
              sense_key: () => ":p2",
              revision: () => ":p3",
              set_key: () => ":p4",
              status: () => ":p5",
            })
            .updateEntity(false)
            .returning("*")
            .setParameters({
              p1: userId,
              p2: record.key,
              p3: record.revision,
              p4: body.setKey,
              p5: status,
            })
            .execute()
            .then((result) => result.raw))
    )[0];
    await client.commitTransaction();
    return { duplicate: false, cardId, progress };
  } catch (e) {
    await rollback(client);
    throw e;
  } finally {
    await client.release();
  }
}
export async function saveCatalogPreferences(
  userId: string,
  newPerDay: number,
  version: number,
) {
  const client = await createQueryRunner();
  try {
    await client.startTransaction();
    await advisoryTransactionLock(client, 814925, String(userId));
    const rows =
      version === 0
        ? await client.manager
            .createQueryBuilder()
            .insert()
            .into(Entities.catalog_preferences, ["user_id", "new_per_day"])
            .values({ user_id: () => ":p1", new_per_day: () => ":p2" })
            .updateEntity(false)
            .orIgnore()
            .returning("*")
            .setParameters({ p1: userId, p2: newPerDay })
            .execute()
            .then((result) => result.raw)
        : await client.manager
            .createQueryBuilder()
            .update(Entities.catalog_preferences)
            .set({ new_per_day: () => ":p2", version: () => "version+1" })
            .where("user_id=:p1 AND version=:p3")
            .returning("*")
            .setParameters({ p1: userId, p2: newPerDay, p3: version })
            .execute()
            .then((result) => result.raw);
    if (!rows.length)
      throw new HttpError(409, "Mục tiêu đã đổi. Hãy tải lại để đối chiếu.");
    await client.commitTransaction();
    return { preferences: rows[0] };
  } catch (e) {
    await rollback(client);
    throw e;
  } finally {
    await client.release();
  }
}
