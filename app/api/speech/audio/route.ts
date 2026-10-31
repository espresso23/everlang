import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { query } from "@/lib/sql";
import { readSpeechAudio } from "@/lib/speech/storage";
import type { SpeechRow } from "@/lib/speech/contract";

export const GET = api("/api/speech/audio", async (r, u) => {
  const id = z.string().uuid().parse(r.nextUrl.searchParams.get("id"));
  const row = (
    await query<SpeechRow>(
      "SELECT * FROM speech_attempts WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
      [id, u.id],
    )
  )[0];
  if (!row) throw new HttpError(404, "Không tìm thấy bản ghi.");
  let bytes: Buffer;
  try {
    bytes = await readSpeechAudio(row.file_key);
  } catch {
    throw new HttpError(404, "Audio chưa có hoặc đã xóa.");
  }
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
