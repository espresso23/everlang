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
