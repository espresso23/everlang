# PostgreSQL-only design

Design recorded before code, 2026-11-01; implemented and verified local. Separate content_sentences/content_exams/knowledge_entries/vocabulary_catalog tables. Stable text IDs, version/status envelope, JSONB document; key/revision uniqueness and status/version checks. TypeORM QueryBuilder/repositories, no Mongoose emulation. Search operates in PG with bound parameters; newest published revision grouped before filters. Catalogue sets resolve exact published key/revision pairs. CAS updates bind status/editVersion and increment atomically.

Additive migration10; no deletion of old PG tables or Mongo volumes. Export offline Mongo snapshot including all collections. Archive exact normalized documents and hash them in PG; populate operational tables in one transaction under advisory lock. Re-run same snapshot is no-op; changed/conflicting archive or operational target aborts. Compare counts/content hashes before cutover. Stop writers for final export; backup/restore rehearsal and keep pre-cutover images. Runtime never falls back to Mongo. Code rollback uses retained Mongo snapshot plus compatible PG schema; writes after cutover require reconciliation, never blindly rollback and lose new writes.

Domain store owns content persistence/selection/CAS; services retain validation/auth. Existing learner PG transactions remain unchanged. Public API continues _id strings, dates ISO, same routes. PostgreSQL primary; Redis queue/cache; private media unchanged.

Actual proof and rollback limits are recorded in [audit](audit.md). No production load/large-corpus performance benchmark was run; JSONB indexes are not a measured latency claim.
