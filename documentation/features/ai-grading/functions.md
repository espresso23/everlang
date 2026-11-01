# Function map — ai-grading

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/api/src/domains/submissions-grade.service.ts](../../../apps/api/src/domains/submissions-grade.service.ts) | `SubmissionsGradeService`, `SubmissionsGradeService.post` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/jobs.service.ts](../../../apps/api/src/domains/jobs.service.ts) | `JobsService`, `JobsService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [packages/backend/src/ai.ts](../../../packages/backend/src/ai.ts) | `ProviderError`, `retryAfterMs`, `grammarError`, `vocabSuggestion`, `rewrite`, `gradeSchema`, `sentenceSchema`, `generationSchema`, `generateJson`, `generateExercises`, `gradeTranslation`, `aiErrorResponse` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/worker/src/grading.processor.ts](../../../apps/worker/src/grading.processor.ts) | `recovering`, `recover`, `reconcileFailure`, `GradingProcessor`, `GradingProcessor.onModuleInit`, `GradingProcessor.onModuleDestroy`, `GradingProcessor.process`, `GradingProcessor.execute`, `GradingProcessor.onFailed`, `GradingProcessor.persistFailure`, `GradingProcessor.onError` | Nest WorkerHost: xử lý BullMQ job, recovery/retry, cập nhật trạng thái durable và log requestId/jobId/attempt. |
| [tests/unit/grading-worker.test.ts](../../../tests/unit/grading-worker.test.ts) | `state`, `processor`, `load`, `signalListeners` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/grading-retry.test.ts](../../../tests/unit/grading-retry.test.ts) | `state`, `service`, `viewer`, `POST`, `request` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/grading-retry.spec.ts](../../../tests/e2e/grading-retry.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [apps/api/src/domains/jobs.controller.ts](../../../apps/api/src/domains/jobs.controller.ts) | `JobsController`, `JobsController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/submissions-grade.controller.ts](../../../apps/api/src/domains/submissions-grade.controller.ts) | `SubmissionsGradeController`, `SubmissionsGradeController.post` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/api/src/domains/submissions-grade.service.ts](../../../apps/api/src/domains/submissions-grade.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/jobs.service.ts](../../../apps/api/src/domains/jobs.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/worker/src/grading.processor.ts](../../../apps/worker/src/grading.processor.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [tests/unit/grading-worker.test.ts](../../../tests/unit/grading-worker.test.ts): Kiểm regression hành vi bằng ORM mock hoặc native runtime.
- [tests/unit/grading-retry.test.ts](../../../tests/unit/grading-retry.test.ts): Kiểm regression hành vi bằng ORM mock hoặc native runtime.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

## 2026-11-01 — New click after a failed attempt

A new ordinary POST grade request no longer stops at the old base failed dedup row. The service preserves that history and resolves a separate requestId-keyed attempt, returning202/queue. Replaying the same UUID resolves the same attempt (including409 if that exact retry has failed); a new button click has a new UUID. Completed base reports still return200 cached:true, explicit forceRegrade still works. No automatic new attempt from polling/process recovery and no infinite retry loop. Dedup/error state is durable PostgreSQL data, not in-memory response cache. Implementation: SubmissionsGradeService.post; tests/unit/grading-retry.test.ts and native nest-auth E2E. This supersedes the earlier always409-on-base-failed behavior.

Original request UUID is retained in snapshot.gradingRequestId to distinguish a new click from replay of that original failed request. reportView strips it from returned report sentence. Legacy snapshots without this optional marker remain readable.
