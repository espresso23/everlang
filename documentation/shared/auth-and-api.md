# Hợp đồng JWT và API — 2026-11-01

Điểm thực thi: [AuthService](../../apps/api/src/auth/auth.service.ts), [AuthController](../../apps/api/src/auth/auth.controller.ts), [JwtGuard](../../apps/api/src/auth/jwt.guard.ts), [client RAM store](../../apps/web/lib/auth.tsx). [49 phương thức nghiệp vụ](../features/backend-nestjs-migration/routes.json) giữ payload/ownership/version của từng feature.

- Access JWT: RS256, issuer/audience bắt buộc, TTL900s, sub/sid/jti/roles; API vẫn lấy quyền admin hiện tại từ ADMIN_EMAILS và kiểm session chưa thu hồi trong PG. Browser chỉ giữ token trong RAM, không localStorage/sessionStorage/cookie.
- Refresh: random32bytes, DB chỉ SHA256; cookie HttpOnly, SameSite=Lax, path=/api/auth, Secure trên HTTPS, TTL tuyệt đối30ngày. Local loopback HTTP được phép cookie không Secure; production public phải HTTPS. Transaction khóa token/session, rotate mỗi lần; replay thu hồi cả family. Logout/reset/change password thu hồi session.
- Auth POST yêu cầu đúng Origin và signed double-submit CSRF: GET /api/auth/csrf cấp token JSON, nonce HttpOnly; gửi x-csrf-token. Rate limit Redis theo IP/action. API nghiệp vụ dùng Bearer, mutation JSON và chặn Origin khác nếu có. Không tin x-user-id/body role.
- API auth native: POST sign-up/email, sign-in/email, refresh, logout, logout-all, request-password-reset, reset-password, change-password, google/start; GET csrf, me, verify-email, callback/google. Prefix /api/auth. Đăng ký không tự cấp phiên trước verify; link verify/reset dùng một lần. Google code+PKCE+state+nonce và cookie ràng buộc browser; explicit link cần active session, không tự gộp email.
- Client bootstrap refresh, singleflight trong tab, navigator.locks giữa các tab, retry một lần khi ACCESS_TOKEN_EXPIRED; logout BroadcastChannel xóa RAM. Lỗi mạng không giả trạng thái guest. API riêng tư audio fetch Bearer rồi blob URL; revoke/abort khi unmount/logout.
- 400 validation;401 thiếu/sai/hết token hoặc session revoked;403 verify/admin/CSRF/origin;404 owner resource không tồn tại;409 version/dedup;415 content type;429 rate;503 provider cấu hình/không sẵn sàng theo feature. Global error {statusCode,code,error,requestId}, stack chỉ server.
- Chấm:202/jobId khi queued,200 cached completed; cached failed409 GRADING_PREVIOUS_FAILED/submissionId/retryable. Retry explicit với requestId mới; không tự retry submit đã có side effect.

GET profile chỉ explicit user fields và providers; không password/provider tokens. Không lưu Google access/refresh/id token. [Identity](../features/identity-auth/README.md) · [Logging](error-handling.md).

## ORM và Redis — 2026-11-01

AuthService dùng TypeORM transaction cho refresh family/token và credential, giữ RS256/CSRF/ownership. Rate limit không phụ thuộc Redis; xem [hợp đồng ORM/Redis chuẩn](architecture.md#orm-và-redis--2026-11-01) và [audit](../features/postgresql-orm-migration/audit.md).
