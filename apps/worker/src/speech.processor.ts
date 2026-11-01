import { type Job } from 'bullmq';
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { query } from "@everlang/backend/sql";
import { redis } from "@everlang/backend/redis";
import { enqueueSpeech, SPEECH_HEARTBEAT } from "@everlang/backend/speech/queue";
import {
  SPEECH_ENGINE,
  SPEECH_MODEL,
  SPEECH_MODEL_SHA256,
  type SpeechRow,
} from "@everlang/backend/speech/contract";
import { transcribeLocal, SpeechInputError } from "@everlang/backend/speech/transcribe";
import { hasSpeechAudio, removeSpeechAudio } from "@everlang/backend/speech/storage";
import { speechRuntime } from "@everlang/backend/speech/runtime";
import {
  selectedSpeechProvider,
  speechServiceReady,
  GEMINI_SPEECH_MODEL,
} from "@everlang/backend/speech/provider";
import { SpeechServiceError } from "@everlang/backend/speech/gemini";
import { guardedTask } from "@everlang/backend/process-errors";

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { requestContext, correlationId, log as jobLog, logError as jobError } from '@everlang/backend/logger';
import { performance } from 'node:perf_hooks';
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
@Processor('everlang-speech', {concurrency:1,lockDuration:180000})
export class SpeechProcessor extends WorkerHost {
 private timer?:ReturnType<typeof setInterval>;
 async onModuleInit(){await verifyRuntime();await guardedTask('speech.recovery.error',recoverSpeech);this.timer=setInterval(()=>void guardedTask('speech.recovery.error',recoverSpeech),10000);}
 async onModuleDestroy(){if(this.timer)clearInterval(this.timer);}
 async process(job:Job){const started=performance.now();const requestId=correlationId(job.data?.trace?.requestId);return requestContext.run({requestId,jobId:job.id,attempt:job.attemptsMade+1},async()=>{jobLog('info','job.started',{queue:job.queueName});try{return await this.execute(job)}catch(error){jobError('job.failed',error,{queue:job.queueName});throw error}finally{jobLog('info','job.finished',{queue:job.queueName,durationMs:Math.round(performance.now()-started)});}});}
 private async execute(job:Job){
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
  }
 @OnWorkerEvent('failed') onFailed(job:Job|undefined,error:Error){return requestContext.run({requestId:correlationId(job?.data?.trace?.requestId),jobId:job?.id,attempt:job?.attemptsMade},()=>this.persistFailure(job,error));}
 private async persistFailure(job:Job|undefined,_error:Error){
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
}
 @OnWorkerEvent('error') onError(error:Error){jobError('speech.worker.error',error);}
}
