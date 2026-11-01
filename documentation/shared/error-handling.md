# Global exception và tracing — 2026-11-01

[Nest boundary](../../apps/api/src/http-boundary.ts): requestLogging chạy trước JSON parser, chuẩn hóa x-request-id hoặc sinh UUID, AsyncLocalStorage và response header. GlobalExceptionFilter/respondError bắt HttpError/Zod/HttpException/unknown, gồm lỗi parser/413; response JSON {statusCode,code,error,requestId}. Unknown500 không lộ message/stack. ResponseInterceptor chuẩn hóa HttpResult/BinaryResult native; giữ submissionId/retryable cho grading409.

[Logger](../../packages/backend/src/logger.ts): JSON một dòng timestamp UTC, level, service, environment, event, requestId; HTTP method/route không query/statusCode/durationMs. Stack server-only cho500/fatal. Redaction recursive/circular/depth-bound; không log body, password, cookie, Bearer, token, audio, prompt hay connection URI. API ready/startup/shutdown có event riêng. Không console-dump PG client.

[CorrelatedQueue](../../packages/backend/src/queue.ts) đưa trace.requestId vào job data; [grading](../../apps/worker/src/grading.processor.ts) và [speech](../../apps/worker/src/speech.processor.ts) khôi phục ALS, thêm jobId/attempt/duration và job.started/finished/failed. Job mới được reconcile từ durable DB sau Redis mất có requestId mới nếu trace cũ không còn; không tuyên bố giữ cùng trace qua mất Redis.

[Process handlers](../../packages/backend/src/process-errors.ts): unhandledRejection/uncaughtException log an toàn rồi exit1; guardedTask cho interval/recovery, PG idle error listener; Compose restart. Graceful SIGTERM API15s, worker150s; app.close để drain, đóng pool/redis/Mongo. Grading429 cooldown queue/retry hữu hạn, không đổi model/billing; lỗi permanent không giả điểm.

Bằng chứng: [unit boundary](../../tests/unit/nest-boundary.test.ts), [runtime errors](../../tests/unit/runtime-errors.test.ts), [JWT unit](../../tests/unit/nest-jwt.test.ts), [HTTP auth](../../tests/e2e/nest-auth.spec.ts), [worker tests](../../tests/unit/grading-worker.test.ts). Kết quả trong [audit migration](../features/backend-nestjs-migration/audit.md).

## ORM và Redis — 2026-11-01

GlobalExceptionFilter vẫn chuẩn hóa error/requestId. QueryFailedError chỉ log tên/code an toàn, không log query/parameters/driver echo; CorrelatedQueue có error listener và enqueue503/QUEUE_UNAVAILABLE. Xem [hợp đồng availability](architecture.md#orm-và-redis--2026-11-01), [logger](../../packages/backend/src/logger.ts) và [unit](../../tests/unit/runtime-errors.test.ts).
