import { rateLimit } from "@everlang/backend/rate-limit";
import {
  ormDataSource,
  createQueryRunner,
  rollback,
} from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { redis } from "@everlang/backend/redis";
import {
  speechBody,
  decodeSpeech,
  speechFingerprint,
  speechFileKey,
  speechView,
  type SpeechRow,
  MAX_SPEECH_SECONDS,
  MAX_SPEECH_BYTES,
} from "@everlang/backend/speech/contract";
import {
  writeSpeechAudio,
  removeSpeechAudio,
} from "@everlang/backend/speech/storage";
import {
  selectedSpeechProvider,
  speechServiceReady,
  heartbeatMatches,
  SPEECH_CONSENT_VERSION,
} from "@everlang/backend/speech/provider";
import {
  enqueueSpeech,
  SPEECH_HEARTBEAT,
} from "@everlang/backend/speech/queue";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class SpeechService {
  async get(r: Request, u: Viewer) {
    const id = queryParams(r).get("id");
    if (id) {
      z.string().uuid().parse(id);
      const row = (
        await ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.speech_attempts, "row")
          .where("id=:p1 AND user_id=:p2 AND deleted_at IS NULL")
          .setParameters({ p1: id, p2: u.id })
          .getRawMany<SpeechRow>()
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
        await ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.speech_attempts, "row")
          .where("user_id=:p1 AND (deleted_at IS NULL OR NOT audio_removed)")
          .orderBy("created_at", "DESC")
          .limit(30)
          .setParameters({ p1: u.id })
          .getRawMany<SpeechRow>()
      ).map(speechView),
    };
  }
  async post(r: Request, u: Viewer) {
    if (Number(r.get("content-length") || 0) > 4_100_000)
      throw new HttpError(413, "Bản ghi vượt giới hạn 3MB.");
    const b = speechBody.parse(r.body);
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
      await ormDataSource
        .createQueryBuilder()
        .select(["*"])
        .from(Entities.speech_attempts, "row")
        .where("user_id=:p1 AND request_id=:p2")
        .setParameters({ p1: u.id, p2: b.requestId })
        .getRawMany<SpeechRow>()
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
        await ormDataSource
          .createQueryBuilder()
          .insert()
          .into(Entities.speech_attempts, [
            "id",
            "user_id",
            "request_id",
            "fingerprint",
            "file_key",
            "mime",
            "reference",
            "provider",
            "consent_version",
            "status",
          ])
          .values({
            id: () => ":p1",
            user_id: () => ":p2",
            request_id: () => ":p3",
            fingerprint: () => ":p4",
            file_key: () => ":p5",
            mime: () => ":p6",
            reference: () => ":p7",
            provider: () => ":p8",
            consent_version: () => ":p9",
            status: () => "'staging'",
          })
          .updateEntity(false)
          .returning("*")
          .setParameters({
            p1: id,
            p2: u.id,
            p3: b.requestId,
            p4: fingerprint,
            p5: key,
            p6: b.mime,
            p7: b.reference,
            p8: b.provider,
            p9: b.consentVersion,
          })
          .execute()
          .then((result) => result.raw)
      )[0];
    } catch (e) {
      if ((e as { code?: string }).code === "23505") {
        const duplicate = (
          await ormDataSource
            .createQueryBuilder()
            .select(["*"])
            .from(Entities.speech_attempts, "row")
            .where("user_id=:p1 AND request_id=:p2")
            .setParameters({ p1: u.id, p2: b.requestId })
            .getRawMany<SpeechRow>()
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
    const client = await createQueryRunner();
    try {
      await client.startTransaction();
      const locked = (
        await client.manager
          .createQueryBuilder()
          .select(["id"])
          .from(Entities.speech_attempts, "row")
          .where("id=:p1 AND deleted_at IS NULL")
          .setLock("pessimistic_write")
          .setParameters({ p1: id })
          .getRawMany()
      )[0];
      if (!locked) throw new HttpError(410, "Bản ghi đã xóa.");
      await writeSpeechAudio(key, decoded.bytes);
      row = (
        await client.manager
          .createQueryBuilder()
          .update(Entities.speech_attempts)
          .set({ status: () => "'queued'", updated_at: () => "now()" })
          .where("id=:p1 AND deleted_at IS NULL")
          .returning("*")
          .setParameters({ p1: id })
          .execute()
          .then((result) => result.raw)
      )[0];
      await client.commitTransaction();
    } catch (e) {
      await rollback(client);
      if (e instanceof HttpError) throw e;
      await ormDataSource
        .createQueryBuilder()
        .update(Entities.speech_attempts)
        .set({
          status: () => "'failed'",
          error: () => "'Chưa lưu được bản ghi. Bạn có thể thử lại.'",
          updated_at: () => "now()",
        })
        .where("id=:p1 AND deleted_at IS NULL AND status='staging'")
        .setParameters({ p1: id })
        .execute()
        .then((result) => result.raw);
      throw new HttpError(
        503,
        "Chưa lưu được bản ghi. Bản thu trên thiết bị vẫn được giữ.",
      );
    } finally {
      await client.release();
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
  }
  async delete(r: Request, u: Viewer) {
    const b = z.object({ id: z.string().uuid() }).strict().parse(r.body);
    const row = (
      await ormDataSource
        .createQueryBuilder()
        .update(Entities.speech_attempts)
        .set({
          status: () => "'deleted'",
          transcript: () => "NULL",
          reference: () => "''",
          error: () => "NULL",
          deleted_at: () => "COALESCE(deleted_at,now())",
          updated_at: () => "now()",
        })
        .where("id=:p1 AND user_id=:p2")
        .returning("*")
        .setParameters({ p1: b.id, p2: u.id })
        .execute()
        .then((result) => result.raw)
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
    await ormDataSource
      .createQueryBuilder()
      .update(Entities.speech_attempts)
      .set({ audio_removed: () => "true" })
      .where("id=:p1 AND user_id=:p2")
      .setParameters({ p1: b.id, p2: u.id })
      .execute()
      .then((result) => result.raw);
    return { deleted: true };
  }
}
