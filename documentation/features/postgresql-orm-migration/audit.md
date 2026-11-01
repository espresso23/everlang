# Audit — PostgreSQL ORM migration

## Re-audit 2026-11-01

[Re-audit độc lập trong lượt kiểm handoff](../../audits/typeorm-reaudit-2026-11-01.md): chạy lại78unit, lint/typecheck/build, fresh PostgreSQL9migrations và2deployed smoke đều PASS. Full29E2E/restore/adoption/outage không chạy lại. Không phát hiện blocker code mới trong phạm vi đã rà; conditional technical GO, giữ Review chờ artifact commit đầy đủ và human QA. Owner chọn ưu tiên tiếp theo là vòng học khép kín; không thay scope runtime/tracking trong lượt audit.

2026-11-01; branch refactor/typeorm-data-access; baseline25b96d3. Review riêng sau triển khai: đối chiếu196điểm gọi/24file (gồm transaction primitives) trong inventory206calls/26files, đặc tả → QueryBuilder → PostgreSQL/native HTTP/worker/browser. Không lấy build làm bằng chứng luồng nghiệp vụ.

| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| REQ01 ORM-only PostgreSQL CRUD | PASS | API/auth/domain, backend learning/catalogue,2processors, CLI import; bỏ src/sql/index.ts/export/alias, clean dist; backend boundary gate; Mongoose giữ nguyên |
| REQ02 bảo toàn dữ liệu/schema | PASS | Actual restored PG24table row/column/index/constraint hashes unchanged; user IDs/password/provider subjects/FSRS/review log included; synchronize/dropSchema false |
| REQ03 transaction/CAS/locks/JSONB/vector | PASS |29E2E: draft conflict, FSRS concurrency, knowledge/catalogue/exam attempts; fresh/adoption probe JSONB+1536vector+conflict+rollback+24parallel quota→7 |
| REQ04 lifecycle/history/migration | PASS scoped | Nest TypeOrmModule owns init/shutdown, CLI finally; fresh9/adopt8+1/re-run0/corrupt prefix reject; final backup restore rehearsed; local cutover result in evidence |
| REQ05 logging/errors/regression/docs | PASS scoped |78unit,29E2E/2.8m; lint/workspace/tools typecheck/Docker build; safe QueryFailedError/pool/fatal/correlation; docs/plan gates |
| REQ06 Redis outage/recovery | PASS | Dedicated QA Redis stop/start: login/profile/draft andCAS200/409 remain, ready200degraded, queue503/code/requestId, recovery202; API process stays alive |
| Actual Google/AI/ASR/KRdict/production SMTP/HTTPS | NOT VERIFIED | Existing external/owner gates retained; no paid inference calls; no claim full product release Done |
| New learner layout/accessibility | N/A | No frontend runtime change; existing profile/audio/Editorial fixtures regressed at1440/390/320 |

Review found/fixed targeted ON CONFLICT omission (profile/grading/knowledge/import/catalog progress), insert count without RETURNING, and readiness waiting on reconnect. CLI real import confirms1new/0repeat, ownership guard and original Mongo preservation. First full run27PASS/2FAIL; fixed actual timeout and isolated two suites' QA admin emails; final29/29PASS. Restrictive legacy_imports FK was a test cleanup issue, fixed explicitly; production FK retained.

[Detailed commands/results](assets/verification.md), [integration audit](../../audits/postgresql-orm-migration.md), [function map](functions.md), [shared architecture](../../shared/architecture.md). Raw backups/traces remain private, durable summary lives here. External limits are not silently converted to PASS.

## PostgreSQL-only re-audit — 2026-11-01

PASS scoped local regression on refactor/postgresql-only: former Mongo persistence now uses the canonical TypeORM content/archive store; existing native API/auth/ownership/admin/learner contracts verified in29candidate E2E and PG import/preservation probes.80unit/2postcutover smoke; runtime works with Mongo stopped. See [canonical audit/evidence](../postgresql-only/audit.md) for exact coverage, startup finding fixed, rate-limit hash caveat and rollback limits. Previous Mongo evidence above is historical; cloud/quality/owner/production limits remain NOT VERIFIED where recorded, not promoted by the DB migration.
