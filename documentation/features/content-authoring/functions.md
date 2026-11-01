# Function map — content-authoring

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/app/admin/page.tsx](../../../apps/web/app/admin/page.tsx) | `Content`, `Admin`, `AdvancedTools` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/admin-content.service.ts](../../../apps/api/src/domains/admin-content.service.ts) | `body`, `AdminContentService`, `AdminContentService.get`, `AdminContentService.post`, `AdminContentService.patch` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/sentences-generate.service.ts](../../../apps/api/src/domains/sentences-generate.service.ts) | `SentencesGenerateService`, `SentencesGenerateService.post` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [packages/backend/src/content-store.ts](../../../packages/backend/src/content-store.ts) | `ISentence`, `SentenceSchema`, `Sentence` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/content.ts](../../../packages/backend/src/content.ts) | `seed`, `initializeContent`, `publishedSentence`, `contentReady`, `ensureContent` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [data/seed-sentences.json](../../../data/seed-sentences.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/extract-seed.py](../../../scripts/extract-seed.py) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/admin-content.controller.ts](../../../apps/api/src/domains/admin-content.controller.ts) | `AdminContentController`, `AdminContentController.get`, `AdminContentController.post`, `AdminContentController.patch` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/sentences-generate.controller.ts](../../../apps/api/src/domains/sentences-generate.controller.ts) | `SentencesGenerateController`, `SentencesGenerateController.post` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.
