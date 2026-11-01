# Error boundaries và worker recovery

Ngày2026-10-31. Canonical owner: platform-operations; ai-grading/self-hosted-speech sử dụng.

## Hợp đồng chung

- [api](../../lib/api.ts) xử lý auth/Origin/schema/HttpError; [withApiLogging](../../lib/logger.ts) là exception boundary API có sẵn: requestId, JSON500 an toàn, x-request-id. Không gắn process handlers vào Next để thay lifecycle của framework.
- [log / logError / safeFields](../../lib/logger.ts): dùng chung API/worker, recursive redaction cho key nhạy cảm, credential URI, bearer; giới hạn độ sâu/chuỗi/số phần tử, chống cycle, không serialize pg client. Error chỉ lấy name/message/stack, không lấy attached connection.
- [Pool](../../lib/sql/index.ts): listener `error` cho idle socket errors, structured event `database.pool.error`, không log client argument. pg loại connection lỗi; query tiếp theo có thể lấy connection mới. Query đang chạy vẫn reject về caller; không tự lặp mutation SQL.
- [installProcessErrorHandlers](../../lib/process-errors.ts) chỉ cho standalone workers: uncaughtException/unhandledRejection → logError → exit1. Supervisor Docker restart; không nuốt lỗi nghiêm trọng để chạy tiếp. `guardedTask` bắt cả sync throw và Promise rejection ở listener/timer/startup. Grading failed callback dùng guardedTask; speech failed callback giữ try/catch đã có.
- [grading worker](../../scripts/worker.ts) và [speech worker](../../scripts/speech-worker.ts): error/recovery/shutdown có boundary; SIGINT/TERM idempotent, deadline15s và exit1 khi cleanup lỗi. Speech provider/model startup gate vẫn giữ. Speech end-to-end provider thật không được suy ra từ kiểm infrastructure này.

## AI và queue

[ProviderError / retryAfterMs / generateJson](../../lib/ai.ts) giữ HTTP status ngay cả body HTML/null; không log raw provider error body.429 dùng warning `ai.request.rate_limited`, Retry-After hỗ trợ seconds/date,1s–24h; không có/không hợp lệ thì worker cooldown60s. JSON/schema output hợp lệ mới được lưu điểm.

[Worker](../../scripts/worker.ts) concurrency1, limiter1job/s toàn queue, `queue.rateLimit` khi429 áp dụng qua Redis cho các worker cùng queue. Job giữ attempts3/exponential5s có sẵn; không dùng RateLimitError để retry vô hạn.400/401/402/403/404 dừng sớm bằng UnrecoverableError. Các job mới trong queue cũng chờ cooldown. Không đổi model, billing, provider hoặc tự fallback.

Failed-event SQL write dùng guardedTask; nếu DB lỗi, recovery30s đối chiếu Redis terminal failed job và đánh dấu SQL failed thay vì enqueue lại gọi AI. Kết quả completed không bị ghi đè; draft giữ nguyên, message provider-safe qua aiErrorResponse. Recovery không chạy chồng; startup DB lỗi được log và thử lại ở tick sau. Không tuyên bố tự phục hồi job đã bị dọn khỏi Redis hoặc mọi tình huống Redis mất dữ liệu.

## Bằng chứng và nguồn

[Unit errors](../../tests/unit/runtime-errors.test.ts), [worker fault injection](../../tests/unit/grading-worker.test.ts), [probe PG/Redis/process](../../tests/integration/worker-runtime.ts), [audit tích hợp](../audits/system-library-worker-errors.md).

Nguồn đối chiếu: [node-postgres pool errors](https://node-postgres.com/features/pooling), [Node fatal exception semantics](https://nodejs.org/api/process.html#event-uncaughtexception), [BullMQ rate limiting](https://docs.bullmq.io/guide/rate-limiting), [OpenRouter limits](https://openrouter.ai/docs/api/reference/limits). API `queue.rateLimit` đối chiếu thêm typings BullMQ cài trong repo; không dùng `worker.rateLimit` đã deprecated.

## Cached grading failure

Một own submission đãfailed không phải upstream error của request mới: POSTgrade trả409/code GRADING_PREVIOUS_FAILED, frontend đưa retry button cạnh error. Force retry chỉ sau click explicit, giữ lịch sử cũ/cooldown/rate-limit. [Audit](../audits/grading-retry.md).
