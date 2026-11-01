import "reflect-metadata";
import {
  DataSource,
  type DataSourceOptions,
  type Logger,
  type QueryRunner,
} from "typeorm";
import { ormEntities } from "./entities";
import { ormMigrations } from "./orm-migrations";
import { log, logError } from "./logger";

// Never log SQL or bound parameters: both may contain learner text or credentials.
export const ormLogger: Logger = {
  logQuery() {},
  logQueryError() {
    log("error", "database.query.error");
  },
  logQuerySlow(time: number) {
    log("warn", "database.query.slow", { durationMs: time });
  },
  logSchemaBuild() {},
  logMigration(message: string) {
    log("info", "database.migration", { message });
  },
  log(level: "log" | "info" | "warn") {
    if (level === "warn") log("warn", "database.warning");
  },
};
export function databaseOptions(): DataSourceOptions {
  return {
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: ormEntities,
    migrations: ormMigrations,
    migrationsTableName: "orm_migrations",
    synchronize: false,
    dropSchema: false,
    migrationsRun: false,
    installExtensions: false,
    cache: false,
    connectTimeoutMS: 5000,
    extra: { max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 },
    logging: ["error", "warn"],
    logger: ormLogger,
    poolErrorHandler: (error: Error) => logError("database.pool.error", error),
  };
}
export const ormDataSource = new DataSource(databaseOptions());
let initializing: Promise<DataSource> | undefined;
export async function initializeOrm() {
  if (ormDataSource.isInitialized) return ormDataSource;
  if (!initializing)
    initializing = ormDataSource.initialize().finally(() => {
      initializing = undefined;
    });
  return initializing;
}
export async function closeOrm() {
  if (ormDataSource.isInitialized) await ormDataSource.destroy();
}
export async function createQueryRunner() {
  const source = await initializeOrm();
  const runner = source.createQueryRunner();
  await runner.connect();
  return runner;
}
export async function rollback(runner: QueryRunner) {
  if (runner.isTransactionActive) await runner.rollbackTransaction();
}
// Narrow native PostgreSQL primitives. Application CRUD must use entities/QueryBuilder.
export async function advisoryTransactionLock(
  runner: QueryRunner,
  scope: number | null,
  identity: string,
) {
  if (!runner.isTransactionActive)
    throw new Error("Advisory transaction lock requires a transaction");
  if (scope === null)
    await runner.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      identity,
    ]);
  else
    await runner.query("SELECT pg_advisory_xact_lock($1,hashtext($2))", [
      scope,
      identity,
    ]);
}
export async function databaseReady() {
  const source = await initializeOrm();
  await source.query("SELECT 1");
}

export { DataSource } from "typeorm";
export type { QueryRunner } from "typeorm";
