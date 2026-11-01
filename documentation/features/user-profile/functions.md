# Function map — user-profile

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/app/profile/page.tsx](../../../apps/web/app/profile/page.tsx) | `Profile`, `AccountSecurity`, `LegacyDraftImport` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/profile.service.ts](../../../apps/api/src/domains/profile.service.ts) | `ProfileService`, `ProfileService.get`, `ProfileService.put` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/components/user-avatar.tsx](../../../apps/web/components/user-avatar.tsx) | `UserAvatar` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/contracts/src/profile.ts](../../../packages/contracts/src/profile.ts) | `profileInput`, `ProfileResponse` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/unit/profile.test.ts](../../../tests/unit/profile.test.ts) | `valid` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/profile-ui.spec.ts](../../../tests/e2e/profile-ui.spec.ts) | `user`, `profile`, `session` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [apps/web/app/profile/profile.css](../../../apps/web/app/profile/profile.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/profile.controller.ts](../../../apps/api/src/domains/profile.controller.ts) | `ProfileController`, `ProfileController.get`, `ProfileController.put` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.
