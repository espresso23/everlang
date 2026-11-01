# Function map — platform-operations

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/lib/client.ts](../../../apps/web/lib/client.ts) | `request`, `speak` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/db.ts](../../../packages/backend/src/db.ts) | `CachedConnection`, `globalWithMongoose`, `cache`, `connectDb` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/logger.ts](../../../packages/backend/src/logger.ts) | `RequestContext`, `LogLevel`, `LogFields`, `requestContext`, `correlationId`, `levelWeight`, `configuredLevel`, `redact`, `safeFields`, `log`, `logError` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/redis.ts](../../../packages/backend/src/redis.ts) | `state`, `redis`, `getGradingQueue`, `rateLimit` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/sql/index.ts](../../../packages/backend/src/sql/index.ts) | `shared`, `pool`, `query` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/contracts/src/types.ts](../../../packages/contracts/src/types.ts) | `TOPICS`, `LEVELS`, `Topic`, `Level`, `Sentence`, `GradeReport` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/backup.ps1](../../../scripts/backup.ps1) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/migrate.ts](../../../scripts/migrate.ts) | `client` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/gateway.mjs](../../../scripts/gateway.mjs) | `port`, `target`, `server` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [migrations/001_beta.sql](../../../migrations/001_beta.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [migrations/002_vectors.sql](../../../migrations/002_vectors.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [migrations/003_exam_concurrency.sql](../../../migrations/003_exam_concurrency.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/grading.test.ts](../../../tests/unit/grading.test.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/unit/learning.test.ts](../../../tests/unit/learning.test.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [package.json](../../../package.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [package-lock.json](../../../package-lock.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/next.config.ts](../../../apps/web/next.config.ts) | `nextConfig` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tsconfig.json](../../../tsconfig.json) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [eslint.config.mjs](../../../eslint.config.mjs) | `eslintConfig` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [Dockerfile](../../../Dockerfile) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [docker-compose.yml](../../../docker-compose.yml) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [Caddyfile](../../../Caddyfile) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [.dockerignore](../../../.dockerignore) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [playwright.config.ts](../../../playwright.config.ts) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [vitest.config.ts](../../../vitest.config.ts) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/check-documentation.mjs](../../../scripts/check-documentation.mjs) | `manifestPath`, `manifest`, `refresh`, `failures`, `sourceRoots`, `filesIn`, `sourceFiles`, `byFile`, `links` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [scripts/planning.mjs](../../../scripts/planning.mjs) | `root`, `table`, `csv`, `generated`, `validatePlanning`, `buildViews`, `run` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/unit/planning.test.ts](../../../tests/unit/planning.test.ts) | `current`, `model` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/helpers/account.ts](../../../tests/e2e/helpers/account.ts) | `verifiedAccount` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [packages/backend/src/process-errors.ts](../../../packages/backend/src/process-errors.ts) | `installProcessErrorHandlers`, `guardedTask` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/unit/runtime-errors.test.ts](../../../tests/unit/runtime-errors.test.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/integration/worker-runtime.ts](../../../tests/integration/worker-runtime.ts) | `connection`, `name`, `queue`, `events`, `times`, `worker`, `killer` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.
