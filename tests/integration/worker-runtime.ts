// Explicit local integration probe. Own Redis queue and own PG connection only; no provider calls.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { spawnSync } from "node:child_process";
import { Queue, QueueEvents, Worker } from "bullmq";
import Redis from "ioredis";
import { Pool } from "pg";
import { pool, query } from "@everlang/backend/sql";

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
const name = `worker-runtime-qa-${randomUUID()}`;
const queue = new Queue(name, { connection });
const events = new QueueEvents(name, { connection });
const times: number[] = [];
const worker = new Worker(name, async () => {
  times.push(Date.now());
  if (times.length === 1) {
    await queue.rateLimit(1200);
    throw new Error("simulated429");
  }
  return "ok";
}, { connection, concurrency: 1, limiter: { max: 1, duration: 1 } });
worker.on("error", () => {});
const killer = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  await events.waitUntilReady();
  const job = await queue.add("probe", {}, { attempts: 3, backoff: { type: "exponential", delay: 100 } });
  assert.equal(await job.waitUntilFinished(events, 15000), "ok");
  assert.equal(times.length, 2);
  assert.ok(times[1] - times[0] >= 1100, "shared queue honors cooldown");
  const client = await pool.connect();
  const pid = (await client.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
  client.release();
  const idleError = once(pool, "error");
  await killer.query("SELECT pg_terminate_backend($1)", [pid]);
  await idleError;
  assert.equal((await query("SELECT 1 AS alive"))[0].alive, 1);
  for (const failure of ["throw new Error('synthetic fatal')", "Promise.reject(new Error('synthetic rejection'))"]) {
    const child = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e",
      `import {installProcessErrorHandlers} from '@everlang/backend/process-errors'; installProcessErrorHandlers('probe'); ${failure}`], { encoding: "utf8", timeout: 10000 });
    assert.equal(child.status, 1);
    assert.match(child.stderr, /process\.(?:uncaught_exception|unhandled_rejection)/);
    assert.ok(!child.stderr.includes("Emitted 'error' event"));
  }
  console.info(JSON.stringify({ result: "PASS", redisAttempts: times.length, cooldownMs: times[1] - times[0], idlePoolReconnect: true, providerCalls: 0 }));
} finally {
  await worker.close();
  await queue.obliterate({ force: true });
  await events.close();
  await queue.close();
  await connection.quit();
  await pool.end();
  await killer.end();
}
