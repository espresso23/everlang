# Function map — backend-nestjs-migration

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/api/package.json](../../../apps/api/package.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/tsconfig.json](../../../apps/api/tsconfig.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/next-env.d.ts](../../../apps/web/next-env.d.ts) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/package.json](../../../apps/web/package.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/tsconfig.json](../../../apps/web/tsconfig.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/worker/package.json](../../../apps/worker/package.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/worker/tsconfig.json](../../../apps/worker/tsconfig.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/app.module.ts](../../../apps/api/src/app.module.ts) | `AppModule` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/health.controller.ts](../../../apps/api/src/health.controller.ts) | `HealthController`, `HealthController.live`, `HealthController.ready` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/http-boundary.ts](../../../apps/api/src/http-boundary.ts) | `requestLogging`, `respondError`, `GlobalExceptionFilter`, `GlobalExceptionFilter.catch`, `ResponseInterceptor`, `ResponseInterceptor.intercept` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/main.ts](../../../apps/api/src/main.ts) | `bootstrap` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/domains.module.ts](../../../apps/api/src/domains/domains.module.ts) | `DomainsModule` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/public/file.svg](../../../apps/web/public/file.svg) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/public/globe.svg](../../../apps/web/public/globe.svg) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/public/next.svg](../../../apps/web/public/next.svg) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/public/vercel.svg](../../../apps/web/public/vercel.svg) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/public/window.svg](../../../apps/web/public/window.svg) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/worker/src/main.ts](../../../apps/worker/src/main.ts) | `speech`, `url`, `WorkerModule`, `main` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/package.json](../../../packages/backend/package.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/tsconfig.json](../../../packages/backend/tsconfig.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/contracts/package.json](../../../packages/contracts/package.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/contracts/tsconfig.json](../../../packages/contracts/tsconfig.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/http.ts](../../../packages/backend/src/http.ts) | `Viewer`, `HttpError`, `HttpResult`, `HttpResult.json`, `BinaryResult`, `queryParams` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/queue.ts](../../../packages/backend/src/queue.ts) | `CorrelatedQueue`, `CorrelatedQueue.add` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/contracts/src/speech.ts](../../../packages/contracts/src/speech.ts) | `SpeechAttemptView` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/dev.mjs](../../../scripts/dev.mjs) | `children` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [Gatewayfile](../../../Gatewayfile) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [.env.example](../../../.env.example) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tsconfig.tools.json](../../../tsconfig.tools.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/check-backend-boundary.mjs](../../../scripts/check-backend-boundary.mjs) | `files`, `lock` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/init-auth-keys.mjs](../../../scripts/init-auth-keys.mjs) | `target`, `existing`, `keys`, `output` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/e2e/private-audio.spec.ts](../../../tests/e2e/private-audio.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/integration/auth-preservation.sql](../../../tests/integration/auth-preservation.sql) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/integration/private-audio-fixture.mjs](../../../tests/integration/private-audio-fixture.mjs) | `key` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/nest-boundary.test.ts](../../../tests/unit/nest-boundary.test.ts) | `response` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/integration/compose.nest-qa.yml](../../../tests/integration/compose.nest-qa.yml) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/integration/NestQaGatewayfile](../../../tests/integration/NestQaGatewayfile) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/api/src/app.module.ts](../../../apps/api/src/app.module.ts): Import DatabaseModule toàn cục.
- [apps/api/src/health.controller.ts](../../../apps/api/src/health.controller.ts): PG/Mongo readiness; Redis down trảdegraded/queueAvailable false.
- [apps/api/src/main.ts](../../../apps/api/src/main.ts): TypeOrmModule đóng DataSource khi app.close, bỏ pool.end thủ công.
- [apps/worker/src/main.ts](../../../apps/worker/src/main.ts): TypeOrmModule dùng cùng databaseOptions, Nest quản lý lifecycle.
- [packages/backend/src/queue.ts](../../../packages/backend/src/queue.ts): CorrelatedQueue bắt lỗi connection/enqueue, giữtrace, trả503/QUEUE_UNAVAILABLE.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.

## PostgreSQL-only — 2026-11-01

Current persistence: [content store](../../../packages/backend/src/content-store.ts), [mapped envelopes](../../../packages/backend/src/content-entities.ts), [atomic offline importer](../../../packages/backend/src/content-import.ts). Mongo models/connectDb are removed; existing routes, validation, ownership, version/CAS and snapshots remain. [Canonical migration contract](../postgresql-only/README.md) supersedes the earlier Mongo persistence descriptions; historical evidence is not new verification.
