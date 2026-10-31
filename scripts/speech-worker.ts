import { Worker } from "bullmq";
import Redis from "ioredis";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { query, pool } from "../lib/sql";
import { redis } from "../lib/redis";
import {
  getSpeechQueue,
  enqueueSpeech,
  SPEECH_QUEUE,
  SPEECH_HEARTBEAT,
} from "../lib/speech/queue";
import {
  SPEECH_ENGINE,
  SPEECH_MODEL,
  SPEECH_MODEL_SHA256,
  type SpeechRow,
} from "../lib/speech/contract";
import { transcribeLocal, SpeechInputError } from "../lib/speech/transcribe";
import { hasSpeechAudio, removeSpeechAudio } from "../lib/speech/storage";
import { speechRuntime } from "../lib/speech/runtime";
import {
  selectedSpeechProvider,
  speechServiceReady,
  GEMINI_SPEECH_MODEL,
} from "../lib/speech/provider";
import { SpeechServiceError } from "../lib/speech/gemini";
import {
  installProcessErrorHandlers,
  guardedTask,
} from "../lib/process-errors";
import { logError } from "../lib/logger";

installProcessErrorHandlers("speech-worker");

const provider = selectedSpeechProvider();
async function verifyRuntime() {
  if (!speechServiceReady()) throw new Error("Speech provider not configured");
  if (provider === "gemini") return;
  await access((await speechRuntime()).binary);
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(
    process.env.WHISPER_MODEL_PATH || "/models/ggml-base.bin",
  ))
    hash.update(chunk);
  if (hash.digest("hex") !== SPEECH_MODEL_SHA256)
    throw new Error("Whisper model checksum mismatch");
}
await verifyRuntime().catch(() => {
  console.error(
    "Speech runtime/model unavailable or invalid. Run model setup and check read-only mounts.",
  );
  process.exit(1);
});
const workerRedis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null },
);
workerRedis.on("error", () => {});
const worker = new Worker(
  SPEECH_QUEUE,
  async (job) => {
    const row = (
      await query<SpeechRow>(
        "UPDATE speech_attempts SET status='active',error=NULL,updated_at=now() WHERE id=$1 AND deleted_at IS NULL AND status IN ('queued','active') RETURNING *",
        [job.data.id],
      )
    )[0];
    if (!row) return;
    try {
      if (row.provider !== provider)
        throw new SpeechServiceError(
          "Cấu hình nhận dạng đã đổi. Hãy tạo bản gửi mới và xác nhận dịch vụ xử lý.",
        );
      const result = await transcribeLocal(
        row.file_key,
        row.mime,
        row.provider,
      );
      await query(
        "UPDATE speech_attempts SET status='completed',transcript=$2,model=$3,engine=$4,elapsed_ms=$5,duration_seconds=$6,error=NULL,updated_at=now() WHERE id=$1 AND deleted_at IS NULL AND status='active'",
        [
          row.id,
          result.transcript,
          result.model,
          result.engine,
          result.elapsedMs,
          result.duration,
        ],
      );
    } catch (e) {
      const message =
        e instanceof SpeechInputError || e instanceof SpeechServiceError
          ? e.message
          : "Chưa xử lý được bản ghi. Bạn có thể nghe lại và thử gửi bản mới.";
      const final =
        e instanceof SpeechInputError ||
        (e instanceof SpeechServiceError && !e.retryable) ||
        job.attemptsMade + 1 >= (job.opts.attempts || 1);
      await query(
        "UPDATE speech_attempts SET status=$2,error=$3,updated_at=now() WHERE id=$1 AND deleted_at IS NULL AND status='active'",
        [row.id, final ? "failed" : "queued", message],
      );
      if (!final) throw new Error("Speech transient failure");
    }
  },
  { connection: workerRedis, concurrency: 1, lockDuration: 180000 },
);
worker.on("error", (error) => logError("speech.worker.error", error));
worker.on("failed", async (job) => {
  try {
    if (job && job.attemptsMade >= (job.opts.attempts || 1))
      await query(
        "UPDATE speech_attempts SET status='failed',error='Xử lý bản ghi bị gián đoạn. Hãy thử lại.',updated_at=now() WHERE id=$1 AND deleted_at IS NULL AND status NOT IN ('completed','failed')",
        [job.data.id],
      );
  } catch {
    console.error(
      "Speech failure status could not be saved; recovery will retry.",
    );
  }
});
let recovering = false;
async function recoverSpeech() {
  if (recovering) return;
  recovering = true;
  try {
    await redis.set(
      SPEECH_HEARTBEAT,
      JSON.stringify({
        provider,
        engine:
          provider === "gemini"
            ? "gemini-api/generateContent-v1beta"
            : SPEECH_ENGINE,
        model: provider === "gemini" ? GEMINI_SPEECH_MODEL : SPEECH_MODEL,
      }),
      "EX",
      30,
    );
    const staged = await query<SpeechRow>(
      "SELECT * FROM speech_attempts WHERE status='staging' AND deleted_at IS NULL AND updated_at<now()-interval '2 minutes' LIMIT 30",
    );
    for (const row of staged)
      await query(
        "UPDATE speech_attempts SET status=$2,error=$3,updated_at=now() WHERE id=$1 AND status='staging' AND deleted_at IS NULL",
        [
          row.id,
          (await hasSpeechAudio(row.file_key)) ? "queued" : "failed",
          "Bản gửi bị gián đoạn; kiểm tra lại bản ghi.",
        ],
      );
    const pending = await query<SpeechRow>(
      "SELECT * FROM speech_attempts WHERE deleted_at IS NULL AND status IN ('queued','active') ORDER BY created_at LIMIT 50",
    );
    for (const row of pending) await enqueueSpeech(row.id);
    const deleted = await query<SpeechRow>(
      "SELECT * FROM speech_attempts WHERE deleted_at IS NOT NULL AND NOT audio_removed LIMIT 30",
    );
    for (const row of deleted) {
      try {
        await removeSpeechAudio(row.file_key);
        await query(
          "UPDATE speech_attempts SET audio_removed=true WHERE id=$1 AND deleted_at IS NOT NULL",
          [row.id],
        );
      } catch {
        /* Retry only these server-generated paths next pass. */
      }
    }
    await query(
      "DELETE FROM speech_attempts WHERE deleted_at<now()-interval '7 days' AND audio_removed",
    );
  } finally {
    recovering = false;
  }
}
await guardedTask("speech.recovery.error", recoverSpeech);
const timer = setInterval(() => {
  void guardedTask("speech.recovery.error", recoverSpeech);
}, 10000);
console.info("EverLang speech worker ready: concurrency1; transcript only.");
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    clearInterval(timer);
    const deadline = setTimeout(() => process.exit(1), 15000);
    deadline.unref();
    void (async () => {
      await redis.del(SPEECH_HEARTBEAT).catch(() => {});
      await worker.close();
      await getSpeechQueue().close();
      await workerRedis.quit();
      await redis.quit();
      await pool.end();
      clearTimeout(deadline);
      process.exit(0);
    })().catch((error) => {
      logError("speech.shutdown.error", error);
      process.exit(1);
    });
  });
