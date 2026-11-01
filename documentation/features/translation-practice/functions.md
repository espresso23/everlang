# Function map — translation-practice

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/app/practice/page.tsx](../../../apps/web/app/practice/page.tsx) | `Page` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/components/practice.tsx](../../../apps/web/components/practice.tsx) | `Stats`, `DictionaryEntry`, `DictionaryLookup`, `SavedReview`, `SavedFavorite`, `EMPTY_STATS`, `apiErrorMessage`, `SaveKnowledge`, `KoreanLinkedText`, `Practice`, `SourceText`, `AnswerInput`, `AnswerDetails`, `VocabHints`, `HintPanel`, `ExerciseCard`, `EmptyLibrary`, `GradeModal`, `FeedbackSection`, `DictionarySelectionLookup`, `POS_LABELS`, `DictionaryResultCard`, `useLookup` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/api/src/domains/sentences.service.ts](../../../apps/api/src/domains/sentences.service.ts) | `handleGet`, `SentencesService`, `SentencesService.get` | Service nghiệp vụ: validation, ownership, transaction/provider và response; payload/mã lỗi xem đặc tả feature và schema tại symbol. |
| [apps/web/components/sample-audio-player.tsx](../../../apps/web/components/sample-audio-player.tsx) | `PlaybackOwner`, `activePlayback`, `release`, `SampleAudioPlayer`, `Playback` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/e2e/sample-audio.spec.ts](../../../tests/e2e/sample-audio.spec.ts) | Cấu hình / dữ liệu / schema | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |
| [apps/api/src/domains/sentences.controller.ts](../../../apps/api/src/domains/sentences.controller.ts) | `SentencesController`, `SentencesController.get` | Native Nest controller: HTTP route/decorator, chuyển request tới service; JwtGuard/GlobalExceptionFilter áp dụng toàn cục. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.

## ORM — 2026-11-01

- [apps/api/src/domains/sentences.service.ts](../../../apps/api/src/domains/sentences.service.ts): CRUD qua mapped entities/QueryBuilder; giữ payload, ownership, version, transaction và trạng thái public.

Hợp đồng kết nối/lifecycle/migration/rate-limit dùng [ORM chuẩn](../postgresql-orm-migration/functions.md); bằng chứng tích hợp tại [ORM audit](../postgresql-orm-migration/audit.md). Không tạo SQL compatibility facade.
