# Design — TypeORM data layer

Nest API and worker initialize TypeORM through @nestjs/typeorm, using the shared backend DataSource and EntitySchema mappings. Services select mapped entities with repositories/QueryBuilder. Transaction blocks use QueryRunner on one connection, including pessimistic row locks and commit/rollback; no manual SQL BEGIN/COMMIT. Mongo models remain Mongoose, Redis remains ioredis/BullMQ.

Existing database names/columns/types/defaults are mapped explicitly; IDs never regenerated. No synchronize, auto drop, or live schema rewrite. JSONB DTOs remain objects; pgvector remains vector1536; existing partial unique indexes/checks/FKs stay authoritative. Standard ORM CRUD plus bound SQL expressions preserve PostgreSQL-specific JSON/timezone/vector features. Native advisory locks are isolated in infrastructure because TypeORM has no equivalent abstraction; never replace per-user quota lock with process-local locking.

Migration runner adopts the previously applied001–008 prefix into TypeORM history, then executes pending TypeORM migrations; rejects holes/unknown history. Historical SQL is an immutable schema bootstrap, not an active raw-SQL application data path. Rehearse adoption and fresh install on separate databases, compare schema/data digests, back up before live metadata adoption. Rollback code must remain schema compatible; no destructive down migration.

Rate limit PostgreSQL authoritative thay vì dual Redis/PG counter: atomic counter theo phút không tạo cửa sổ reset quota qua outage/recovery. Bucket key băm, expiry2 phút, cleanup mỗi phút best effort. Redis retry liên tục capped5s; Queue bắt error event, enqueue chuyển HttpError503 chuẩn. Readiness HTTP200 degraded giữ API phục vụ các luồng không cần queue. QA Redis tách service/port riêng; không fault-inject Redis của người dùng.

Entity metadata25 bao gồm24 bảng cũ +rate_limit_buckets; orm_migrations do MigrationExecutor quản lý. Fresh DB có24 business tables (không schema_migrations cũ) +ORM history; upgrade giữ bảng legacy history bất biến để provenance. Không còn runner SQL/Pool legacy; 001–008 là lịch sử bất biến hỗ trợ bootstrap.

Redis request client commandTimeout2s và readiness kiểm connection status trước PING, tránh probe chờ vòng reconnect. API Compose không chờ Redis healthy để khởi động; worker vẫn phụ thuộc Redis. Queues tự reconnect; lỗi HTTP mang requestId theo global filter.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.
