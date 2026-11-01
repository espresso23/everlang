# Function map — knowledge-library

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [packages/contracts/src/knowledge-contract.ts](../../../packages/contracts/src/knowledge-contract.ts) | `knowledgeKinds`, `knowledgeLabels`, `short`, `knowledgeSchema`, `KnowledgeContent`, `KnowledgeEntry`, `publicEntry`, `PublicKnowledge`, `normalizeKnowledgeAnswer`, `gradeKnowledge`, `knowledgeKey`, `stateSchema` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/knowledge.ts](../../../packages/backend/src/knowledge.ts) | `getKnowledge`, `listKnowledge`, `publicKnowledge`, `knowledgeTitles` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/content-store.ts](../../../packages/backend/src/content-store.ts) | `KnowledgeDocument`, `schema`, `Knowledge` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/knowledge/page.tsx](../../../apps/web/app/knowledge/page.tsx) | `Summary`, `State`, `Feedback`, `emptyState`, `Reader`, `KnowledgeBrowser`, `KnowledgePage` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/knowledge.service.ts](../../../apps/api/src/domains/knowledge.service.ts) | `KnowledgeService`, `KnowledgeService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/knowledge-state.service.ts](../../../apps/api/src/domains/knowledge-state.service.ts) | `KnowledgeStateService`, `KnowledgeStateService.get`, `KnowledgeStateService.put` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/knowledge-attempts.service.ts](../../../apps/api/src/domains/knowledge-attempts.service.ts) | `body`, `KnowledgeAttemptsService`, `KnowledgeAttemptsService.post` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/admin-knowledge.service.ts](../../../apps/api/src/domains/admin-knowledge.service.ts) | `AdminKnowledgeService`, `AdminKnowledgeService.get`, `AdminKnowledgeService.post`, `AdminKnowledgeService.patch` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/app/admin/knowledge/page.tsx](../../../apps/web/app/admin/knowledge/page.tsx) | `Item`, `blank`, `KnowledgeAdmin` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [migrations/004_knowledge.sql](../../../migrations/004_knowledge.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [data/knowledge-seed.ts](../../../data/knowledge-seed.ts) | `SeedRow`, `rows`, `knowledgeSeed` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/seed-knowledge.ts](../../../scripts/seed-knowledge.ts) | `seedKnowledge` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/unit/knowledge.test.ts](../../../tests/unit/knowledge.test.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/knowledge.spec.ts](../../../tests/e2e/knowledge.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [apps/web/app/knowledge/knowledge.css](../../../apps/web/app/knowledge/knowledge.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/admin-knowledge.controller.ts](../../../apps/api/src/domains/admin-knowledge.controller.ts) | `AdminKnowledgeController`, `AdminKnowledgeController.get`, `AdminKnowledgeController.post`, `AdminKnowledgeController.patch` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/knowledge-attempts.controller.ts](../../../apps/api/src/domains/knowledge-attempts.controller.ts) | `KnowledgeAttemptsController`, `KnowledgeAttemptsController.post` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/knowledge-state.controller.ts](../../../apps/api/src/domains/knowledge-state.controller.ts) | `KnowledgeStateController`, `KnowledgeStateController.get`, `KnowledgeStateController.put` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/knowledge.controller.ts](../../../apps/api/src/domains/knowledge.controller.ts) | `KnowledgeController`, `KnowledgeController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/api/src/domains/knowledge-state.service.ts](../../../apps/api/src/domains/knowledge-state.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/knowledge-attempts.service.ts](../../../apps/api/src/domains/knowledge-attempts.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.


## Editorial workbench — planned2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.
