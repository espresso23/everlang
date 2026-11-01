import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { readSpeechAudio } from "@everlang/backend/speech/storage";
import type { SpeechRow } from "@everlang/backend/speech/contract";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { BinaryResult, queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class SpeechAudioService {
  async get(r: Request, u: Viewer) {
    const id = z.string().uuid().parse(queryParams(r).get("id"));
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
    let bytes: Buffer;
    try {
      bytes = await readSpeechAudio(row.file_key);
    } catch {
      throw new HttpError(404, "Audio chưa có hoặc đã xóa.");
    }
    return new BinaryResult(new Uint8Array(bytes), {
      headers: {
        "Content-Type": row.mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
