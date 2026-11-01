# Audit — PostgreSQL-only

2026-11-01; branch refactor/postgresql-only, base e0ad32f. Separate self-review after implementation and native/candidate/local cutover verification. Local implementation verified; Review for owner QA, not full product release Done.

| Requirement | Result | Actual evidence |
|---|---|---|
| REQ01 PG content/API parity | PASS local |100sentences/1exam/13knowledge/53catalogue imported with unchanged IDs/revisions/document hashes;30mapped schemas; same API/UI routes |
| REQ02 admin lifecycle/CAS/pinned refs | PASS |29/29candidate E2E; PG probe latest-before-search, pinned sense search, concurrent sentence CAS and imported exam identity; knowledge/catalogue fork/review/publish/version/ownership |
| REQ03 preservation/import/rollback | PASS scoped |Latest stopped-writer PG backup restored in isolated PG;25existing table row hashes unchanged by import, schema/index/constraint hashes preserved;6collections/172archived documents, rerun0, conflicting snapshot rolls back all inserts |
| REQ04 Mongo-free runtime | PASS |Compose removes Mongo prerequisite/service; package lock and clean Docker image have no mongoose/mongodb; MONGODB_URI absent; actual local Mongo container stopped while app readiness remains ready |
| REQ05 runtime regression/demo | PASS local |80unit/16files, lint/workspace+tools typecheck, backend/docs/planning gates, Docker build;29E2E/2.6m and2post-cutover smoke/5.2s; browser screenshots below |
| Owner acceptance/content review/provider/production | NOT VERIFIED |Owner QA pending; no cloud calls, no new content auto-published, speech remains disabled; unchanged production/provider quality gates |

Self-review examined source-to-destination identity, EJSON dates/raw archive, uniqueness, atomic conflict handling, SQL parameter binding, latest published selection before filters, pinned key/revision, admin guard/CAS, learner ownership, explicit legacy import ownership, worker/queue boundaries, seed idempotency and removal of config/lifecycle dependencies. No new blocker remains within this scope.

Findings fixed: copied revision fixture ID caused duplicate PK; create now allocates a new revision identity. Imported mini exam must not be duplicated by bootstrap; PG integration verifies identity/count. First candidate failed startup because AppModule still required MONGODB_URI; E2E stopped after2fail/1pass, not accepted as a run. Added pure runtime environment validator with red test failing for the exact Mongo requirement, removed the requirement, green2/2; rebuilt candidate, final29/29PASS. The broad migration was not entirely implemented test-first; focused red/green and real PG/HTTP regression provided evidence, not a fabricated TDD claim.

Cutover18:40–18:42+07:00: main grading/speech wait/active/delayed all0; stopped API/worker, backup PG/Redis/media + Mongo archive and final JSON export. Latest PG backup restore + final snapshot probe PASS before changing main. Main migration1applied/rerun0; import172new/rerun0; all25old table row/schema/index/constraint hashes equal before restart. After restart + anonymous smoke,24stable table rows and all old schema/index/constraints still equal. The transient rate_limit_buckets row changed through normal auth request quota/expiry cleanup (old expiry17:49, new18:44); this is explicitly excluded only from post-traffic row comparison, not the pre-start preservation check. No learner data differences were observed.

App localhost3000 healthy/queueAvailable true with Mongo stopped. Backup20261101-184025, final export/archive and hash snapshots remain private under .local/backups; pre-PG-only API/worker/web image tags retained. All task-owned QA containers/PG databases/media volume removed; original stopped Mongo container/volume, existing restore namespace and production volumes retained. No new branch merge/push performed.

[Verification/reproduction](assets/verification.md), [desktop](assets/learning-loop-desktop.png), [mobile](assets/learning-loop-mobile.png). Screenshots are real browser screenshots from the PG candidate using synthetic QA content/accounts; they do not certify owner-reviewed corpus. [Integration/architecture audit](../../audits/postgresql-only-integration.md).
