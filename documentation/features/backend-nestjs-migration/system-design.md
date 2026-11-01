# System design — implementation 2026-11-01

[Ảnh system design và các luồng giao tiếp hiện tại](../../shared/architecture.md#system-design-diagram) — browser/gateway/web/API, PG/Mongo/Redis, hai worker và tích hợp tùy chọn; dùng chung ảnh chuẩn do platform-operations sở hữu.

Browser→same-origin gateway→Next web hoặc Nest API; API/worker dùng backend providers, shared browser-safe contracts. SQL/Mongo/Redis/provider/storage không vào web graph. Nest12.3.2/Node24/Express, giữ pg/Mongoose/BullMQ6. Global JWT guard/email/RBAC/ownership, CSRF+Origin cho auth cookie endpoints; JWT issuer/audience/RS256 và active session được kiểm. Refresh rotates transactional và reuse revokes family; logout/password reset revoke sessions. Native scrypt NFKC N16384/r16/p1/dk64 giữ password compatibility không adapter. OAuth Google state/nonce/PKCE, no implicit email linking. Access chỉ RAM, refresh singleflight/cross-tab lock; private audio fetch Bearer→blob/revoke.

API contracts nghiệp vụ giữ nguyên (gồm failed409 explicit retry), controllers/services native. Global exception filter {statusCode,code,error,requestId}; log UTC/level/service/environment/event/requestId/method/route/status/duration, stack server-only. Queue metadata requestId propagated by AsyncLocalStorage; workers log jobId/attempt/provider and guarded shutdown/fatal exit.

Migration008 rename và loại bỏ auth session/verification/provider tokens cũ theo kế hoạch invalidation; preserve userID/account provider/password, business FKs và source snapshots. Pause writes/drain workers→backup PG/Mongo/Redis/media→restore rehearsal→candidate→single cutover. Chưa cutover khi restore/parity/auth gate thất bại. Old images/backup offline, không runtime fallback. Lịch sử migrations/docs giữ snapshot provenance, không để code adapter cũ.

## ORM data access — 2026-11-01

PostgreSQL dùng TypeORM EntitySchema/QueryBuilder; transaction dùng một QueryRunner, giữ ownership, row lock, CAS/version, JSONB và idempotency. MongoDB vẫn Mongoose. Hợp đồng dùng chung tại [ORM design](../postgresql-orm-migration/system-design.md); chi tiết regression ở [audit tích hợp](../../audits/postgresql-orm-migration.md). UI/layout không thay đổi.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.
