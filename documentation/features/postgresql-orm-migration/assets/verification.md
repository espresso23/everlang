# Verification — 2026-11-01

Branch refactor/typeorm-data-access, baseline25b96d3. No private rows, tokens, connection secrets or backup contents in this evidence.

- PASS PostgreSQL existing install adoption: restored pre-cutover dump into disposable everlang_orm_adoption_20261101;24table row hashes, column/default/nullability types, every index/check/FK/unique definition unchanged.8historical migrations adopted,1new bucket migration applied; second run0.
- PASS fresh install: everlang_orm_fresh_20261101 bootstrapped9migrations; second run0. TypeORM25mapped entities. Legacy schema_migrations retained only in upgraded installations.
- PASS real PG operations: JSONB object/nested/array/Korean roundtrip;1536vector insert and nearest-neighbor ordering; targeted DO NOTHING preserves existing value; profile upsert; rollback leaves no QA user; malformed ORM prefix rejected before further DDL.
- PASS concurrency:24parallel calls, exactly7allowed with max7 in one bucket; Postgres-authoritative limiter uses no Redis.
- PASS78unit tests/15files; lint; workspace and tools typecheck; backend boundary gate. Final Docker/browser/outage/cutover results recorded after execution below.

Reproduce: use disposable databases matching the guard in tests/integration/orm-preservation.ts. Provide DATABASE_URL privately, then node --env-file=.env --import tsx tests/integration/orm-preservation.ts. The adoption database must be an unmodified restore of001–008; fresh must be empty. Re-running the probe needs a fresh disposable database because the first run explicitly expects migration application. Production history re-run is idempotent independently.

External Google OAuth/AI/ASR/KRdict/production SMTP/HTTPS verification remains outside this migration; no paid provider calls used to fabricate parity evidence.

Native runtime faults PASS: terminated only owned idle PG connection, pool recovered; Redis cooldown1345ms, two attempts; fatal exception/rejection exit1; providerCalls0. Docker API/worker/web build PASS; no old dist/sql in image. CLI import fixture PASS (1new/0repeat/owner guard/Mongo originals/cleanup); test fixture cleanup explicitly removes restrictive legacy_imports FK before user.

First expanded29-test run27PASS/2FAIL: outage probe could wait for reconnect instead of returning degraded, and two catalogue suites reused one fixed admin email. Fixed readiness status check +2s Redis commandTimeout; separate QA editor email via E2E_CATALOG_UI_EMAIL. No relaxation of production authentication/rate limits. Final run results below.

## Final candidate / local cutover

PASS29/29Playwright (2.8m),78/78unit, lint, workspace/tools typecheck, Docker API/worker/web build, docs/plan/backend gates. Native private audio/ownership, auth replay/two tabs, knowledge/catalogue authoring/quota/CAS/FSRS/clock, extended exams/daily plan, Editorial/audio/profile and Redis resilience all covered. E2E_CATALOG_UI_EMAIL chooses a separate QA admin so full catalogue and editor tests do not share accounts.

15:50–15:52+07:00 backup20261101-155035 (PG/Mongo/Redis/media, private); main queues wait/active/delayed0; API/worker stopped for consistent snapshot. Latest PG backup restored into owned QA then24table adoption schema/data/index/constraint preservation PASS. Main migration applied1, re-run0; both before restart and after API/worker/web/gateway restart24table preservation PASS. Ready200/status ready/queueAvailable true. Postcutover2smoke PASS (6.0s+2.1s), no test user writes to main. Pre-ORM image tags kept offline for rollback; ninth migration additive.

Owned QA cleanup: nest-qa-api/worker/web/gateway, orm-qa-redis, everlang-orm-pg-proxy;3QA PostgreSQL DBs everlang_nest_qa_20261101/everlang_orm_adoption_20261101/everlang_orm_fresh_20261101, Mongo everlang_nest_qa_20261101 and langz_nest_qa_media. Pre-existing everlang_restore_check and all production volumes/namespaces retained. Screenshots overwritten by regression restored; diagram retained. No commit/merge/push during this task; parallel workflow/skills edits preserved.
