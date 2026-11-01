import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { z } from "zod";
import { speechMediaPath } from "./storage";
import { speechRuntime } from "./runtime";
import type { SpeechProvider } from "./provider";
import { transcribeGeminiWav } from "./gemini";
import { MAX_SPEECH_SECONDS, SPEECH_MODEL, SPEECH_ENGINE } from "./contract";

const execute = promisify(execFile);
const segments = z.object({
  transcription: z.array(z.object({ text: z.string() })).max(1000),
});
export class SpeechInputError extends Error {}
export function inspectSpeechPcm(wav: Buffer) {
  if (
    wav.toString("ascii", 0, 4) !== "RIFF" ||
    wav.toString("ascii", 8, 12) !== "WAVE"
  )
    throw new SpeechInputError("Audio chuẩn hóa không hợp lệ.");
  let offset = 12;
  let pcm = false;
  while (offset + 8 <= wav.length) {
    const length = wav.readUInt32LE(offset + 4);
    if (length > wav.length - offset - 8)
      throw new SpeechInputError("Audio chuẩn hóa không đầy đủ.");
    if (wav.toString("ascii", offset, offset + 4) === "fmt ") {
      pcm =
        length >= 16 &&
        wav.readUInt16LE(offset + 8) === 1 &&
        wav.readUInt16LE(offset + 10) === 1 &&
        wav.readUInt32LE(offset + 12) === 16000 &&
        wav.readUInt16LE(offset + 22) === 16;
    }
    if (wav.toString("ascii", offset, offset + 4) === "data") {
      if (!pcm) throw new SpeechInputError("Cần PCM16 mono 16kHz.");
      let total = 0;
      for (let i = offset + 8; i + 1 < offset + 8 + length; i += 2)
        total += wav.readInt16LE(i) ** 2;
      if (length % 2) throw new SpeechInputError("Audio không có đủ mẫu PCM.");
      return {
        duration: length / 32000,
        quiet:
          length < 3200 ||
          Math.sqrt(total / Math.max(1, Math.floor(length / 2))) / 32768 <
            0.0025,
      };
    }
    offset += 8 + length + (length % 2);
  }
  throw new SpeechInputError("Audio không có dữ liệu âm thanh.");
}
export function pcmIsQuiet(wav: Buffer) {
  return inspectSpeechPcm(wav).quiet;
}
export async function transcribeLocal(
  fileKey: string,
  mime: string,
  provider: SpeechProvider = "whispercpp",
) {
  const started = Date.now();
  const input = speechMediaPath(fileKey);
  const dir = await mkdtemp(path.join(os.tmpdir(), "everlang-speech-"));
  try {
    const demuxer =
      mime === "audio/wav" ? "wav" : mime === "audio/mp4" ? "mov" : "matroska";
    const { stdout } = await execute(
      "ffprobe",
      [
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-f",
        demuxer,
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        input,
      ],
      { timeout: 10000, maxBuffer: 64000 },
    );
    const reportedDuration = Number(JSON.parse(stdout).format?.duration);
    if (
      Number.isFinite(reportedDuration) &&
      reportedDuration > MAX_SPEECH_SECONDS + 0.15
    )
      throw new SpeechInputError("Bản ghi phải dài tối đa 20 giây.");
    const wav = path.join(dir, "input.wav");
    await execute(
      "ffmpeg",
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-f",
        demuxer,
        "-i",
        input,
        "-map",
        "0:a:0",
        "-vn",
        "-sn",
        "-dn",
        "-t",
        "20.3",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        "-y",
        wav,
      ],
      { timeout: 15000, maxBuffer: 64000 },
    );
    // MediaRecorder WebM often has no container Duration; decoded sample count is authoritative.
    const pcm = inspectSpeechPcm(await readFile(wav));
    const duration = pcm.duration;
    if (duration <= 0 || duration > MAX_SPEECH_SECONDS + 0.15)
      throw new SpeechInputError(
        "Bản ghi phải dài tối đa 20 giây; audio chưa được cắt để nhận dạng.",
      );
    if (pcm.quiet)
      throw new SpeechInputError(
        "Âm thanh quá nhỏ hoặc im lặng. Hãy thu lại gần microphone hơn.",
      );
    if (provider === "gemini") {
      const { redis } = await import("../redis.js");
      const result = await transcribeGeminiWav(await readFile(wav), redis);
      return { ...result, duration, elapsedMs: Date.now() - started };
    }
    const output = path.join(dir, "result");
    const threads = Math.min(
      2,
      Math.max(1, Number(process.env.SPEECH_THREADS) || 2),
    );
    const runtime = await speechRuntime();
    await execute(
      runtime.binary,
      [
        "-m",
        process.env.WHISPER_MODEL_PATH || "/models/ggml-base.bin",
        "-f",
        wav,
        "-l",
        "ko",
        "-t",
        String(threads),
        "-oj",
        "-of",
        output,
        "-np",
      ],
      { timeout: 120000, maxBuffer: 1_000_000 },
    );
    const result = segments.parse(
      JSON.parse(await readFile(output + ".json", "utf8")),
    );
    const transcript = result.transcription
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!transcript || transcript.length > 6000 || /^\[.*\]$/.test(transcript))
      throw new SpeechInputError(
        "Chưa nhận dạng được lời nói. Hãy thử thu rõ hơn.",
      );
    return {
      transcript,
      duration,
      elapsedMs: Date.now() - started,
      model: SPEECH_MODEL,
      engine: SPEECH_ENGINE,
      backend: runtime.backend,
    };
  } finally {
    // Only the directory returned by mkdtemp is removed; no user-controlled path.
    const cleanup = path.resolve(dir);
    if (
      !cleanup.startsWith(
        path.resolve(os.tmpdir()) + path.sep + "everlang-speech-",
      )
    )
      throw new Error("Unsafe speech temporary directory");
    await rm(cleanup, { recursive: true, force: true });
  }
}
