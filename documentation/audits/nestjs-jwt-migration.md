# Integration audit — NestJS/JWT migration

2026-11-01, feature/nestjs-jwt-migration; checkpoint0b34a97. Review riêng: spec→native controllers/services→guard/filter→DB/queue→worker→client. Canonical [migration audit](../features/backend-nestjs-migration/audit.md), [source map](../code-map.json).

| Liên kết | Kết quả | Evidence/giới hạn |
|---|---|---|
| Web RAM JWT→Nest guard→PG active session | PASS | nest-auth real HTTP + nest-jwt unit, token alg/issuer/aud/expiry, CSRF,403,rotation/replay/logout,two tabs |
| Profile/draft/SRS/dashboard→PG transactions→UI | PASS | beta native, profile-ui fixtures; optimistic conflict and ownership |
| Knowledge/catalog→Mongo immutable content + per-user PG→UI | PASS | real knowledge/catalog suites, version/quota/attempts/FSRS |
| Submission HTTP→PG→CorrelatedQueue→Nest WorkerHost→failure→409 explicit retry | PASS | nest-auth no-AI-key probe, [sanitized trace](../features/backend-nestjs-migration/assets/tracing.json); no external provider call |
| Exams/admin content→version/workflow→storage | PASS | beta extended native; no AI-writing provider claim |
| Speech owner Bearer→native binary→blob cleanup | PASS | private-audio fixture, disabled provider UI; ASR live NOT VERIFIED |
| PG before/after008 and fresh001–008 | PASS | 20-table digest assertions, identities/password hashes/FSRS preserved; [SQL](../../tests/integration/auth-preservation.sql) |
| Mongo archive restore | PASS | 6 collections,172 documents, every collection dbHash matches source |
| Google callback rejection vs actual login/link | PASS / NOT VERIFIED | invalid-state path checked; owner live Google still required |
| KRdict/Tutor/cloud grading/Whisper/Gemini/SMTPproduction | NOT VERIFIED | source contracts ported/build/guards; no fresh cloud/inference evidence |

Run command groups and exact flags in [verification evidence](../features/backend-nestjs-migration/assets/verification.md). Per-feature audits describe their own scope, including unchecked paths. Cutover/Redis/media restore status is recorded only after actual execution in canonical migration audit. No blanket feature-complete claim.

## Pre-merge recheck2026-11-01

Full27E2E first found clock skew bug; serverNow contract/client snapshot fixes SRS recall without changing FSRS. All27 rerunPASS2.1m including native catalogue browser -5min/+365days;77unit/lint/typechecks/builds and runtime fault probe PASS. See canonical migration and vocabulary-srs audits. Owner authorizes integration/push; external/provider verification remains open, PB-039 Review.
