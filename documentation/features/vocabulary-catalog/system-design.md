# System design — implemented; release gates open

Next /word-sets + /admin/word-sets → api session/role → Mongo vocabulary_catalog revisions (`content.kind=sense|set`, key/revision unique) → PostgreSQL vocabulary + catalog_progress/catalog_preferences/catalog_introductions. Không tạo kho SRS thứ hai. Redis không lưu tiến độ lâu dài, không cần AI để chạy bài học. Taxonomy code v1 có nhóm/domain/topic; content lưu taxonomyVersion, language ko/skill vocabulary, level và source/rights.

Sense là canonical content, set pin `{key,revision}`; set published chỉ chứa senses published có đủ nghĩa/POS/ít nhất1 ví dụ/source/rights; publication không là chứng nhận audio curated. Doc policy tách text-ready/device-TTS với audio-ready PB-036. Public projections không lộ reviewer identity; list chỉ metadata, detail mới load references. API paginated list limit30, offset bounded; latest published group trước filter/search. Historical pinned version còn đọc được; personal card snapshot không đổi theo edit.

SQL migration007 thêm vocabulary.sense_key default'' và content_snapshot JSONB; giữ toàn bộ id/card/due/version/review_logs. Thay unique old `(user,term,kind)` bằng partial manual index cho sense_key='' và unique(user,sense_key) cho catalog. Để rollback an toàn: trước007 đổi legacy POST sang `ON CONFLICT DO NOTHING` targetless, build/tag bridge image/deploy; bridge tương thích cả schema cũ/mới và hiện nhiều nghĩa theo card id. Old pre-bridge image không là rollback target sau007. Không xóa/copy thẻ hoặc reset FSRS. PUT collision trả409 thay500.

Learn POST nhận setKey/setRevision/senseKey/senseRevision/action/version, server resolves pinned published content; không tin nghĩa/context/card/user client. State CAS trong transaction advisory lock theo user, quota new/day dùng timezone profile + catalog_preferences, cap0–30; first introduction unique(user,sense) để cross-set không tiêu lại. Existing card resave trảduplicate và không sửa card/due/log. known/skipped chỉ self-report, không auto suspend existing SRS. Một explicit save chuyển progress learning; caller không chỉnh state của người khác.

GET list/detail no-store verified session; /api/admin/word-sets admin only, update immutable revision/CAS. Strict schemas, bounded queries/input, regex escaped; plain text React, không raw HTML. External TTS là thiết bị, chưa thêm cloud egress. Seed explicit idempotent chỉ draft; coverage taxonomy gồm nodes chưa có content, UI hiển thị số thực, không fake số từ/ngành. Content review ngoài technical test.

Legacy mapping được thêm trước code: không tự đoán sense cho thẻ nhập tay. Detail trả legacy candidates owner-only có cùngterm; user chọn attachCardId/attachVersion explicit. Server kiểm term/kind/owner/version và cập nhật identity/snapshot, giữ id/card/due/log, tăngversion; không tiêu quota từ mới. Introduction counted=false cho attach, không tự merge/xóa manual card. Duplicate catalog save giữ cả progress hiện có, không ghi đè self-report từ tab khác.

Tìm bộ bằng q cũng tra term/meaning của đúng pinned published sense qua Mongo lookup; không lấy bản draft hoặc revision khác để khớp sai. Latest set được group trước filter. TTS platform có thể dùng network theo voice engine; app không thêm cloud TTS API hoặc API key. Admin content chỉ nhận cùng action edit, review/publish kiểm đúng persisted content. Catalogue GET giữ một PG client và dùng chính client đó, tránh tự giữ client rồi chờ pool khi nhiều request.

## Kho hệ thống theo ngôn ngữ — 2026-10-31

Nội dung chuẩn là tài sản hệ thống, dùng chung cho các tài khoản verified, không lọc theo người tạo học liệu. GET nhận `language=ko` (mặc định), từ chối ngôn ngữ chưa hỗ trợ thay vì trả nhầm corpus; response thêm `language` và `ownership=system`. Chưa triển khai corpus đa ngôn ngữ. Chỉ nội dung published được xem/lưu; admin quản lý draft/review/publish. Bookmark/note/read-state/attempt/SRS vẫn theo owner hiện hành; lưu cá nhân không thay bản gốc. Không tự publish các seed đang chờ duyệt.

## ORM data access — 2026-11-01

PostgreSQL dùng TypeORM EntitySchema/QueryBuilder; transaction dùng một QueryRunner, giữ ownership, row lock, CAS/version, JSONB và idempotency. MongoDB vẫn Mongoose. Hợp đồng dùng chung tại [ORM design](../postgresql-orm-migration/system-design.md); chi tiết regression ở [audit tích hợp](../../audits/postgresql-orm-migration.md). UI/layout không thay đổi.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[WordSetsAdmin](../../../apps/web/app/admin/word-sets/page.tsx): `choose`, back link, chuyển sense/set; EditorialDesk shared. Đổi loại/chọn bài/rời editor chờ dialog nếu dirty; hủy giữ form và loại đang chọn. Bỏ native beforeunload; chuyển trang nội bộ đang có guard tiếp tục được bảo vệ.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
