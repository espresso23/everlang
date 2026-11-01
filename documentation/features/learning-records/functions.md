# Function map — learning-records

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/api/src/domains/drafts.service.ts](../../../apps/api/src/domains/drafts.service.ts) | `DraftsService`, `DraftsService.get`, `DraftsService.put` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/submissions.service.ts](../../../apps/api/src/domains/submissions.service.ts) | `SubmissionsService`, `SubmissionsService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/user-favorites.service.ts](../../../apps/api/src/domains/user-favorites.service.ts) | `UserFavoritesService`, `UserFavoritesService.get`, `UserFavoritesService.post` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/user-stats.service.ts](../../../apps/api/src/domains/user-stats.service.ts) | `UserStatsService`, `UserStatsService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [packages/backend/src/learning/submissions.ts](../../../packages/backend/src/learning/submissions.ts) | `StoredSubmission`, `reportView`, `statistics` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/content-store.ts](../../../packages/backend/src/content-store.ts) | `GrammarErrorSchema`, `VocabSuggestionSchema`, `RewriteSchema`, `SubmissionSchema`, `Submission` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/content-store.ts](../../../packages/backend/src/content-store.ts) | `UserSentenceStateSchema`, `UserSentenceState` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/import-records.ts](../../../scripts/import-records.ts) | `c` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/drafts.controller.ts](../../../apps/api/src/domains/drafts.controller.ts) | `DraftsController`, `DraftsController.get`, `DraftsController.put` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/submissions.controller.ts](../../../apps/api/src/domains/submissions.controller.ts) | `SubmissionsController`, `SubmissionsController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/user-favorites.controller.ts](../../../apps/api/src/domains/user-favorites.controller.ts) | `UserFavoritesController`, `UserFavoritesController.get`, `UserFavoritesController.post` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/user-stats.controller.ts](../../../apps/api/src/domains/user-stats.controller.ts) | `UserStatsController`, `UserStatsController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/api/src/domains/drafts.service.ts](../../../apps/api/src/domains/drafts.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/submissions.service.ts](../../../apps/api/src/domains/submissions.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/user-favorites.service.ts](../../../apps/api/src/domains/user-favorites.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [packages/backend/src/learning/submissions.ts](../../../packages/backend/src/learning/submissions.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [scripts/import-records.ts](../../../scripts/import-records.ts): ORM transaction/advisory lock, conflict dedup_key có RETURNING id để đếm đúng; giữ owner guard/Mongo originals.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.
