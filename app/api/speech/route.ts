import { randomUUID } from "node:crypto";
import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { query, pool } from "@/lib/sql";
import { rateLimit, redis } from "@/lib/redis";
import {
  speechBody,
  decodeSpeech,
  speechFingerprint,
  speechFileKey,
  speechView,
  type SpeechRow,
  MAX_SPEECH_SECONDS,
  MAX_SPEECH_BYTES,
} from "@/lib/speech/contract";
import { writeSpeechAudio, removeSpeechAudio } from "@/lib/speech/storage";
import {
  selectedSpeechProvider,
  speechServiceReady,
  heartbeatMatches,
  SPEECH_CONSENT_VERSION,
} from "@/lib/speech/provider";
import { enqueueSpeech, SPEECH_HEARTBEAT } from "@/lib/speech/queue";

export const GET = api("/api/speech", async (r, u) => {
  const id = r.nextUrl.searchParams.get("id");
  if (id) {
    z.string().uuid().parse(id);
    const row = (
      await query<SpeechRow>(
        "SELECT * FROM speech_attempts WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
        [id, u.id],
      )
    )[0];
    if (!row) throw new HttpError(404, "Không tìm thấy bản ghi.");
    return { item: speechView(row) };
  }
  const heartbeat = await redis.get(SPEECH_HEARTBEAT).catch(() => null);
  return {
    capabilities: {
      configured: speechServiceReady(),
      provider: selectedSpeechProvider(),
      externalProcessing: selectedSpeechProvider() === "gemini",
      consentVersion: SPEECH_CONSENT_VERSION,
      workerOnline: heartbeatMatches(heartbeat),
      pronunciationAssessment: false,
      maxSeconds: MAX_SPEECH_SECONDS,
      maxBytes: MAX_SPEECH_BYTES,
    },
    items: (
      await query<SpeechRow>(
        "SELECT * FROM speech_attempts WHERE user_id=$1 AND (deleted_at IS NULL OR NOT audio_removed) ORDER BY created_at DESC LIMIT 30",
        [u.id],
      )
    ).map(speechView),
  };
});
export const POST = api("/api/speech", async (r, u) => {
  if (Number(r.headers.get("content-length") || 0) > 4_100_000)
    throw new HttpError(413, "Bản ghi vượt giới hạn 3MB.");
  const b = speechBody.parse(await r.json());
  let decoded;
  try {
    decoded = decodeSpeech(b.audio, b.mime);
  } catch (e) {
    throw new HttpError(400, (e as Error).message);
  }
  const fingerprint = speechFingerprint(
    decoded.bytes,
    b.mime,
    b.reference,
    b.provider,
  );
  const prior = (
    await query<SpeechRow>(
      "SELECT * FROM speech_attempts WHERE user_id=$1 AND request_id=$2",
      [u.id, b.requestId],
    )
  )[0];
  if (prior) {
    if (prior.fingerprint !== fingerprint)
      throw new HttpError(409, "Mã lần gửi đã dùng cho nội dung khác.");
    if (prior.deleted_at)
      throw new HttpError(410, "Bản ghi đã xóa; tạo lần gửi mới.");
    return Response.json(
      { item: speechView(prior), duplicate: true },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (selectedSpeechProvider() && b.provider !== selectedSpeechProvider())
    throw new HttpError(
      409,
      "Dịch vụ nhận dạng đã đổi. Tải lại trang và xác nhận dịch vụ trước khi gửi.",
    );
  if (!heartbeatMatches(await redis.get(SPEECH_HEARTBEAT).catch(() => null)))
    throw new HttpError(
      503,
      "Nhận dạng chưa sẵn sàng. Bản thu trên thiết bị được giữ để bạn nghe lại hoặc gửi sau.",
    );
  if (!(await rateLimit(u.id, "local-speech", 3)))
    throw new HttpError(429, "Hãy chờ trước khi gửi thêm bản ghi.");
  const id = randomUUID();
  const key = speechFileKey(u.id, id, decoded.format);
  let row: SpeechRow;
  try {
    row = (
      await query<SpeechRow>(
        "INSERT INTO speech_attempts(id,user_id,request_id,fingerprint,file_key,mime,reference,provider,consent_version,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'staging') RETURNING *",
        [
          id,
          u.id,
          b.requestId,
          fingerprint,
          key,
          b.mime,
          b.reference,
          b.provider,
          b.consentVersion,
        ],
      )
    )[0];
  } catch (e) {
    if ((e as { code?: string }).code === "23505") {
      const duplicate = (
        await query<SpeechRow>(
          "SELECT * FROM speech_attempts WHERE user_id=$1 AND request_id=$2",
          [u.id, b.requestId],
        )
      )[0];
      if (duplicate) {
        if (duplicate.fingerprint !== fingerprint)
          throw new HttpError(409, "Mã lần gửi đã dùng cho nội dung khác.");
        if (duplicate.deleted_at) throw new HttpError(410, "Bản ghi đã xóa.");
        return Response.json(
          { item: speechView(duplicate), duplicate: true },
          { status: 202, headers: { "Cache-Control": "no-store" } },
        );
      }
      throw new HttpError(
        429,
        "Bạn đang có một bản ghi chờ xử lý. Hãy đợi hoặc xóa bản đó trước.",
      );
    }
    throw e;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const locked = (
      await client.query(
        "SELECT id FROM speech_attempts WHERE id=$1 AND deleted_at IS NULL FOR UPDATE",
        [id],
      )
    ).rows[0];
    if (!locked) throw new HttpError(410, "Bản ghi đã xóa.");
    await writeSpeechAudio(key, decoded.bytes);
    row = (
      await client.query<SpeechRow>(
        "UPDATE speech_attempts SET status='queued',updated_at=now() WHERE id=$1 AND deleted_at IS NULL RETURNING *",
        [id],
      )
    ).rows[0];
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e instanceof HttpError) throw e;
    await query(
      "UPDATE speech_attempts SET status='failed',error='Chưa lưu được bản ghi. Bạn có thể thử lại.',updated_at=now() WHERE id=$1 AND deleted_at IS NULL AND status='staging'",
      [id],
    );
    throw new HttpError(
      503,
      "Chưa lưu được bản ghi. Bản thu trên thiết bị vẫn được giữ.",
    );
  } finally {
    client.release();
  }
  // A deletion may win while the file is being staged. Never enqueue/revive it.
  if (!row) {
    await removeSpeechAudio(key);
    throw new HttpError(410, "Bản ghi đã được xóa.");
  }
  await enqueueSpeech(id).catch(() => {
    /* SQL outbox is retried by the worker. */
  });
  return Response.json(
    { item: speechView(row), duplicate: false },
    { status: 202, headers: { "Cache-Control": "no-store" } },
  );
});
export const DELETE = api("/api/speech", async (r, u) => {
  const b = z
    .object({ id: z.string().uuid() })
    .strict()
    .parse(await r.json());
  const row = (
    await query<SpeechRow>(
      "UPDATE speech_attempts SET status='deleted',transcript=NULL,reference='',error=NULL,deleted_at=COALESCE(deleted_at,now()),updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *",
      [b.id, u.id],
    )
  )[0];
  if (!row) throw new HttpError(404, "Không tìm thấy bản ghi.");
  try {
    await removeSpeechAudio(row.file_key);
  } catch {
    throw new HttpError(
      503,
      "Đã chặn truy cập bản ghi, nhưng chưa xóa được file. Hãy thử xóa lại.",
    );
  }
  await query(
    "UPDATE speech_attempts SET audio_removed=true WHERE id=$1 AND user_id=$2",
    [b.id, u.id],
  );
  return { deleted: true };
});
