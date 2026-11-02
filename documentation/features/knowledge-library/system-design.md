# System design

Thiết kế đã hiện thực, 2026-10-31: `/knowledge` → API session guard → service MongoDB `knowledge_entries` (học liệu) và PostgreSQL `knowledge_state`/`knowledge_attempts` (dữ liệu cá nhân). Không dùng Redis làm nguồn state. Plain text render bằng React, không raw HTML.

Mongo key+revision unique; editVersion CAS. Publish chỉ từ reviewed; edit chỉ draft; fork tạo draft revision tiếp theo, xử lý unique conflict 409. Learner lấy published revision lớn nhất. Khi state cũ trỏ section đã mất, UI fallback đầu bài, không đánh dấu đọc revision mới tự động.

API hiện có: GET `/api/knowledge` list/detail, GET/PUT `/api/knowledge/state` theo key; POST `/api/knowledge/attempts`; GET/POST/PATCH `/api/admin/knowledge`. Input strict Zod; 401/403 session/role, 400 validation, 404 không có bản published, 409 stale version/revision hoặc requestId khác payload. Không trusting user_id client.

Migration additive 004, không sửa/xóa legacy. Backup PostgreSQL/Mongo trước migrate và diễn tập restore trước release. Rollback app có thể bỏ qua bảng mới, không DROP dữ liệu cá nhân tự động. Mỗi state mutation atomic upsert có version; attempts unique(user_id,request_id), snapshot chứa nội dung/đáp án/giải thích tại thời điểm nộp. Requests trùng nội dung trả kết quả gốc; khác payload 409.

GET state không key trả tối đa100 metadata bookmark/đọc tiếp của chính user, không trả note của tài khoản khác. Reviewed chưa published có action revise trả draft và bỏ reviewer; published chỉ fork revision, không edit/revise. Seed chạy explicit npm run seed:knowledge; idempotent chỉ insert draft revision1 khi chưa tồn tại.

Gate related references: publish từ chối self-reference hoặc key không có bản published. Public detail resolve relatedItems thành key/title của bản published mới nhất; UI dùng tiêu đề học liệu, không dùng mã kỹ thuật làm nhãn. Không thay đổi lịch sử của revision cũ.

## Kho hệ thống theo ngôn ngữ — 2026-10-31

Nội dung chuẩn là tài sản hệ thống, dùng chung cho các tài khoản verified, không lọc theo người tạo học liệu. GET nhận `language=ko` (mặc định), từ chối ngôn ngữ chưa hỗ trợ thay vì trả nhầm corpus; response thêm `language` và `ownership=system`. Chưa triển khai corpus đa ngôn ngữ. Chỉ nội dung published được xem/lưu; admin quản lý draft/review/publish. Bookmark/note/read-state/attempt/SRS vẫn theo owner hiện hành; lưu cá nhân không thay bản gốc. Không tự publish các seed đang chờ duyệt.

## ORM data access — 2026-11-01

PostgreSQL dùng TypeORM EntitySchema/QueryBuilder; transaction dùng một QueryRunner, giữ ownership, row lock, CAS/version, JSONB và idempotency. MongoDB vẫn Mongoose. Hợp đồng dùng chung tại [ORM design](../postgresql-orm-migration/system-design.md); chi tiết regression ở [audit tích hợp](../../audits/postgresql-orm-migration.md). UI/layout không thay đổi.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Reader](../../../apps/web/app/knowledge/page.tsx): `reloadState`, back và related links. Tải ghi chú mới nhất/đi sang bài khác cần xác nhận khi dirty; hủy giữ note. Bỏ native beforeunload; đóng tab/reload không có guard tùy chỉnh.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
