# Evidence — 2026-11-01

Branch `feature/nestjs-jwt-migration`, base `0b34a97`. No credentials, user identity, cookie/token or private audio in this evidence.

| Gate | Actual result |
|---|---|
| Vitest | PASS 77 tests / 15 files |
| ESLint | PASS 0 errors / 0 warnings after import cleanup |
| Workspace typecheck | PASS contracts/backend/API/worker/web |
| Host build | PASS contracts/backend/API/worker/web; web17 routes, no API routes |
| Native auth | PASS all private domain methods reject anonymous; RS256/cookie/CSRF/RBAC/rotation/replay/revocation/logout; two browser tabs |
| Native pipeline | PASS HTTP→PG→BullMQ→WorkerHost,3 attempts, failed status then409 explicit retry, no AI key/provider call |
| Business integration | PASS beta2, extended beta2, knowledge1,catalog1,disabled speech1,private audio1 |
| UI fixtures | PASS profile7, audio3, grading retry2, Editorial6 |
| PG restore/migration | PASS20 preserved table digests, including credential hashes/Google identities/FSRS; fresh001–008 PASS |
| Mongo restore | PASS6 collection digests,172 documents |
| Docker final candidate / cutover | PASS: final images, auth/media4tests32.3s; cutover008, ready200, post-cutover2smoke5.1s,20 table digests unchanged |
| Redis/media restore | PASS: Redis snapshot boots/PONG/19keys DB0; synthetic private-volume bytes preserved; real source media empty0files |
| Native runtime faults | PASS: real PG idle termination/reconnect, Redis cooldown1208ms, fatal exception/rejection exit1, providerCalls0 |
| Google live / external provider inference | NOT VERIFIED on native backend |

Commands actually run from repo root:

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npx tsc -p tsconfig.tools.json
npm run backend:check
$env:E2E_BASE_URL='http://localhost:3002'
$env:E2E_AUTH_TESTS='1'
$env:E2E_NO_AI_KEY='1'
npx playwright test tests/e2e/nest-auth.spec.ts
npx playwright test tests/e2e/beta.spec.ts
$env:E2E_EXTENDED_TESTS='1'
# Disposable nest-admin@example.test and a separate test learner; candidate ADMIN_EMAILS configured.
npx playwright test tests/e2e/beta.spec.ts
$env:E2E_KNOWLEDGE='1'; $env:E2E_CATALOG='1'
npx playwright test tests/e2e/knowledge.spec.ts tests/e2e/vocabulary-catalog.spec.ts
$env:E2E_SPEECH='1'; $env:E2E_SPEECH_DISABLED='1'
npx playwright test tests/e2e/speech.spec.ts
$env:E2E_NATIVE_MEDIA='1'
npx playwright test tests/e2e/private-audio.spec.ts
npx playwright test tests/e2e/profile-ui.spec.ts tests/e2e/sample-audio.spec.ts tests/e2e/grading-retry.spec.ts tests/e2e/editorial-design.spec.ts
docker compose build api app worker
```

Test accounts are disposable and must use fresh emails on rerun. Tests do not automatically delete every user/content fixture; migration QA database is isolated and can be removed after evidence capture. [Candidate Compose](../../../../tests/integration/compose.nest-qa.yml) overlays root Compose; start only `nest-qa-*` explicitly with `--no-deps`. Requires restored QA PG/Mongo database `everlang_nest_qa_20261101`, schema008 recorded, Redis database15 reserved empty, separate media volume and local Mailpit. Never change QA URL to production for fixture tests.

PG rehearsal: restore private dump to a separate `everlang_nest_restore_20261101`; copy008 to container `/tmp/nest-auth.sql`, run [preservation SQL](../../../../tests/integration/auth-preservation.sql) with `psql -v ON_ERROR_STOP=1`. This asserts all20 retained table digests before/after; old auth_session/auth_verification/provider token columns intentionally excluded. Fresh migration rehearsal used separate `everlang_nest_fresh_20261101` and all8 numbered migrations. Mongo archive restored to a separate namespace, compared every collection `dbHash` with source.

[Sanitized worker trace](tracing.json) preserves requestId/jobId/attempt/duration only. `job.finished` records the end of an attempt; failure is indicated by the preceding `job.failed` event, not a success claim. Raw traces/backups remain private outside Git. Historical provider results from the old backend are not current Nest verification.

Final maintenance snapshot `20261101-104559` private outside Git; backup script captured PG/Mongo/Redis/media, env/key snapshot separately private. Cutover03:46–03:47UTC. Migration service initially referenced stale image; corrected shared explicit `everlang-worker:local` tag,008 applied from native image and rerun idempotent. API/web/worker now explicit image tags; old backend is not running. Old auth tables absent,8 migration records, obsolete auth paths404. Post-cutover preservation20tables matched restored snapshot. All migration-owned QA containers/databases/namespaces/Redis15/private volumes removed after evidence; pre-existing namespaces/production data preserved.

## Pre-merge recheck — 2026-11-01

Baseline6435d04, owner explicitly authorized merge/main push after checking. Initial full run26PASS/1FAIL found device-clock bug in due-card selection; corrected additive GET vocabulary serverNow + client server-clock snapshot. Catalogue test checks browser -5minutes and +365days. Rerun **27PASS/0FAIL/0SKIP in2.1m**,77unit PASS, lint/typecheck/tools/host and Docker build PASS. Native runtime probe cooldown1257ms/PG reconnect/fatal exit/providerCalls0. Same test files listed above run together, with all disposable integration flags enabled and fresh QA clone; E2E_EMAIL_A=nest-admin@example.test, E2E_EMAIL_B=nest-merge-learner@example.test. Secret-pattern check of pending Git history and push dry-run PASS. External Google/provider gates stay NOT VERIFIED. Historical screenshots restored after tests; no UI layout changes.

Clock fix deployed locally: API ready200 then web recreated,2postdeploy smokePASS4.3s. No schema migration or production learning-data writes. Migration-owned QA resources removed after rerun.
