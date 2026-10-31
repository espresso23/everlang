import { Pool, type QueryResultRow } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { logError } from "../logger";

const shared = globalThis as unknown as { everlangPool?: Pool };
export const pool =
  shared.everlangPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
// An idle socket can fail outside any awaited query. Never log the attached pg client.
if (!pool.listenerCount("error")) pool.on("error", (error) => logError("database.pool.error", error));
if (process.env.NODE_ENV !== "production") shared.everlangPool = pool;
export const db = drizzle(pool, { schema });
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  values: unknown[] = [],
) {
  return (await pool.query<T>(sql, values)).rows;
}
