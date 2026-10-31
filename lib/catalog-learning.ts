import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PoolClient } from "pg";
import { pool } from "./sql";
import { HttpError } from "./api";
import { newCard, ALGORITHM } from "./learning/srs";
import { catalogSetDetail } from "./vocabulary-catalog";
import { catalogLearningBody } from "./vocabulary-catalog-contract";

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
async function budget(client: PoolClient, userId: string) {
  const profile = (
    await client.query("SELECT timezone FROM profiles WHERE user_id=$1", [
      userId,
    ])
  ).rows[0];
  const timezone = profile?.timezone || "Asia/Ho_Chi_Minh";
  const day = catalogDay(new Date(), timezone);
  const preferences = (
    await client.query(
      "SELECT new_per_day,version FROM catalog_preferences WHERE user_id=$1",
      [userId],
    )
  ).rows[0] || { new_per_day: 10, version: 0 };
  const used = Number(
    (
      await client.query(
        "SELECT count(*) FROM catalog_introductions WHERE user_id=$1 AND counted AND (introduced_at AT TIME ZONE $2)::date=$3::date",
        [userId, timezone, day],
      )
    ).rows[0].count,
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
  const client = await pool.connect();
  try {
    return {
      ...(await budget(client, userId)),
      progress: (
        await client.query(
          "SELECT sense_key,status,version,revision FROM catalog_progress WHERE user_id=$1 AND sense_key=ANY($2::text[])",
          [userId, keys],
        )
      ).rows,
      cards: (
        await client.query(
          "SELECT id,sense_key,version,suspended,content_snapshot->>'revision' AS source_revision FROM vocabulary WHERE user_id=$1 AND sense_key=ANY($2::text[])",
          [userId, keys],
        )
      ).rows,
      legacy: (
        await client.query(
          "SELECT id,term,meaning,kind,version FROM vocabulary WHERE user_id=$1 AND sense_key='' AND term=ANY($2::text[])",
          [userId, terms],
        )
      ).rows,
    };
  } finally {
    client.release();
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(814925,hashtext($1))", [
      userId,
    ]);
    const current = (
      await client.query(
        "SELECT * FROM catalog_progress WHERE user_id=$1 AND sense_key=$2",
        [userId, body.senseKey],
      )
    ).rows[0];
    const existing = (
      await client.query(
        "SELECT * FROM vocabulary WHERE user_id=$1 AND sense_key=$2",
        [userId, body.senseKey],
      )
    ).rows[0];
    if (body.action === "save" && existing) {
      await client.query("COMMIT");
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
          await client.query(
            "UPDATE vocabulary SET sense_key=$3,content_snapshot=$4,source_id=$5,version=version+1 WHERE id=$1 AND user_id=$2 AND sense_key='' AND version=$6 AND term=$7 AND kind=$8 RETURNING id",
            [
              body.attachCardId,
              userId,
              record.key,
              JSON.stringify(snapshot),
              `catalog:${record.key}:${record.revision}`,
              body.attachVersion,
              sense.term,
              kind,
            ],
          )
        ).rows[0];
        if (!attached)
          throw new HttpError(
            409,
            "Thẻ nhập tay đã đổi hoặc không thuộc từ/nghĩa này. Hãy tải lại.",
          );
        cardId = attached.id;
      } else {
        const introduced = (
          await client.query(
            "SELECT 1 FROM catalog_introductions WHERE user_id=$1 AND sense_key=$2",
            [userId, record.key],
          )
        ).rowCount;
        const b = await budget(client, userId);
        if (!introduced && b.used >= b.preferences.new_per_day)
          throw new HttpError(
            429,
            `Bạn đã dùng ${b.used}/${b.preferences.new_per_day} từ mới hôm nay. Vẫn có thể đọc bài, ôn hoặc đổi mục tiêu ngày.`,
          );
        cardId = randomUUID();
        const card = await newCard(cardId);
        await client.query(
          "INSERT INTO vocabulary(id,user_id,term,meaning,context,kind,source_id,card,due,algorithm,sense_key,content_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now(),$9,$10,$11)",
          [
            cardId,
            userId,
            sense.term,
            sense.meaning,
            sense.examples[0].ko,
            kind,
            `catalog:${record.key}:${record.revision}`,
            JSON.stringify(card),
            ALGORITHM,
            record.key,
            JSON.stringify(snapshot),
          ],
        );
      }
      await client.query(
        "INSERT INTO catalog_introductions(user_id,sense_key,counted) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [userId, record.key, !body.attachCardId],
      );
    }
    const status =
      body.action === "save"
        ? "learning"
        : body.action === "reset"
          ? "unmarked"
          : body.action;
    const progress = (
      await client.query(
        "INSERT INTO catalog_progress(user_id,sense_key,revision,set_key,status) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,sense_key) DO UPDATE SET revision=EXCLUDED.revision,set_key=EXCLUDED.set_key,status=EXCLUDED.status,version=catalog_progress.version+1,updated_at=now() RETURNING *",
        [userId, record.key, record.revision, body.setKey, status],
      )
    ).rows[0];
    await client.query("COMMIT");
    return { duplicate: false, cardId, progress };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
export async function saveCatalogPreferences(
  userId: string,
  newPerDay: number,
  version: number,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(814925,hashtext($1))", [
      userId,
    ]);
    const rows =
      version === 0
        ? (
            await client.query(
              "INSERT INTO catalog_preferences(user_id,new_per_day) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *",
              [userId, newPerDay],
            )
          ).rows
        : (
            await client.query(
              "UPDATE catalog_preferences SET new_per_day=$2,version=version+1 WHERE user_id=$1 AND version=$3 RETURNING *",
              [userId, newPerDay, version],
            )
          ).rows;
    if (!rows.length)
      throw new HttpError(409, "Mục tiêu đã đổi. Hãy tải lại để đối chiếu.");
    await client.query("COMMIT");
    return { preferences: rows[0] };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
