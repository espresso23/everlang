import { Pool, type QueryResultRow } from "pg";
import { logError } from "../logger";

const shared = globalThis as unknown as { everlangPool?: Pool };
export const pool =
  shared.everlangPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
// An idle socket can fail outside any awaited query. Never log the attached pg client.
if (!pool.listenerCount("error")) pool.on("error", (error) => logError("database.pool.error", error));
if (process.env.NODE_ENV !== "production") shared.everlangPool = pool;
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  values: unknown[] = [],
) {
  return (await pool.query<T>(sql, values)).rows;
}
