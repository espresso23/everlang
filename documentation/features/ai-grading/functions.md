# Function description — ai-grading

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/api/submissions/grade/route.ts](../../../app/api/submissions/grade/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/jobs/route.ts](../../../app/api/jobs/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/ai.ts](../../../lib/ai.ts) · `gradeSchema` | `export const gradeSchema` | Hàm/binding `gradeSchema` phục vụ chấm ai bất đồng bộ; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/ai.ts](../../../lib/ai.ts) · `generateJson` | `export async function generateJson<T>(schema: z.ZodType<T>, prompt: string): Promise<T>` | Gọi OpenRouter có timeout, phục hồi JSON rồi xác minh Zod. |
| [lib/ai.ts](../../../lib/ai.ts) · `generateExercises` | `export async function generateExercises(topic: string, level: string, count: number)` | Yêu cầu AI tạo bản nháp bài dịch theo topic/level/count. |
| [lib/ai.ts](../../../lib/ai.ts) · `gradeTranslation` | `export async function gradeTranslation(input:` | Tạo rubric bản dịch, lọc trích dẫn sai/không có trong bài và lỗi chỉ dấu câu; tính rating theo score. |
| [lib/ai.ts](../../../lib/ai.ts) · `aiErrorResponse` | `export function aiErrorResponse(error: unknown)` | Ánh xạ lỗi provider/schema thành status/message ứng dụng. |
| [scripts/worker.ts](../../../scripts/worker.ts) · `recover` | `async function recover()` | Đọc queued/active từ SQL và enqueue idempotent; còn khôi phục Writing queued. |

## Input, output và lỗi theo điểm vào

- POST /api/submissions/grade — {sentenceId,userTranslation,requestId,forceRegrade}; cached report 200 hoặc {jobId,status} 202.
- GET /api/jobs?id=... — {status,error,report}; chủ khác 404.

submissions SQL là nguồn trạng thái bền vững; Redis giữ queue. Worker còn xử lý exam-writing. AI cùng adapter cũng dùng sinh học liệu/Tutor/transcript feedback.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).

## 2026-10-31 — Worker/exception contract

`ProviderError`, `retryAfterMs`, `generateJson`, `aiErrorResponse` tại lib/ai.ts; `recover`, `reconcileFailure`, worker callbacks tại scripts/worker.ts. `installProcessErrorHandlers` và `guardedTask` tại lib/process-errors.ts; Pool idle-error listener tại lib/sql/index.ts; recursive `safeFields` tại lib/logger.ts. [Chuẩn dùng chung](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).

## 2026-10-31 — Retry failed grading

POST tại app/api/submissions/grade/route.ts thêm409 {error,code:GRADING_PREVIOUS_FAILED,submissionId,retryable:true} khi own dedup row đã failed; completed vẫn cache200, queued/force retry202. Practice.submit và retryGrading trong components/practice.tsx đưa action retry tới alert sau failed409 hoặc failed polling; giữ gradingRequestRef chống double click, localStorage draft và pending job logic. [Audit](../../audits/grading-retry.md).
