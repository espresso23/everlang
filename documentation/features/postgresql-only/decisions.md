# Decisions — 2026-11-01

Settled by owner: merge TypeORM first; remove MongoDB and use PostgreSQL for business persistence; implement and show real results, avoid accumulating conceptual backlog. Prior choice retained: closed learning loop next. Local TypeORM merge completed e0ad32f; no remote push.

Implementation choices within authorization: additive tables with JSONB for heterogeneous content, preserve IDs/revisions/API, offline snapshot archive for legacy data, retain rollback backups; no destructive deletion of Mongo data. Redis/media stay because request targets MongoDB. No unresolved product choice blocks migration. Sprint dates/capacity remain uncommitted; deliverable is a working increment, not a fabricated completed sprint.

Tracking refinement after implementation: the four content domains share one schema/atomic cutover and were delivered/verified together under the owner's explicit whole-migration assignment. Consolidate dev+technical audit into PB-041-T01 (Review); retain PB-041-T02/T03 IDs as owner QA and merge-decision gates with real dependencies. This avoids marking upstream Done without human QA or pretending dependent development is still unimplemented. No runtime scope added; no sprint completion invented.
