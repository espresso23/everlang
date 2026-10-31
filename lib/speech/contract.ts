import { createHash } from "node:crypto";
import { z } from "zod";
import { SPEECH_CONSENT_VERSION } from "./provider";

export const MAX_SPEECH_BYTES = 3_000_000;
export const MAX_SPEECH_SECONDS = 20;
export const SPEECH_ENGINE = "whisper.cpp/v1.9.5";
export const SPEECH_MODEL = "base-multilingual";
export const SPEECH_MODEL_SHA256 =
  "60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe";
export const speechBody = z
  .object({
    requestId: z.string().uuid(),
    audio: z.string().min(16).max(4_000_000),
    mime: z.enum(["audio/webm", "audio/wav", "audio/mp4"]),
    reference: z.string().trim().max(300).default(""),
    consent: z.literal(true),
    provider: z.enum(["whispercpp", "gemini"]),
    consentVersion: z.literal(SPEECH_CONSENT_VERSION),
  })
  .strict();
export function decodeSpeech(audio: string, mime: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(audio) || audio.length % 4 !== 0)
    throw new Error("Audio mã hóa không hợp lệ.");
  const bytes = Buffer.from(audio, "base64");
  if (bytes.length > MAX_SPEECH_BYTES) throw new Error("Audio vượt quá 3MB.");
  const format =
    mime === "audio/wav" &&
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WAVE"
      ? "wav"
      : mime === "audio/webm" &&
          bytes.subarray(0, 4).toString("hex") === "1a45dfa3"
        ? "webm"
        : mime === "audio/mp4" && bytes.subarray(4, 8).toString() === "ftyp"
          ? "m4a"
          : null;
  if (!format || bytes.length < 44)
    throw new Error("Định dạng audio không khớp hoặc file không hợp lệ.");
  return { bytes, format };
}
export function speechFingerprint(
  bytes: Buffer,
  mime: string,
  reference: string,
  provider = "whispercpp",
) {
  return createHash("sha256")
    .update(provider + "\0" + mime + "\0" + reference + "\0")
    .update(bytes)
    .digest("hex");
}
export function speechFileKey(userId: string, id: string, extension: string) {
  z.string().uuid().parse(id);
  if (!["wav", "webm", "m4a"].includes(extension))
    throw new Error("Unsupported format");
  return `${createHash("sha256").update(userId).digest("hex")}/${id}.${extension}`;
}
export function validSpeechFileKey(key: string) {
  return /^[a-f0-9]{64}\/[a-f0-9-]{36}\.(wav|webm|m4a)$/.test(key);
}
export type SpeechRow = {
  id: string;
  user_id: string;
  request_id: string;
  fingerprint: string;
  file_key: string;
  provider: "whispercpp" | "gemini";
  consent_version: string;
  mime: string;
  reference: string;
  status: "staging" | "queued" | "active" | "completed" | "failed" | "deleted";
  transcript: string | null;
  error: string | null;
  model: string | null;
  engine: string | null;
  elapsed_ms: number | null;
  duration_seconds: number | null;
  created_at: string;
  deleted_at: string | null;
  audio_removed: boolean;
};
export function speechView(row: SpeechRow) {
  return {
    id: row.id,
    status: row.status,
    provider: row.provider,
    reference: row.reference,
    transcript: row.transcript,
    error: row.error,
    model: row.model,
    engine: row.engine,
    elapsedMs: row.elapsed_ms,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
    audioRemoved: row.audio_removed,
  };
}
