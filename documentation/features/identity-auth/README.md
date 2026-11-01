# Tài khoản và JWT — identity-auth

2026-11-01; implemented, verification xem [audit](audit.md). [Hợp đồng chuẩn](../../shared/auth-and-api.md) · [Function map](functions.md) · [Thiết kế](system-design.md) · [UI](ui.md).

| Yêu cầu | Code | Evidence |
|---|---|---|
| Đăng ký mở, mật khẩu10–128, email verify trước cấp phiên | AuthController.signup/AuthService.signup,verifyEmail | tests/e2e/beta.spec.ts,nest-auth.spec.ts |
| Login scrypt giữ hash/ID cũ; RS256900s RAM/Bearer | AuthService.login,access,authenticate; web auth store | auth-crypto.test.ts,nest-jwt.test.ts |
| Refresh hash/rotate/replay/30d absolute/HttpOnly | AuthService.startSession,refresh,cookie | nest-auth.spec.ts |
| CSRF/Origin/rate/admin/ownership | AuthService.protect/JwtGuard và domain services | nest-auth.spec.ts,knowledge.spec.ts |
| Logout/reset/change password thu hồi phiên | AuthService.logout,resetPassword,changePassword | beta.spec.ts,nest-auth.spec.ts |
| Google PKCE/state/nonce/browser binding, explicit link, giữ identity | AuthService.googleStart,googleCallback | callback rejection verified; Google live NOT VERIFIED sau migration |

Old sessions và verify/reset links vô hiệu sau008. User ID, Google provider subject, credential password hash và business FK giữ nguyên. SMTP local verified qua Mailpit; SMTP production cần cấu hình thật. Không xem Google đã verified trên backend cũ là bằng chứng cho Nest mới.

## 2026-11-01 — SMTP without runtime Mailpit

[sendAuthEmail](../../../packages/backend/src/auth-mail.ts) owns configured SMTP transport/timeout/error semantics; AuthService calls it for verification/reset. No host defaults to Mailpit. Missing/failed SMTP returns503 EMAIL_UNAVAILABLE without provider details, fake delivery or verification bypass. Existing verified-user login remains unchanged. Mailpit only exists in disposable test Compose; actual external SMTP delivery remains NOT VERIFIED.
