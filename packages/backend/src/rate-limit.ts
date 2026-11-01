import { createHash } from "node:crypto";
import { createQueryRunner, rollback } from "./orm";
import { Entities } from "./entities";
import { logError } from "./logger";
let nextCleanup = 0;
export function rateLimitBucket(
  identity: string,
  action: string,
  timestamp = Date.now(),
) {
  const minute = Math.floor(timestamp / 60000);
  return {
    key: createHash("sha256")
      .update(JSON.stringify([identity, action, minute]))
      .digest("hex"),
    expires: new Date((minute + 2) * 60000),
  };
}
// PostgreSQL is the authority, so Redis outage/recovery cannot reset a quota.
// Authentication already requires PostgreSQL; this adds no new availability dependency.
export async function rateLimit(identity: string, action: string, max = 20) {
  const bucket = rateLimitBucket(identity, action);
  const runner = await createQueryRunner();
  try {
    await runner.startTransaction();
    await runner.manager
      .createQueryBuilder()
      .insert()
      .into(Entities.rate_limit_buckets)
      .values({ bucket_key: bucket.key, count: 0, expires_at: bucket.expires })
      .orIgnore()
      .execute();
    const result = await runner.manager
      .createQueryBuilder()
      .update(Entities.rate_limit_buckets)
      .set({ count: () => "count+1" })
      .where("bucket_key=:key", { key: bucket.key })
      .returning("count")
      .execute();
    await runner.commitTransaction();
    if (Date.now() >= nextCleanup) {
      nextCleanup = Date.now() + 60000;
      await runner.manager
        .createQueryBuilder()
        .delete()
        .from(Entities.rate_limit_buckets)
        .where("expires_at<now()")
        .execute()
        .catch((error) => logError("rate_limit.cleanup.failed", error));
    }
    return Number(result.raw[0].count) <= max;
  } catch (error) {
    await rollback(runner);
    throw error;
  } finally {
    await runner.release();
  }
}
