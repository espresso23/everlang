# Audit — backend-nestjs-migration

2026-11-01; branch `feature/nestjs-jwt-migration`, baseline `0b34a97`. Review riêng sau implementation: spec→code→native HTTP/browser→DB/queue→worker→UI. Implementation và local cutover verified; feature Review, external/owner gates còn mở.

| Requirement | Result | Evidence |
|---|---|---|
| REQ01 native Nest API/worker, web split/no active legacy | PASS |27domain pairs49methods, auth/health native,17web routes/noAPI, backend boundary gate,old auth paths404 |
| REQ02 JWT/refresh/identity preservation | PASS scoped |RS256/issuer/aud/expiry/session,CSRF/RBAC/rotation/replay/logout/reset,2tabs;20table digests/IDs/password hashes/Google subject/FSRS preserved |
| REQ02 Google live/link, production SMTP/HTTPS | NOT VERIFIED |PKCE/state/nonce/browser binding implemented; invalid callback checked. Owner live login/link and production deployment required |
| REQ03 exceptions/logging/fault handling | PASS |GlobalExceptionFilter/parser boundary, safe JSON logs, HTTP→queue→worker trace3attempts,PG idle reconnect/Redis cooldown/fatal exit |
| REQ04 backup/restore/cutover | PASS scoped |PG20table digests,fresh001–008;Mongo6collections172docs checksums;RedisRDB19keys;synthetic media bytes; actual source audio0files; final backup/cutover |
| REQ05 local regression/docs/source map | PASS scoped |beta/extended exams/admin,knowledge/catalog,disabledspeech/privateaudio,profile/audio/retry/Editorial;18feature docs/audits and structural gates |
| Live AI/ASR/KRdict/Tutor inference/quality | NOT VERIFIED |Contracts ported/build/guards/unit verified; no new provider/paid calls to fabricate evidence |

Detailed commands/results: [verification](assets/verification.md), [integration audit](../../audits/nestjs-jwt-migration.md), [trace](assets/tracing.json), [feature index](../../README.md). Raw backups/traces/env remain private outside Git.

Cutover03:46–03:47UTC: old app/worker stopped with no queued/active business jobs, snapshot20261101-104559 taken,008 applied from native worker image. Migration service initially selected a stale cached image; corrected shared explicit everlang-worker:local tag, applied008 and reran idempotently. API/web/worker restarted, ready200, post-cutover2smoke PASS,20preserved table digests unchanged, old auth tables absent/8migration records. Old image/env snapshots offline only; rollback needs full restore, not old code on008.

Migration-owned QA databases/namespaces/Redis15/containers/media volumes cleaned; production/pre-existing namespaces preserved. No public deployment/Git push/merge claimed. PB-039 tasks Review; no Done until remaining mandatory owner/provider scope verified/accepted. Local HTTP cookie intentionally non-Secure; HTTPS cookie Secure.
