## 2026-11-01 — Native Nest migration regression audit

## 2026-11-01 — ORM regression

Branch refactor/typeorm-data-access. Real profile upsert/read/ownership PASS;7profile UI fixtures PASS. Global78unit/29E2E final candidate PASS. [Canonical ORM audit](../postgresql-orm-migration/audit.md) ghi commands, preservation/locks/error paths và external limits; [integration audit](../../audits/postgresql-orm-migration.md). Không đánh feature product Done hoặc giả xác minh provider live.

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: native profile GET/PUT strict/transaction/isolation; UI edit/cancel/error/avatar/mobile.
- Google live/link confirmation còn mở.
- Evidence/checks: beta.spec.ts, profile-ui.spec.ts; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit cập nhật — Learning Passport / profile view & edit

2026-10-30, feature/profile-editorial-layout, baseline f7fa4cf.

| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| REQ-01..08 auth/ownership/validation/avatar/settings/security | PASS regression phạm vi thay đổi; giới hạn provider thật giữ nguyên | beta E2E thật, profile UI mocks; API/schema không sửa |
| REQ-09 view/edit/cancel/failure/save/lock/focus/responsive | PASS | 7 profile UI tests; cancel0 PUT, 503 giữ input, retry hiện view/header mới; dài320px, view/edit1440/390 |
| Bố cục còn lại | PASS | 7 route khác so sánh baseline cũ; profile ngoại lệ user cho phép, không refresh JSON |
| Kiểm tra chung | PASS | lint, tsc, 23 unit; production Docker build;13 E2E54.1s |
| Google linking/Google-only reset thật, screen reader/native zoom200% | NOT VERIFIED end-to-end trong lượt này | Giữ giới hạn từ audit trước, không giả UI fixture thành OAuth thật |

[Audit nhóm](../../audits/profile-layout-integration.md) · [View/edit UI và ảnh](ui.md).
Không migration. AccountSecurity tách local status/busy; LegacyDraftImport giữ confirm/version0. Dữ liệu test được dọn chính xác, account thật giữ nguyên.

## Lịch sử audit trước layout passport

# Audit — user-profile

2026-10-30, feature/user-profile. Review sau triển khai, nền d151dcb.

| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| REQ-01 own session, không nhận identity/role | PASS | beta.spec.ts: 401 anonymous, tài khoản B không thấy tên/profile A; unknown keys 400 |
| REQ-02 validate + lưu nguyên tử | PASS source/integration | unit profile.test.ts; beta PUT → GET → get-session; SQL transaction review |
| REQ-03 giữ snapshot lịch | PASS review; không diễn tập đổi timezone trên thiết bị thật | PUT chỉ auth_user/profiles; daily_plans không bị mutate; daily dashboard tests giữ idempotence/version |
| REQ-04 avatar success/fallback | PASS UI test | profile-ui: ảnh tải được, ảnh 404 thành initials; header và profile; ảnh QA desktop/mobile |
| REQ-05 session pending/error/guest | PASS UI test | Không mount API profile khi pending; error retry; không flash login CTA |
| REQ-06 save/refresh/reload/name header | PASS E2E thật | UI đổi tên → PUT → GET/refetch → header → reload; profile API 503/retry dùng mock |
| REQ-07 provider/security | PASS hiển thị; NOT VERIFIED mọi thao tác với Google thật | Google-only ẩn current-password; credential có form; email login/verify/logout/reset thật qua Mailpit. Explicit linking/Google-only reset chưa E2E thật |
| REQ-08 legacy/admin | PASS source review; NOT VERIFIED import lại trong lượt này | Giữ LegacyDraftImport version0 + confirm; admin link theo server role, API learner 403 trong E2E |
| Kiểm tra chung | PASS | 23 unit, 7 Playwright, lint, tsc, production Docker build, ảnh 1440/390 |

[Audit tích hợp và giới hạn](../../audits/profile-auth-integration.md). [Desktop](assets/profile-desktop.png), [mobile](assets/profile-mobile.png) dùng session Google mô phỏng và cố ý lỗi ảnh; [email QA thật](assets/screen-learner-desktop.png) kiểm save/DB/session.

Google login thật được chủ tài khoản xác nhận và DB kiểm provider/image/active session sau sửa cấu hình. Không dùng ảnh cá nhân thật làm evidence. Chưa kiểm SMTP production hoặc thiết bị thật thứ hai; không có upload avatar/đổi email, không migration mới. Dữ liệu QA đã dọn theo đúng hai địa chỉ fixture.
