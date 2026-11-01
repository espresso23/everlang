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

## AW implementation map (đặc tả trước code, hiện implemented local)

- apps/web/components/shell.tsx — Shell: admin navigation, role label, mode switch, route active.
- apps/web/app/admin/layout.tsx — AdminLayout: pending/error/denied gate.
- apps/web/app/admin/overview/page.tsx — AdminOverview: entry points to existing editors.
- apps/web/app/sign-in/page.tsx — Form: authenticated landing by role; social callback /sign-in.
- tests/e2e/admin-workspace.spec.ts — browser acceptance fixtures; upstream OAuth not certified.


## Editorial workbench — planned2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.

## EW-01–05 implementation — 2026-11-01

- [EditorialDesk](../../../apps/web/components/editorial-desk.tsx): shared filtered table/server pager, URL query state, explicit draft selection, source/rights per-item CAS, JSON dry-run/import(max50/1MB), editor previous/next within page. No automatic content review or bulk publish. Conflict rows remain selected for reconciliation; successful rows not retried.
- [StudentPreview](../../../apps/web/components/editorial-preview.tsx): immutable saved snapshot, exact key/revision/editVersion or id/contentVersion; publicEntry answer projection; local grade/reveal without learner API mutations. Set references fetched by exact saved set revision. Native dialog Escape/focus return and explicit publish confirmation; server CAS still authoritative.
- [KnowledgeSections](../../../apps/web/components/knowledge-sections.tsx) shared with learner Reader; learner bookmark/TTS callbacks remain only in actual reader. Preview does not pretend to exercise media/ASR or learner persistence.
- [editorial contracts](../../../packages/contracts/src/editorial.ts): bounded25/50/100 pages, offset0..1M, literal search, status/sort whitelist and sentence import schema. Three admin services map queryParams into content-store filters/count before page; sort ties key/revision orid.
- Sentence importKey SHA256 -> user-scoped deterministic24hexID; same payload returns duplicate without overwrite, changed payload409; races reconcile unique conflict. Knowledge/catalog repeated keys409, never overwrite. No schema migration. Reviewed sentence edit resets draft and requires review again.
- Metadata export/CSV mapping/whole-dataset select-all and automatic review are outside this increment. Existing list shows explicit versions, not fabricated grouped logical totals. New modules retain existing topic/level taxonomies.
