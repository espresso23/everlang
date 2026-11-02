# Function map — exam-practice

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/app/exams/page.tsx](../../../apps/web/app/exams/page.tsx) | `Q`, `Attempt`, `Exams` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/exams.service.ts](../../../apps/api/src/domains/exams.service.ts) | `mini`, `ExamsService`, `ExamsService.get`, `ExamsService.post`, `ExamsService.patch`, `ExamsService.put` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [packages/contracts/src/exams.ts](../../../packages/contracts/src/exams.ts) | `questionSchema`, `examSchema`, `Exam`, `publicExam`, `scoreExam` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/content-store.ts](../../../packages/backend/src/content-store.ts) | `ExamSchema`, `ExamModel` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/exams.controller.ts](../../../apps/api/src/domains/exams.controller.ts) | `ExamsController`, `ExamsController.get`, `ExamsController.post`, `ExamsController.patch`, `ExamsController.put` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/api/src/domains/exams.service.ts](../../../apps/api/src/domains/exams.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Exams](../../../apps/web/app/exams/page.tsx): submit button → `save(true)`. Nộp bài có dialog Nộp bài/Hủy; chỉ true mới gọi save(true), server deadline/autosave không đổi.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
