# PostgreSQL ORM migration

2026-11-01; feature-id postgresql-orm-migration; branch refactor/typeorm-data-access. Implemented; verified local; human QA pending (Review). Specification created before implementation. User requests ORM throughout backend; PostgreSQL moves to TypeORM, MongoDB keeps its existing Mongoose ODM. No switch of database engine or user-facing layout/API.

REQ01: every runtime PostgreSQL CRUD in API/auth/backend services/workers/import tooling uses mapped entities, repositories or TypeORM QueryBuilder; remove pg Pool/query facade, no raw-SQL compatibility wrapper. REQ02: preserve all IDs/password hashes/identity subjects/data/schema/indices/checks and query response shapes; synchronize/dropSchema disabled. REQ03: keep transaction connection identity, row locks/CAS/idempotency/advisory locks, JSONB/vector/partial-index semantics. REQ04: TypeORM owns lifecycle and migrations; historical001–008 unchanged, adopt completed legacy migration prefix without reapplying it, support empty DB. Native SQL only in historical migrations and a documented narrow infrastructure helper for PostgreSQL advisory locks/readiness. REQ05: global safe exception/logging, graceful shutdown and independent regression/restore verification; docs/code-map/HANDOFF current.

[Design](system-design.md) · [Functions](functions.md) · [UI](ui.md) · [Audit](audit.md).

REQ06 (owner chọn best effort khi Redis down): PostgreSQL authoritative rate limit, auth/read/save tiếp tục; queue503/QUEUE_UNAVAILABLE, ready200 degraded, phục hồi queue khi Redis trở lại. Không bảo đảm provider/cache khác hoạt động khi dependency riêng lỗi.
