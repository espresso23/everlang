# PostgreSQL-only integration audit

2026-11-01; refactor/postgresql-only; [canonical audit](../features/postgresql-only/audit.md), [evidence](../features/postgresql-only/assets/verification.md).

PASS local: browser→JWT/session/admin/ownership→Nest services→TypeORM content+learner PG, source content ID→favorites/drafts→FSRS/version/review logs, immutable knowledge/catalogue revisions→attempt snapshots and pinned set/sense, exam content→attempt/deadline/result, durable job→BullMQ→worker→PG failure/read response. Real PG snapshot/restore/import hash checks and29candidate E2E verify the connections rather than inferring parity from build. Redis outage/resume and private Bearer audio unchanged and regressed. Mongo runtime absent; actual container stopped after local cutover; two deployed smoke tests pass.

NOT VERIFIED: owner content/course acceptance, cloud inference quality/Google live linking/production SMTP/HTTPS/target-environment recovery and post-cutover write reconciliation. These remain in feature audits; the migration does not claim the whole learning goal Done. No frontend layout change; existing desktop/mobile/keyboard/spacing regression fixtures pass. Detailed counts and transient rate-limit hash difference are explicit in the canonical audit.
