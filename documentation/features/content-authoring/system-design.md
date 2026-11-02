# System design — content-authoring

[Đặc tả](README.md) · [Functions](functions.md) · [UI](ui.md)

## Luồng thực tế

Admin form/AI draft → api(admin) → Mongo Sentence → review → publish → học viên đọc published

```mermaid
flowchart LR
  UI["UI / caller"] --> API["Session / API / service"]
  API --> Data["Data / provider"]
  Data --> Result["Result / error"]
  Result --> UI
```

Sơ đồ khái quát ranh giới; chuỗi phía trên nêu rõ worker/provider/storage có áp dụng cho feature này.

## Dữ liệu và ownership

Mongo Sentence; nguồn và quyền dùng được ghi thành text, chưa xác minh pháp lý tự động. contentReady chỉ cache quá trình seed trong process.

API cá nhân luôn lấy user từ session ở [api](../../../apps/api/src/auth/jwt.guard.ts), không nhận user_id tùy ý từ request. Mutation dùng JSON/Origin; lỗi auth 401/403 không phải dữ liệu trống hợp lệ.

## Hợp đồng tích hợp

- GET/POST/PATCH /api/admin/content — list/create/generate/review/publish/edit; admin only.
- POST /api/sentences/generate — endpoint cũ, admin nhận 410 để dùng workflow mới.

## Failure modes và vận hành

Cần audit nguồn/quyền học liệu trước phát hành rộng. Một trang tạo index có thể gọi provider nhiều lần; chưa có batching UI.

Phụ thuộc chung: [session/authorization](../../shared/auth-and-api.md), [storage/migrations](../../shared/data-model.md), [vận hành](../../shared/operations.md). Chỉ tên biến môi trường được ghi ở docs; không đưa token, cookie hay credential vào ví dụ/log.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.

## Admin workspace AW-01–04 — implemented local 2026-11-01

AuthProvider/useAuth.user.admin từ server là nguồn role. Sign-in sau authenticated (email hoặc Google callback /sign-in) replace theo role; không auto redirect admin đang học tại /. Linking không đổi. Shell chọn navigation theo route, chỉ hiện switch khi user.admin. /admin/layout.tsx là UI gate: pending/error/nonadmin không mount editor children; API JwtGuard là ranh giới bảo mật. /admin/overview dùng các link thật, không thêm API/query/count. Không migration; rollback source UI không đổi dữ liệu.


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.

EW architecture: admin table→existing admin JwtGuard/controller→validated query→TypeORM content-store (filter/count/page); mutations remain single-domain version transitions. Browser orchestrates bounded per-row metadata/import requests so partial failures are explicit; no cross-row atomicity claim. Import dry-run is client validation, commit revalidates server; other-admin races return409. No newqueue/provider/wrapper/DDL. Preview does not grant public read to drafts and is not a substitute for server ownership/status checks.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Admin](../../../apps/web/app/admin/page.tsx), [KnowledgeAdmin](../../../apps/web/app/admin/knowledge/page.tsx) và [EditorialDesk](../../../apps/web/components/editorial-desk.tsx): `choose`, `open`, `importDrafts`, `batch`. Đổi editor, duyệt knowledge, import và batch dùng dialog; onSelect cho phép Promise, active item chỉ đổi sau chấp thuận. Bỏ native beforeunload trong knowledge editor.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
