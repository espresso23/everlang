# PostgreSQL-only primary database

2026-11-01; branch refactor/postgresql-only; implemented and verified local, human QA pending (Review); implementation authorized by owner after merging TypeORM. Canonical PRD.

Owner requires working increments with visible outcomes, removal of MongoDB, PostgreSQL as the only business database. Redis remains queue/cache; private media remains file/object storage. Preserve existing UI/API and all IDs, revisions, ownership, snapshots, FSRS and import history. No auto-publishing or content approval by agent.

REQ01: sentences, exams, knowledge and vocabulary catalogue live in typed TypeORM tables, structured envelope + JSONB content, preserving 24-hex IDs and API shapes. Latest published revision must be selected BEFORE search; set lookup uses pinned sense revision.
REQ02: authoring review/publish/fork/CAS and duplicate conflicts retain current behavior; published immutable, draft private to admin.
REQ03: export every Mongo collection to a private JSON snapshot; import atomically/idempotently with conflicting target rejection and count/hash parity. Keep originals/backups for rollback. Legacy submissions/state remain available in a PG archive for explicit owner-confirmed import; never infer account ownership.
REQ04: API/worker/seed/import/readiness and Compose run without MongoDB/Mongoose. No Mongo compatibility facade. Migration tooling consumes offline export, not runtime Mongo connection.
REQ05: fresh install, restored existing data, auth/read/admin/learning/SRS/job regressions and browser demo verified. Human QA/release gates retained.

Delivery: PB-041-T01 is the integrated, assigned migration increment: import → browse/admin → learner save/review/progress → Mongo-free cutover/demo. Shared schema plus atomic cutover made the initially proposed three development slices one coupled deliverable. PB-041-T02 is owner acceptance QA; PB-041-T03 is the owner post-merge production release decision after QA. IDs retained, explicit dependencies; no invented sprint dates/capacity or auto Done. See decisions.md for this tracking refinement.

Non-goals: change layout, replace Redis/media, add new pedagogy/scoring, claim reviewed corpus or full self-study completion. Next product priority remains reviewed content → practice → SRS → progress.

[Design](system-design.md) · [Functions](functions.md) · [UI](ui.md) · [Audit](audit.md) · [Decisions](decisions.md).

## Implemented requirement map

| Requirement | Implementation | Verification |
|---|---|---|
| REQ01 | content-entities/content-store; existing native routes | PG import/hash +29E2E |
| REQ02 | sentences.change/RevisionStore.change + existing admin validators; knowledge/listCatalog | PG CAS/latest/pinned + authoring E2E |
| REQ03 | content-import/importContentSnapshot; CLI; legacy_documents/records import | Latest backup restore,172docs parity/rerun0/atomic conflict |
| REQ04 | AppModule/validateRuntimeEnvironment, API+worker lifecycle, Compose/package lock/backup | Red/green config test, clean image, local runtime with Mongo stopped |
| REQ05 | unchanged browser routes; full native candidate and local cutover |80unit/29E2E/2deployed smoke; [audit](audit.md) |

Code links/symbols: [function map](functions.md). Remaining: owner QA and production release decision; content approval/provider gates are unchanged product work, not hidden unfinished database migration.
