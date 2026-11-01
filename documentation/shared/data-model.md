# Nguồn dữ liệu và schema

Schema thực thi: [migration 001](../../migrations/001_beta.sql), [migration 002](../../migrations/002_vectors.sql), [migration 003](../../migrations/003_exam_concurrency.sql). [Auth migration008](../../migrations/008_nest_auth.sql) và [TypeORM DataSource](../../packages/backend/src/orm.ts).

| Nơi lưu | Nhóm dữ liệu | Ràng buộc / sử dụng |
|---|---|---|
| PostgreSQL | users, auth_identities, auth_refresh_sessions/tokens, auth_one_time_tokens | Native JWT, credential/provider identity; hash refresh/one-time tokens |
| PostgreSQL | profiles | Một row/user; level/goal/minutes/timezone |
| PostgreSQL | drafts, favorites, submissions | Theo user; nháp optimistic version; snapshot đề và báo cáo JSONB |
| PostgreSQL | vocabulary, review_logs | Card FSRS JSON, due/version/algorithm; review transaction và request ID |
| PostgreSQL | daily_plans, study_days | Unique user/day địa phương; snapshot task và streak |
| PostgreSQL | legacy_imports | Ánh xạ UUID cũ đã xác nhận, import idempotent |
| PostgreSQL | recordings | User → object key riêng tư, transcript/feedback |
| PostgreSQL | exam_attempts | Snapshot đề, answers, deadline, result/version; unique active attempt |
| PostgreSQL/pgvector | tutor_chunks | Published content/version/text, embedding 1536 |
| MongoDB | Sentence, Exam | Nội dung, nguồn/quyền, phiên bản, draft/reviewed/published |
| MongoDB | Submission/UserState cũ | Giữ lưu trữ; không tự nhập cho user mới |
| Redis | Queue/cache | Dữ liệu tạm; không thay thế PostgreSQL tiến độ |
| S3 | Audio riêng tư | Signed URL có hạn, không public bucket |

Sao lưu trước migration/import; PostgreSQL và MongoDB là hai nguồn khác trách nhiệm, không giả định transaction xuyên database. Không chuyển mật khẩu/session/provider token vào response profile hay tài liệu. Các câu SQL dữ liệu cá nhân luôn ràng buộc user lấy từ JWT đã kiểm active session.

## Knowledge library — migration004

MongoDB `knowledge_entries`: key/revision unique, editVersion/status/content/reviewedBy. PostgreSQL `knowledge_state`: user/key unique, note/bookmark/section/read/revision/version; `knowledge_attempts`: user/requestId unique, snapshot/answers/result. Xem [contract](../features/knowledge-library/system-design.md). Không có transaction xuyên hai database; published revision bất biến để snapshot attempt ổn định.

## Private speech attempts

Migrations [005](../../migrations/005_local_speech.sql) và [006](../../migrations/006_speech_provider.sql) additive: speech_attempts owner/nonce/hash/status/reference/transcript/model/engine/time + provider/consent version. Audio trong named private volume, không Mongo/public URL. Local DELETE chặn playback và xóa transcript trước unlink, cleanup retry, tombstone7days. Xóa local không hứa xóa dữ liệu đã được cloud xử lý. [Contract](../features/self-hosted-speech/system-design.md).

## Catalog sense identity007

[Migration007](../../migrations/007_vocabulary_catalog.sql) bổ sung vocabulary.sense_key default'' và content_snapshot; manual unique user/term/kind partial, catalog unique user/sense partial; không thay card/review_logs. catalog_progress CAS self-report, catalog_preferences0–30/day, catalog_introductions unique sense lifetime + counted flag. Explicit attach manual giữ lịch/note và không tiêu quota. [Contracts](../features/vocabulary-catalog/functions.md); rollback chỉ bridge/newer (old ON CONFLICT target không tương thích).

008 rename giữ tất cả business FK/ID/hash, xóa session/verification/provider tokens cũ có chủ đích. Replay dùng used_at giữ tới session hết hạn, refresh30d absolute; revocation DB có hiệu lực ngay dù access JWT còn hạn. [Schema008](../../migrations/008_nest_auth.sql).

## ORM và Redis — 2026-11-01

[25 EntitySchemas](../../packages/backend/src/entities.ts) giữ24 mapping cũ và thêm rate_limit_buckets; orm_migrations do TypeORM quản lý. synchronize/dropSchema false; schema_migrations cũ chỉ provenance. [Migrations](../../packages/backend/src/orm-migrations.ts) và [hợp đồng ORM/Redis](architecture.md#orm-và-redis--2026-11-01).
