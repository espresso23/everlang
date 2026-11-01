# PostgreSQL-only operations — current update 2026-11-01

Runtime uses PostgreSQL + Redis + private media; MongoDB/Mongoose removed. Backup script now saves PG/Redis/media. Do not delete retained Mongo volumes/snapshots: they are rollback artifacts, never a live fallback. Source export: run scripts/export-mongo-snapshot.js through mongosh against the explicit source DB, redirect privately. Backup target, run migration10, then node --import tsx scripts/import-mongo-snapshot.ts <private-snapshot.json> --confirm-snapshot. Import atomically checks every archive/operational document and rejects differing targets. Cutover evidence: [PostgreSQL-only audit](../features/postgresql-only/audit.md). After writes on the new runtime, rollback requires reconciliation of new PG data; never blindly restore an older snapshot.

## Historical operations notes

The sections below record earlier migrations; references to Mongo apply to those snapshots, not a runtime prerequisite.

# Vận hành và rollback

Nguồn: [Compose](../../docker-compose.yml), [Dockerfile](../../Dockerfile), [Caddy](../../Caddyfile), [scripts](../features/platform-operations/functions.md).

Local: `docker compose --profile local up -d --build`. App ở localhost:3000, Mailpit ở localhost:8025. Mailpit bắt email verify/reset để kiểm tra link mà không gửi email ra ngoài; không tham gia Google OAuth. Để dùng email thật, cấu hình SMTP tương ứng trong môi trường; không tắt verify chỉ vì bỏ inbox local.

Các biến bắt buộc/tuỳ chọn được liệt kê trong file cấu hình mẫu của dự án; chỉ điền giá trị thật trong `.env` bị gitignore. Khi thay biến môi trường cần recreate container; chỉ restart không đọc lại `.env`. Không in `docker compose config` đầy đủ vì có thể lộ secret.

Kiểm tra: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run docs:check`. E2E `E2E_AUTH_TESTS=1` cần local SMTP/Mailpit và account dùng một lần; test OAuth thật cần thao tác người sở hữu Google. Giữ kết quả thực tế ở audit, không đổi skipped thành passed.

Trước thay schema/import: backup MongoDB/PostgreSQL, kiểm tra đọc được bản backup, giữ volume cũ. Migration001–007 giữ lịch sử;008 rename auth tables và xóa sessions/provider tokens cũ (không additive); rollback ứng dụng phải đánh giá tương thích schema, không tự drop bảng/volume. CLI records:import chỉ chạy sau xác nhận ánh xạ tài khoản. Không có cam kết restore thành công nếu chưa diễn tập tại môi trường đích.

## Speech providers

Xem [speech ops/system design](../features/self-hosted-speech/system-design.md). Chạy migration005/006 trước app mới. Chọn đúng **một** provider/profile:

- Gemini: GEMINI_API_KEY server-only từ project Free tier chưa bật billing, SPEECH_PROVIDER=gemini; build app + speech-api-worker, `docker compose --profile speech-api up -d --build speech-api-worker api app gateway`. Không cần model volume/native build. Limit384MB/1CPU, quota nội bộ20 calls/day UTC; Redis outage failclosed. Không tự xác minh billing bằng key. Hiện key trả402 prepaid depleted; không bật billing/nạp tiền trong task.
- Whisper: SPEECH_PROVIDER=whispercpp; `docker compose --profile speech up -d --build speech-worker api app gateway` chạy model init explicit, SHA verified, model mounted readonly;2CPU/1200MB/concurrency1, AVX2+FMA+F16C hoặc portable. Hosting/RAM không miễn phí dù model không có API fee.

Không bật hai worker profile cùng queue. Stop worker đang dùng trước đổi provider; pending snapshot khác provider sẽ failed rõ, cần người dùng consent/gửi lại. Default disabled giữ khả năng thu/nghe trên thiết bị.

Backup PostgreSQL **và speech_media** khi không có upload/jobs đang ghi, restore cả hai cùng snapshot. Không dùng chỉ pg_dump để hứa khôi phục audio. Giữ dump/archive ngoài Git; chỉ evidence không chứa bí mật trong documentation. Rollback app cũ giữ bảng/volume, không DROP. Next output tracing loại .local/.env/.git/test artifacts; dynamic private read có turbopackIgnore theo build docs để không trace private filesystem vào standalone.

## Vocabulary schema007 / rollback compatibility

Trước007, deploy bridge targetless /api/vocabulary.POST (`everlang-vocabulary-bridge:local` built from6790f1f plus that handler change). Old full unique constraint is replaced by manual/catalog partial indexes; pre-bridge app POST is **incompatible** afterward. Rollback only bridge/newer, keep DB/volume, no down/drop. Pre007 PG+Mongo dumps private .local/backups; restored test DBs verified/removed. Synthetic pre-reviewed card checked id/card/due/version/algorithm/revlog unchanged across migration. `npm run seed:vocabulary` explicit inserts draft-only, rerun does not overwrite edits/published content.

## Worker errors/cooldown — 2026-10-31

[Error handling chuẩn](error-handling.md): API boundary có sẵn giữ nguyên; standalone worker fatal exit1/restart, PG idle error không dump client, grading429 cooldown queue/retry3. Rebuild/recreate api, app và worker để đồng bộ shared code. Không tắt limiter hoặc đổi model/billing để xử lý429. [Audit](../audits/system-library-worker-errors.md).

## Nest cutover008 — 2026-11-01

1. Chuẩn bị JWT_PRIVATE_KEY_B64/JWT_PUBLIC_KEY_B64/CSRF_SECRET (`npm run auth:keys` không overwrite); PUBLIC_ORIGIN canonical. Public production HTTPS bắt buộc. Không in compose config/env.
2. Candidate dùng DB/Mongo/Redis/media riêng; chạy auth/route/parity/security/error/tracing, fresh migrations và restore rehearsal. Không chạy provider/billing ngoài để tạo kết quả giả.
3. Maintenance: dừng nhận ghi và drain workers, kiểm queued/active jobs; backup PostgreSQL, Mongo, Redis RDB và private speech_media cùng snapshot. `scripts/backup.ps1` lưu ngoài Git; trước migration backend cũ dùng `-MediaService app`. Docker cp đọc cả container đã stop. Backup không tự dừng ghi; người vận hành chịu trách nhiệm maintenance/drain trước chạy.
4. `docker compose run --rm --no-deps migrate` áp dụng008 trong transaction/advisory lock; chỉ chạy sau backup. `docker compose --profile local up -d api app gateway worker` recreate native runtimes. Chọn đúng một speech profile khi bật; không chạy hai provider workers cùng queue.
5. Kiểm ready,401/403, JWT/email flow, native worker logs và các dữ liệu bảo toàn. User đăng nhập lại. Google live cần thao tác chủ tài khoản, không giả verified.
6. Rollback offline: stop runtimes mới, restore PG/Mongo/Redis/media vào databases/volumes mới, gắn image checkpoint cũ và env snapshot riêng tư. Không chạy image Better Auth trên schema008, không chỉ đổi image rồi bỏ qua schema. Không down/drop live tables/volumes.

Web image chỉ standalone assets, không server secrets; api/worker có env server, chưa public port. Structured JSON log rotation max10MB/5files trên API/web và worker. API SIGTERM15s, workers150s. `/api/health/ready` kiểm PG/Mongo/Redis. Không xem `/api/docs` có schema đầy đủ cho mọi body: native services dùng Zod, route inventory và canonical feature docs là payload contracts hiện tại.

## ORM và Redis — 2026-11-01

[Availability contract](architecture.md#orm-và-redis--2026-11-01): PG/Mongo readiness bắt buộc; Redis down giữ HTTP200 degraded, queue503. Theo dõi queueAvailable/queue.enqueue.failed và khôi phục Redis để gửi lại tác vụ, không reset database hoặc mất tiến độ.

Migration: `npm run db:migrate` gọi TypeORM MigrationExecutor, khóa advisory814921; adopt prefix001–008 vào orm_migrations và thêm rate_limit_buckets bằng migration1730000000008. Fresh install chạy đủ9 migration; không cần tạo schema_migrations (bảng lịch sử cũ được giữ trên DB nâng cấp). History lạ/hở/DB populated thiếu history bị chặn. Re-run không ghi lại migration. Backup trước thay đổi, rollback dùng snapshot kiểm chứng hoặc forward migration; down phá dữ liệu bị cấm. pg chỉ là driver nội bộ TypeORM. API/worker đóng DataSource qua Nest TypeOrmModule, CLI đóng trong finally.
