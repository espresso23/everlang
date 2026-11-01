# Function map — vocabulary-catalog

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [packages/contracts/src/vocabulary-catalog-contract.ts](../../../packages/contracts/src/vocabulary-catalog-contract.ts) | `CATALOG_TAXONOMY_VERSION`, `catalogTopics`, `catalogKey`, `text`, `bilingual`, `base`, `senseSchema`, `setSchema`, `catalogContentSchema`, `SenseContent`, `SetContent`, `CatalogContent`, `CatalogRecord`, `catalogPublic`, `PublicCatalog`, `CatalogSnapshot`, `catalogRecallContext`, `catalogLearningBody` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/vocabulary-catalog.ts](../../../packages/backend/src/vocabulary-catalog.ts) | `getCatalog`, `catalogSetDetail`, `listCatalog`, `transitionCatalog` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/models/VocabularyCatalog.ts](../../../packages/backend/src/models/VocabularyCatalog.ts) | `schema`, `VocabularyCatalog` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/catalog-learning.ts](../../../packages/backend/src/catalog-learning.ts) | `catalogDay`, `budget`, `catalogLearning`, `saveCatalogLearning`, `saveCatalogPreferences` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/lib/korean-audio.ts](../../../apps/web/lib/korean-audio.ts) | `generation`, `active`, `stopKorean`, `playKorean` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [data/vocabulary-drafts.ts](../../../data/vocabulary-drafts.ts) | `vocabularyDrafts` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/seed-vocabulary-catalog.ts](../../../scripts/seed-vocabulary-catalog.ts) | `common`, `entries`, `inserted` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/word-sets.service.ts](../../../apps/api/src/domains/word-sets.service.ts) | `WordSetsService`, `WordSetsService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/word-sets-learn.service.ts](../../../apps/api/src/domains/word-sets-learn.service.ts) | `WordSetsLearnService`, `WordSetsLearnService.get`, `WordSetsLearnService.post`, `WordSetsLearnService.put` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/admin-word-sets.service.ts](../../../apps/api/src/domains/admin-word-sets.service.ts) | `AdminWordSetsService`, `AdminWordSetsService.get`, `AdminWordSetsService.post`, `AdminWordSetsService.patch` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/app/word-sets/page.tsx](../../../apps/web/app/word-sets/page.tsx) | `Summary`, `Learning`, `statuses`, `WordSets`, `Page` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/word-sets/word-sets.css](../../../apps/web/app/word-sets/word-sets.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/admin/word-sets/page.tsx](../../../apps/web/app/admin/word-sets/page.tsx) | `blank`, `statusLabels`, `Choice`, `WordSetsAdmin` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [migrations/007_vocabulary_catalog.sql](../../../migrations/007_vocabulary_catalog.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [tests/unit/vocabulary-catalog.test.ts](../../../tests/unit/vocabulary-catalog.test.ts) | `base` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/vocabulary-catalog.spec.ts](../../../tests/e2e/vocabulary-catalog.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/korean-audio.test.ts](../../../tests/unit/korean-audio.test.ts) | `FakeUtterance`, `platform` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/vocabulary-catalog-ui.spec.ts](../../../tests/e2e/vocabulary-catalog-ui.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [apps/api/src/domains/admin-word-sets.controller.ts](../../../apps/api/src/domains/admin-word-sets.controller.ts) | `AdminWordSetsController`, `AdminWordSetsController.get`, `AdminWordSetsController.post`, `AdminWordSetsController.patch` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/word-sets-learn.controller.ts](../../../apps/api/src/domains/word-sets-learn.controller.ts) | `WordSetsLearnController`, `WordSetsLearnController.get`, `WordSetsLearnController.post`, `WordSetsLearnController.put` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/word-sets.controller.ts](../../../apps/api/src/domains/word-sets.controller.ts) | `WordSetsController`, `WordSetsController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [packages/backend/src/catalog-learning.ts](../../../packages/backend/src/catalog-learning.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

Audit harness: vocabulary-catalog-ui.spec.ts đọc E2E_CATALOG_UI_EMAIL để test editor và full catalogue dùng hai QA admin khác nhau; danh sách chỉ mở trong compose.orm-qa.yml. Không đổi RBAC/runtime admin settings.
