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
    commandTimeout: 2000,
    retryStrategy: (times) => Math.min(times * 300, 5000),
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
