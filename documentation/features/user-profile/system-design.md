# System design — user-profile

[Đặc tả](README.md) · [Functions](functions.md) · [UI](ui.md).

```mermaid
sequenceDiagram
  participant UI as Profile / Shell
  participant A as Better Auth
  participant API as Profile API
  participant DB as PostgreSQL
  UI->>A: useSession
  A->>DB: session + auth_user
  A-->>UI: pending / error / guest / user.image
  UI->>API: GET (cookie)
  API->>A: require verified session
  API->>DB: ensure profiles; read profile, provider names
  API-->>UI: explicit safe response
  UI->>API: PUT five validated fields
  API->>DB: BEGIN; update auth_user; upsert profiles; COMMIT
  API-->>UI: saved
  UI->>API: reload profile
  UI->>A: refetch(disableCookieCache)
  A-->>UI: new name for header
```

Source transaction: [PUT](../../../app/api/profile/route.ts). Cùng connection, rollback khi có lỗi, release trong finally. Better Auth không bật cookie cache; get-session đọc user từ PostgreSQL, UI chủ động refetch sau save. Nếu sau này bật cache/secondary storage phải audit lại invalidation; không tự coi transaction SQL cập nhật mọi cache.

Default profiles tạo idempotent trên GET. Provider query luôn WHERE user_id=session.id, chỉ SELECT DISTINCT provider_id. Viewer lấy từ [api guard](../../../lib/api.ts), không tin identity trong request. Schema strict chặn thêm role/email/user_id.

Ảnh HTTPS remote được render bằng Next Image unoptimized; không proxy ảnh provider qua server. referrerPolicy no-referrer, kích thước cố định, ảnh lỗi dùng initials. Không tải ảnh riêng hoặc sửa image qua profile API.

Profile không thay snapshot daily_plans đã có. Security actions dùng Better Auth APIs; không tự ghi password/account liên kết bằng SQL. Không có migration mới. Hai tab lưu settings dùng last successful commit; SRS/dashboard giữ version riêng, profile chưa có optimistic conflict UI.
