# Function map — self-hosted-speech

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [packages/backend/src/speech/contract.ts](../../../packages/backend/src/speech/contract.ts) | `MAX_SPEECH_BYTES`, `MAX_SPEECH_SECONDS`, `SPEECH_ENGINE`, `SPEECH_MODEL`, `SPEECH_MODEL_SHA256`, `speechBody`, `decodeSpeech`, `speechFingerprint`, `speechFileKey`, `validSpeechFileKey`, `SpeechRow`, `speechView` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/speech/storage.ts](../../../packages/backend/src/speech/storage.ts) | `speechMediaPath`, `writeSpeechAudio`, `readSpeechAudio`, `hasSpeechAudio`, `removeSpeechAudio` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/speech/queue.ts](../../../packages/backend/src/speech/queue.ts) | `shared`, `SPEECH_QUEUE`, `SPEECH_HEARTBEAT`, `getSpeechQueue`, `enqueueSpeech` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/speech/runtime.ts](../../../packages/backend/src/speech/runtime.ts) | `chooseSpeechBackend`, `selected`, `speechRuntime` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/speech/transcribe.ts](../../../packages/backend/src/speech/transcribe.ts) | `execute`, `segments`, `SpeechInputError`, `inspectSpeechPcm`, `pcmIsQuiet`, `transcribeLocal` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/worker/src/speech.processor.ts](../../../apps/worker/src/speech.processor.ts) | `provider`, `verifyRuntime`, `recovering`, `recoverSpeech`, `SpeechProcessor`, `SpeechProcessor.onModuleInit`, `SpeechProcessor.onModuleDestroy`, `SpeechProcessor.process`, `SpeechProcessor.execute`, `SpeechProcessor.onFailed`, `SpeechProcessor.persistFailure`, `SpeechProcessor.onError` | Nest WorkerHost: xử lý BullMQ job, recovery/retry, cập nhật trạng thái durable và log requestId/jobId/attempt. |
| [scripts/download-speech-model.mjs](../../../scripts/download-speech-model.mjs) | `root`, `target`, `expected`, `checksum` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/speech.service.ts](../../../apps/api/src/domains/speech.service.ts) | `SpeechService`, `SpeechService.get`, `SpeechService.post`, `SpeechService.delete` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/api/src/domains/speech-audio.service.ts](../../../apps/api/src/domains/speech-audio.service.ts) | `SpeechAudioService`, `SpeechAudioService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/app/speech/page.tsx](../../../apps/web/app/speech/page.tsx) | `Item`, `Capabilities`, `labels`, `SpeechSession`, `SpeechPage` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/speech/speech.css](../../../apps/web/app/speech/speech.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [migrations/005_local_speech.sql](../../../migrations/005_local_speech.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [tests/unit/speech.test.ts](../../../tests/unit/speech.test.ts) | `wav` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [tests/e2e/speech.spec.ts](../../../tests/e2e/speech.spec.ts) | `silentWav` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [packages/backend/src/speech/provider.ts](../../../packages/backend/src/speech/provider.ts) | `SpeechProvider`, `SPEECH_CONSENT_VERSION`, `GEMINI_SPEECH_MODEL`, `selectedSpeechProvider`, `speechServiceReady`, `heartbeatMatches` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [packages/backend/src/speech/gemini.ts](../../../packages/backend/src/speech/gemini.ts) | `SpeechServiceError`, `geminiTranscript`, `budgetScript`, `Budget`, `transcribeGeminiWav` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [migrations/006_speech_provider.sql](../../../migrations/006_speech_provider.sql) | Cấu hình / dữ liệu / schema | Schema/version migration; chạy bằng scripts/migrate.ts trong thứ tự số. |
| [tests/unit/speech-gemini.test.ts](../../../tests/unit/speech-gemini.test.ts) | `budget`, `response` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [apps/api/src/domains/speech-audio.controller.ts](../../../apps/api/src/domains/speech-audio.controller.ts) | `SpeechAudioController`, `SpeechAudioController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/api/src/domains/speech.controller.ts](../../../apps/api/src/domains/speech.controller.ts) | `SpeechController`, `SpeechController.get`, `SpeechController.post`, `SpeechController.delete` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |
| [apps/web/components/private-audio.tsx](../../../apps/web/components/private-audio.tsx) | `PrivateAudio` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/worker/src/speech.processor.ts](../../../apps/worker/src/speech.processor.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/speech.service.ts](../../../apps/api/src/domains/speech.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.
- [apps/api/src/domains/speech-audio.service.ts](../../../apps/api/src/domains/speech-audio.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.
