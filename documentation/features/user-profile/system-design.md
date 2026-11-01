# System design — user-profile

[Đặc tả](README.md) · [Functions](functions.md) · [UI](ui.md).

```mermaid
sequenceDiagram
  participant UI as Profile / Shell
  participant A as Nest AuthService
  participant API as Profile API
  participant DB as PostgreSQL
  UI->>A: useSession
  A->>DB: session + users
  A-->>UI: pending / error / guest / user.image
  UI->>API: GET (cookie)
  API->>A: require verified session
  API->>DB: ensure profiles; read profile, provider names
  API-->>UI: explicit safe response
  UI->>API: PUT five validated fields
  API->>DB: BEGIN; update users; upsert profiles; COMMIT
  API-->>UI: saved
  UI->>API: reload profile
  UI->>A: refetch(disableCookieCache)
  A-->>UI: new name for header
```

Source transaction: [PUT](../../../apps/api/src/domains/profile.service.ts). Cùng connection, rollback khi có lỗi, release trong finally. Nest AuthService không bật cookie cache; GET /api/auth/me đọc user từ PostgreSQL, UI chủ động refetch sau save. Nếu sau này bật cache/secondary storage phải audit lại invalidation; không tự coi transaction SQL cập nhật mọi cache.

Default profiles tạo idempotent trên GET. Provider query luôn WHERE user_id=session.id, chỉ SELECT DISTINCT provider_id. Viewer lấy từ [api guard](../../../apps/api/src/auth/jwt.guard.ts), không tin identity trong request. Schema strict chặn thêm role/email/user_id.

Ảnh HTTPS remote được render bằng Next Image unoptimized; không proxy ảnh provider qua server. referrerPolicy no-referrer, kích thước cố định, ảnh lỗi dùng initials. Không tải ảnh riêng hoặc sửa image qua profile API.

Profile không thay snapshot daily_plans đã có. Security actions dùng native AuthController/AuthService; credential và identity chỉ thay đổi qua auth service transaction. Auth schema008, profile business schema giữ nguyên. Hai tab lưu settings dùng last successful commit; SRS/dashboard giữ version riêng, profile chưa có optimistic conflict UI.


## View/edit state machine — 2026-10-30

Loading → View hoặc loadError/Retry. View → Editing khi CTA, focus name. Editing → View khi Cancel không ghi; Editing → Saving khi submit. Saving → Editing khi PUT/GET failure, giữ input; Saving → View khi PUT + GET + session refetch xong, cập nhật tên/header và return focus.

State owner Profile: data/editing/saving/loadError/saveError/message và focus refs. Uncontrolled form được mount từ saved data, không unmount khi error. saveProfile giữ API/schema/transaction hiện tại. AccountSecurity tách local busy/message, native details đảm nhận open/close; LegacyDraftImport giữ confirm/version0. Không thêm DB hoặc migration.

CSS route-scoped profile-, không thay các route khác. Profile layout đổi theo yêu cầu trực tiếp; structural test loại riêng /profile khỏi comparison với baseline cũ và kiểm state/responsive riêng, không regenerate JSON.
