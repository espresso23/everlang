# Function map — TypeORM

2026-11-01, branch refactor/typeorm-data-access.

| File / symbol | Hợp đồng / kiểm chứng |
|---|---|
| [orm.ts](../../../packages/backend/src/orm.ts): databaseOptions, initializeOrm, closeOrm, createQueryRunner, rollback | Một DataSource/process, init singleflight, pool10, timeout5s, không sync/drop, transaction một connection; runtime probe/QA |
| [entities.ts](../../../packages/backend/src/entities.ts): Entities, ormEntities | 25 EntitySchemas/typed interfaces, tên/type/default/null/FK/check/index hiện hữu; preservation probe so schema/index/constraint/row digest |
| [orm-migrations.ts](../../../packages/backend/src/orm-migrations.ts): migrateOrm, historicalMigrations, RateLimitFallback1730000000008 | Lock814921, adopt prefix001–008 atomically; TypeORM history, ninth bucket migration, reject history hở/lạ; fresh/adoption/re-run/corrupt-history probe |
| orm.ts: advisoryTransactionLock, databaseReady | Hai native SQL primitive cho lock/readiness; không generic raw query wrapper |
| [DatabaseModule](../../../apps/api/src/database.module.ts), [WorkerModule](../../../apps/worker/src/main.ts) | Nest TypeOrmModule init/close. CLI [migrate](../../../scripts/migrate.ts), [import](../../../scripts/import-records.ts) đóng finally |
| [rate-limit.ts](../../../packages/backend/src/rate-limit.ts): rateLimitBucket, rateLimit | SHA256(identity/action/minute), atomic insert/increment trong transaction, count PostgreSQL authoritative, cleanup expiry best effort; 24 concurrent/7 admitted |
| [queue.ts](../../../packages/backend/src/queue.ts): CorrelatedQueue.add | Giữ requestId, error listener an toàn, enqueue thất bại503/QUEUE_UNAVAILABLE; durable record giữ nguyên; reconnect capped5s |
| [HealthController.ready](../../../apps/api/src/health.controller.ts) | PG+Mongo bắt buộc; Redis down trả200/status degraded/queueAvailable false |
| [logger.ts](../../../packages/backend/src/logger.ts): logError; orm.ts: ormLogger | QueryFailedError không SQL/params/driver echo; code whitelist, request context; unit runtime-errors |
| [orm-preservation.ts](../../../tests/integration/orm-preservation.ts) | QA guard; schema/data/index/constraint hashes không lộ rows; fresh/adoption/idempotence/history/JSONB/conflict/quota/rollback |
| [orm-resilience.spec.ts](../../../tests/e2e/orm-resilience.spec.ts) | Chỉ QA Redis riêng, login/profile/draft CAS/queue503/recovery; restore Redis trong finally |

CRUD giữ trong từng canonical feature, xem [source ownership](../../code-map.json). Auth credential password/refresh used_at giữ alias explicit; profile dùng upsert user_id; grading/knowledge/import conflict target giữ chính xác; catalogue progress update version trong per-user advisory lock; FSRS/exam giữ row locks/CAS. JSONB insert dùng bound expression với JSON.stringify DTO hiện hữu để tránh double encoding; vector bound cast giữ1536. Không facade nhận nguyên SQL.

[orm-import-fixture.mjs](../../../tests/integration/orm-import-fixture.mjs) kiểm CLI thật trong QA PG/Mongo: import1/reimport0, thiếu confirm/đổi owner bị chặn, Mongo originals còn nguyên, cleanup explicit legacy_imports trước user (FK restrictive). CLI migrate/import cài process error handlers chung, không để uncaught QueryFailedError dump query/params.
