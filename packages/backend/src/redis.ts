import Redis from "ioredis";
import { CorrelatedQueue as Queue } from "./queue";
const state = globalThis as unknown as {
  everlangRedis?: Redis;
  everlangQueue?: Queue;
};
export const redis =
  state.everlangRedis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    connectTimeout: 3000,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 300, 1000)),
  });
redis.on("error", () => {
  /* Request/worker boundaries report availability without connection credentials. */
});
export function getGradingQueue() {
  return (state.everlangQueue ??= new Queue("everlang-grading", {
    connection: redis,
  }));
}
if (process.env.NODE_ENV !== "production") {
  state.everlangRedis = redis;
}
export async function rateLimit(userId: string, action: string, max = 20) {
  const key = `rate:${action}:${userId}:${Math.floor(Date.now() / 60000)}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 120);
  return n <= max;
}
