# Function description — platform-operations

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [lib/api.ts](../../../lib/api.ts) · `api` | `export function api( path: string, handler: (r: NextRequest, u: Viewer) => Promise<unknown>, admin = false, )` | Bọc handler với session, verified email, role, Origin/content-type và chuẩn hóa lỗi. |
| [lib/client.ts](../../../lib/client.ts) · `request` | `export async function request<T = Record<string, unknown>>( url: string, method = "GET", body?: unknown, ): Promise<T>` | Hàm/binding `request` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/client.ts](../../../lib/client.ts) · `speak` | `export function speak(text: string)` | Hàm/binding `speak` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/db.ts](../../../lib/db.ts) · `connectDb` | `export async function connectDb()` | Kết nối/cache MongoDB bằng Mongoose. |
| [lib/logger.ts](../../../lib/logger.ts) · `configuredLevel` | `function configuredLevel(): LogLevel` | Hàm/binding `configuredLevel` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/logger.ts](../../../lib/logger.ts) · `redact` | `function redact(value: string): string` | Hàm/binding `redact` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/logger.ts](../../../lib/logger.ts) · `safeFields` | `function safeFields(fields: LogFields): LogFields` | Hàm/binding `safeFields` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/logger.ts](../../../lib/logger.ts) · `log` | `export function log(level: LogLevel, event: string, fields: LogFields =` | Ghi structured JSON đã redact, theo LOG_LEVEL. |
| [lib/logger.ts](../../../lib/logger.ts) · `logError` | `export function logError(event: string, error: unknown, fields: LogFields =` | Chuẩn hóa Error trước gửi log có redaction. |
| [lib/logger.ts](../../../lib/logger.ts) · `incomingRequestId` | `function incomingRequestId(request: NextRequest): string` | Hàm/binding `incomingRequestId` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/logger.ts](../../../lib/logger.ts) · `withApiLogging` | `export function withApiLogging(route: string, handler: ApiHandler)` | Gắn requestId, đo duration/status và xử lý lỗi ngoài handler, không log body. |
| [lib/redis.ts](../../../lib/redis.ts) · `redis` | `export const redis` | Hàm/binding `redis` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/redis.ts](../../../lib/redis.ts) · `getGradingQueue` | `export function getGradingQueue()` | Khởi tạo lazy BullMQ Queue để import module lúc build không kết nối Redis. |
| [lib/redis.ts](../../../lib/redis.ts) · `rateLimit` | `export async function rateLimit(userId: string, action: string, max = 20)` | Đếm request theo action/user/phút bằng Redis; không phải quota thương mại. |
| [lib/sql/index.ts](../../../lib/sql/index.ts) · `pool` | `export const pool` | Hàm/binding `pool` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/sql/index.ts](../../../lib/sql/index.ts) · `db` | `export const db` | Hàm/binding `db` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/sql/index.ts](../../../lib/sql/index.ts) · `query` | `export async function query<T extends QueryResultRow = QueryResultRow>( sql: string, values: unknown[] = [], )` | Thực thi SQL parameterized qua pg Pool và trả rows. |
| [lib/types.ts](../../../lib/types.ts) · `TOPICS` | `export const TOPICS` | Component/type `TOPICS` thuộc luồng hạ tầng, hợp đồng dùng chung và vận hành; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [lib/types.ts](../../../lib/types.ts) · `LEVELS` | `export const LEVELS` | Component/type `LEVELS` thuộc luồng hạ tầng, hợp đồng dùng chung và vận hành; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [scripts/backup.ps1](../../../scripts/backup.ps1) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [scripts/migrate.ts](../../../scripts/migrate.ts) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [scripts/start-standalone.mjs](../../../scripts/start-standalone.mjs) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [migrations/001_beta.sql](../../../migrations/001_beta.sql) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [migrations/002_vectors.sql](../../../migrations/002_vectors.sql) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [migrations/003_exam_concurrency.sql](../../../migrations/003_exam_concurrency.sql) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) · `signup` | `async function signup(client: typeof a, email: string)` | Hàm/binding `signup` phục vụ hạ tầng, hợp đồng dùng chung và vận hành; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [tests/unit/grading.test.ts](../../../tests/unit/grading.test.ts) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [tests/unit/learning.test.ts](../../../tests/unit/learning.test.ts) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [package.json](../../../package.json) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [package-lock.json](../../../package-lock.json) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [next.config.ts](../../../next.config.ts) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [tsconfig.json](../../../tsconfig.json) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [eslint.config.mjs](../../../eslint.config.mjs) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [Dockerfile](../../../Dockerfile) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [docker-compose.yml](../../../docker-compose.yml) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [Caddyfile](../../../Caddyfile) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [.dockerignore](../../../.dockerignore) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [playwright.config.ts](../../../playwright.config.ts) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [vitest.config.ts](../../../vitest.config.ts) | Cấu hình/schema/asset/script | Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared. |
| [scripts/check-documentation.mjs](../../../scripts/check-documentation.mjs) · filesIn | CLI docs:check / docs:sync | Đọc code-map, kiểm owner/file/symbol/hash và relative links; --refresh chỉ cập nhật hash sau review, không chứng nhận ngữ nghĩa. |

## Input, output và lỗi theo điểm vào

| Source/symbol | Hành vi |
|---|---|
| [scripts/planning.mjs](../../../scripts/planning.mjs) · validatePlanning(model) | Kiểm unique IDs, WBS/task/dependency/milestone refs, cycles, status/evidence/dependency Done, Core/Stretch, commitment capacity. Throw Error khi sai |
| [scripts/planning.mjs](../../../scripts/planning.mjs) · buildViews(model) | Tạo7 Markdown/CSV views từ cùng model; không tính lại baseline thành % backlog, không ghi DB |
| [scripts/planning.mjs](../../../scripts/planning.mjs) · run() | Read JSON, validate, --write sinh view hoặc mặc định check drift; lỗi exit nonzero; npm plan:sync/plan:check |
| [tests/unit/planning.test.ts](../../../tests/unit/planning.test.ts) | Kiểm không Done giả, prerequisite/cycle, Core phụ thuộc Stretch, overcommit và derived progress |

- api(path,handler,admin) — guard và JSON/error wrapper.
- query(sql,values), connectDb(), rateLimit(), getGradingQueue(), log/withApiLogging là module shared.

Migrations001–003 tạo schema PostgreSQL; lib/sql/index dùng pg Pool + Drizzle auth; Redis queue có AOF/noeviction. lib/types là hợp đồng shared.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).

## Planning cập nhật 2026-10-31

`buildViews` trong [planning.mjs](../../../scripts/planning.mjs) dùng nhãn PBIs chưa xếp sprint thay deferred: item Core chưa được schedule vẫn có thể nằm ngoài sprint. Unit fixture reset trạng thái để test invariants không phụ thuộc tiến độ thực tế; test riêng validate dữ liệu tracking hiện tại.

## Thay đổi speech enabler

Dockerfile thêm native portable/AVX2 pinned + target speech-worker và speech-api-worker nhẹ không model; Compose profiles speech/speech-api, volumes speech_media/speech_models; app mount media UID1001, worker limits/grace. package scripts speech:worker/speech:model. .env.example chỉ tên biến, SPEECH_PROVIDER default disabled. next.config outputFileTracingExcludes loại private artifacts, xem [ops](../../shared/operations.md) và [feature](../self-hosted-speech/functions.md).

Shared test helper [verified accounts](../../shared/testing.md) phục vụ E2E catalogue; không là API sản phẩm, không dùng credential thật.

## 2026-10-31 — Worker/exception contract

`ProviderError`, `retryAfterMs`, `generateJson`, `aiErrorResponse` tại lib/ai.ts; `recover`, `reconcileFailure`, worker callbacks tại scripts/worker.ts. `installProcessErrorHandlers` và `guardedTask` tại lib/process-errors.ts; Pool idle-error listener tại lib/sql/index.ts; recursive `safeFields` tại lib/logger.ts. [Chuẩn dùng chung](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).
