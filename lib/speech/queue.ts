import { Queue } from "bullmq";
import { redis } from "../redis";

const shared = globalThis as typeof globalThis & { speechQueue?: Queue };
export const SPEECH_QUEUE = "everlang-speech";
export const SPEECH_HEARTBEAT = "everlang:speech:heartbeat";
export function getSpeechQueue() {
  return (shared.speechQueue ??= new Queue(SPEECH_QUEUE, {
    connection: redis,
  }));
}
export async function enqueueSpeech(id: string) {
  await getSpeechQueue().add(
    "transcribe",
    { id },
    {
      jobId: id,
      attempts: 2,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  );
}
