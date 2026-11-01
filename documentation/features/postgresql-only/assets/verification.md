# Verification — 2026-11-01

No learner rows/tokens/connection credentials stored here. Source six collections: sentences100, exams1, knowledge_entries13, vocabulary_catalog53, submissions5, usersentencestates0. Every document archived in legacy_documents; first four also mapped into operational content tables. Per-document canonical SHA256 compared with source; source dates/ObjectIDs normalized for operational documents, raw relaxed EJSON preserved in archive. Entire source6collection snapshot count172. Existing content statuses retained:13knowledge and53catalogue remain drafts; no corpus was auto-approved.

## Reproduce in isolated QA

1. Export a private source snapshot using scripts/export-mongo-snapshot.js through mongosh against the explicit source database. Keep it outside Git. Back up PG/Redis/media. Restore the PG backup into a disposable database named everlang_pgonly_qa_20261101.
2. Set DATABASE_URL privately to that QA database; `npx tsx tests/integration/postgresql-content.ts <private-snapshot.json>`. It migrates/imports/verifies old business hashes, rerun0, atomic conflict rollback, CAS, latest-before-search, pinned references and exam bootstrap identity. It creates QA fixtures; never target the real database. Source guard rejects other database names.
3. Fresh empty DB named everlang_orm_fresh_20261101: set DATABASE_URL privately and `npx tsx tests/integration/orm-preservation.ts`: PASS10migrations/30mappings/rerun0/JSONB/vector/rollback/history guard/quota24→7.
4. Explicit legacy import probe against the QA DB: `node --import tsx tests/integration/orm-import-fixture.mjs`: PASS1new/0repeat/owner guard/archive preserved/cleanup.
5. Candidate uses tests/integration/compose.nest-qa.yml + compose.orm-qa.yml; override QA API/worker DATABASE_URL to the disposable PostgreSQL container, no Mongo env/connection. Use own Redis; same-origin gateway3002. Enable E2E_AUTH_TESTS/E2E_EXTENDED_TESTS/E2E_NO_AI_KEY/E2E_KNOWLEDGE/E2E_CATALOG/E2E_CATALOG_UI/E2E_NATIVE_MEDIA/E2E_ORM_REDIS_OUTAGE/E2E_SPEECH/E2E_SPEECH_DISABLED=1, E2E_BASE_URL=http://localhost:3002, E2E_CATALOG_UI_EMAIL=catalogue-qa-ui-admin@example.test; `npx playwright test`:29/29,2.6m. Worker has no provider key; speech disabled; fixture audio/TTS does not certify pronunciation.
6. Runtime checks: `npm test`80/80; `npm run lint`; `npm run typecheck`; `npx tsc -p tsconfig.tools.json --noEmit`; `npm run backend:check`; `npm run docs:check`; `npm run plan:check`; Docker API/worker/web build PASS. Native config regression red required MONGODB_URI then green after removal.

## Actual local cutover

2026-11-01 18:40–18:42+07:00. Queues empty; API/worker stopped; backup20261101-184025 restored and tested in owned PG before main migration. Main applied1migration, re-run0. Snapshot import172new, rerun0, source hashes all equal;25existing tables unchanged before start. Poststart24stable business table rows and all old schema/index/constraints unchanged; rate-limit expiry bucket changed normally after auth smoke and is not learner data loss. Mongo container stopped and readiness remains200ready/queueAvailable true. Postcutover Playwright sign-in/anonymous-domain smoke2/2,5.2s; no QA accounts/content written to main.

Main counts after cutover: content_sentences100, content_exams1, knowledge_entries13, vocabulary_catalog53, legacy_documents172. Redis/media unchanged in responsibility. Main API confirms Mongo environment absent and mongoose/mongodb modules absent. Previous runtime images retained as everlang-before-pgonly-api:local, everlang-before-pgonly-worker:local, everlang-before-pgonly-web:local. Full rollback after new writes requires reconciliation; no destructive down or blind restore. Latest PG backup restoration verified; full production rollback/recovery after ongoing writes is NOT VERIFIED.

Task-owned QA API/worker/web/gateway/Redis/PostgreSQL containers and media volume cleaned. Retained user Mongo volume/source backups are intentionally untouched. Screenshot desktop/mobile depicts a QA fixture successfully saved in SRS with pinned older revision; published course quality remains owner review.

[Durable count/hash summary](preservation-summary.json) contains only collection counts/digests and verification totals, no private rows.
