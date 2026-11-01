# Function map — vocabulary-srs

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/app/vocabulary/page.tsx](../../../apps/web/app/vocabulary/page.tsx) | `Card`, `Vocabulary`, `Page` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/vocabulary.service.ts](../../../apps/api/src/domains/vocabulary.service.ts) | `fields`, `VocabularyService`, `VocabularyService.get`, `VocabularyService.post`, `VocabularyService.put` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/reviews.service.ts](../../../apps/api/src/domains/reviews.service.ts) | `ReviewsService`, `ReviewsService.post` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [packages/backend/src/learning/srs.ts](../../../packages/backend/src/learning/srs.ts) | `ALGORITHM`, `schedulerPromise`, `newCard`, `reviewCard` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/reviews.controller.ts](../../../apps/api/src/domains/reviews.controller.ts) | `ReviewsController`, `ReviewsController.post` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/vocabulary.controller.ts](../../../apps/api/src/domains/vocabulary.controller.ts) | `VocabularyController`, `VocabularyController.get`, `VocabularyController.post`, `VocabularyController.put` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

VocabularyService.get(Request,Viewer) → {items,dueCount,serverNow}; timestamp ISO từ PostgreSQL. Vocabulary.load tại apps/web/app/vocabulary/page.tsx chọn active bằng serverNow, refresh sau save/review. Ownership/suspended/CAS/FSRS không đổi.

## ORM — 2026-11-01

- [apps/api/src/domains/vocabulary.service.ts](../../../apps/api/src/domains/vocabulary.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/reviews.service.ts](../../../apps/api/src/domains/reviews.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.
