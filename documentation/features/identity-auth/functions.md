# Function map — identity-auth

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/api/src/auth/auth.service.ts](../../../apps/api/src/auth/auth.service.ts) | `isAdmin`, `origin`, `secure`, `refreshName`, `issuer`, `audience`, `UserRow`, `publicUser`, `AuthService`, `AuthService.csrf`, `AuthService.protect`, `AuthService.cookie`, `AuthService.access`, `AuthService.startSession`, `AuthService.login`, `AuthService.refresh`, `AuthService.authenticate`, `AuthService.logout`, `AuthService.oneTime`, `AuthService.signup`, `AuthService.verifyEmail`, `AuthService.requestReset`, `AuthService.resetPassword`, `AuthService.changePassword`, `AuthService.googleStart`, `AuthService.googleCallback` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/lib/auth.tsx](../../../apps/web/lib/auth.tsx) | `User`, `Snapshot`, `snapshot`, `serverSnapshot`, `accessToken`, `initialized`, `refreshing`, `listeners`, `channel`, `update`, `signedOut`, `csrf`, `authRequest`, `refresh`, `bootstrap`, `AuthProvider`, `useAuth`, `apiFetch`, `execute`, `auth` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [migrations/008_nest_auth.sql](../../../migrations/008_nest_auth.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [apps/web/app/sign-in/page.tsx](../../../apps/web/app/sign-in/page.tsx) | `Form`, `SignIn` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/auth/auth.controller.ts](../../../apps/api/src/auth/auth.controller.ts) | `password`, `email`, `AuthController`, `AuthController.csrf`, `AuthController.login`, `AuthController.signup`, `AuthController.refresh`, `AuthController.me`, `AuthController.logout`, `AuthController.logoutAll`, `AuthController.verify`, `AuthController.forgot`, `AuthController.reset`, `AuthController.change`, `AuthController.google`, `AuthController.callback` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/config.service.ts](../../../apps/api/src/domains/config.service.ts) | `ConfigService`, `ConfigService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/lib/auth-errors.ts](../../../apps/web/lib/auth-errors.ts) | `authErrorMessage` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/auth/jwt.guard.ts](../../../apps/api/src/auth/jwt.guard.ts) | `AuthenticatedRequest`, `JwtGuard`, `JwtGuard.canActivate` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/config.controller.ts](../../../apps/api/src/domains/config.controller.ts) | `ConfigController`, `ConfigController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [packages/backend/src/auth-crypto.ts](../../../packages/backend/src/auth-crypto.ts) | `randomToken`, `tokenHash`, `key`, `hashPassword`, `verifyPassword` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/e2e/nest-auth.spec.ts](../../../tests/e2e/nest-auth.spec.ts) | `routes` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/auth-crypto.test.ts](../../../tests/unit/auth-crypto.test.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/helpers/jwt-context.ts](../../../tests/e2e/helpers/jwt-context.ts) | `installed`, `installJwtContext` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/nest-jwt.test.ts](../../../tests/unit/nest-jwt.test.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## Native auth contracts

| Symbol | Input → output / side effect / errors |
|---|---|
| AuthService.protect/csrf | Request/Response→signed CSRF JSON+nonce HttpOnly; Origin/signature403,rate429 |
| signup/verifyEmail | name/email/password→pending verify; one-time token→verified user/session+redirect; duplicate409,expired400 |
| login/startSession | credentials/userId→accessToken/expiresIn/user+cookie; transaction creates family/hash; credentials401,unverified403 |
| refresh | HttpOnly token→rotated hash/cookie, same absolute expiry,new access; FOR UPDATE/replay revokes family401 |
| authenticate | Bearer→Viewer+sid from DB; RS256/issuer/aud/exp+active session;401 invalid/expired/revoked |
| logout | current/all flag→revoke sid/all sessions,clear cookie; valid JWT required |
| requestReset/resetPassword/changePassword | email/token/current+new password→generic success/password replacement; one-time reset,session revocation |
| googleStart/googleCallback | link+relative callback→PKCE URL; code/state/browser cookie→verify ID token,lookup/explicit link,session+redirect; no implicit email merge/token storage |
| AuthProvider/useAuth/apiFetch/auth | RAM/Bearer,bootstrap/singleflight/tab lock,one expiry retry,CSRF auth POST,logout broadcast; no persistent browser token |

Methods are native AuthController decorators; body schemas strict Zod. Callback Location has whitelisted account_not_linked or generic google_login_failed; never raw query/provider text. Actual verification in audit.

## ORM — 2026-11-01

- [apps/api/src/auth/auth.service.ts](../../../apps/api/src/auth/auth.service.ts): AuthService login/refresh/authenticate dùng explicit alias/password/used_at; transaction/replay/ownership giữ nguyên.
- [tests/unit/nest-jwt.test.ts](../../../tests/unit/nest-jwt.test.ts): Kiểm regression hành vi bằng ORM mock hoặc native runtime.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

## PostgreSQL-only configuration — 2026-11-01

[validateRuntimeEnvironment](../../../apps/api/src/runtime-config.ts) is used by AppModule: DATABASE_URL/Redis/JWT/CSRF are required; MONGODB_URI is not. Red/green [configuration regression](../../../tests/unit/runtime-config.test.ts) and actual Mongo-free startup verified; token/session/provider behavior unchanged. [Migration audit](../postgresql-only/audit.md).

## 2026-11-01 — SMTP without runtime Mailpit

[sendAuthEmail](../../../packages/backend/src/auth-mail.ts) owns configured SMTP transport/timeout/error semantics; AuthService calls it for verification/reset. No host defaults to Mailpit. Missing/failed SMTP returns503 EMAIL_UNAVAILABLE without provider details, fake delivery or verification bypass. Existing verified-user login remains unchanged. Mailpit only exists in disposable test Compose; actual external SMTP delivery remains NOT VERIFIED.

Role landing: apps/web/app/sign-in/page.tsx Form dùng useAuth và router.replace theo user.admin; social callback /sign-in. AuthService callback/Google verification không đổi.
