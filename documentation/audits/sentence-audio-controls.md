# Audit — Sentence audio controls

Ngày2026-10-31; branch `bugfix/sample-audio-player`, HEAD13d432b + working changes. User screenshot xác định text Nghe câu còn sót trong Library/read; bản sửa đầu chỉ đổi speak/AnswerInput. Lượt follow-up sửa đủ các consumer trong luồng Library và Practice sample, không tuyên bố đã chuyển mọi nút TTS toàn ứng dụng.

## Review đặc tả → code → browser

- [Library](../../apps/web/app/library/page.tsx) read3segments/play labels, listen first sentence, speak sample đều dùng [SampleAudioPlayer](../../apps/web/components/sample-audio-player.tsx). Bỏ import/helper speak ở Library. Selected tab/lesson có aria-pressed/current, stable keys đổi lesson/tab reset playback.
- [Practice](../../apps/web/components/practice.tsx): AnswerDetails chuyển icon player, bỏ callback onSpeak và helper speak mẫu cũ; AnswerInput dùng player chuẩn. Dictionary selection speech giữ workflow cũ.
- Shared `activePlayback`/`PlaybackOwner`/`release` đảm bảo dừng1player/reset UI cũ kể cả engine không emit canceled event; detach callbacks trước cancel; cleanup player không active không dừng utterance của player khác. Loading spinner/live status/aria-busy, timeout10s, unsupported/error, compact210px, reduced-motion, focus44px theo Editorial.
- Không đổi grid/container/breakpoint/palette/backend/API/schema/data. Progress theo text boundary, elapsed không gồm pause; không có seek/total duration thật. Physical Korean voice/screenreader/native zoom vẫn NOT VERIFIED.

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| Browser lifecycle and UX | PASS3tests29.1s | `E2E_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/sample-audio.spec.ts`: read play→switch sentence (no synth cancel event), change lesson, dictation/speak, boundary/clock/pause/resume/end/replay/error, keyboard, loading timeout, unsupported browser; Practice reference playback + hide inactive reference does not stop main sample. [Test](../../tests/e2e/sample-audio.spec.ts). |
| Responsive/text spacing | PASS | Library read/listen1440/390/320,3SVG play buttons/read and no old text-only action;320spacing override no overflow. [Desktop](../features/immersive-learning/assets/read-players-1440.png), [mobile390](../features/immersive-learning/assets/read-players-390.png), [mobile320](../features/immersive-learning/assets/read-players-320.png), [spacing320](../features/immersive-learning/assets/read-players-320-spacing.png), [dictation390](../features/immersive-learning/assets/dictation-player-390.png). Visually inspected desktop/mobile; fixtures only, no QA accounts/provider calls/data writes. |
| Regression | PASS70/70 unit | `npm test`,11files. Targeted ESLint exit0; initial tsc exit0; final build/typecheck/deploy results below. |
| Full device speech and accessibility | NOT VERIFIED | Browser speech events simulated for deterministic lifecycle; no acoustic quality or physical screenreader/native zoom certification. No total duration/seek claim. |

Feature audits: [immersive](../features/immersive-learning/audit.md), [translation](../features/translation-practice/audit.md); [shared contract](../shared/sample-audio-player.md). Final container/deployed checks bổ sung sau build.

## Final deployed gate

- PASS: `docker compose build app` production42routes/TypeScript; `docker compose up -d --no-deps app` và `E2E_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/sample-audio.spec.ts` —3passed16.7s. Screenshots được ghi lại từ bản deploy; Playwright vẫn dùng API/speech fixtures theo phạm vi trên.
- App/worker running, PG/Mongo/Redis/Mailpit healthy. Dev3001 đã dừng. Chỉ recreate app, không sửa worker/provider/model/schema/data. Giữ rollback image `everlang-before-sentence-controls:local`, giữ volumes.
- PASS: docs:sync/docs:check17features/152source-config, plan:check38PBI/82tasks/6Proposed, git diff --check. Bỏ symbol `speak` mẫu đã xóa khỏi code-map và functions; dictionary speakSelection vẫn tồn tại. Không sửa trạng thái planning, không stage/commit/push hoặc thay index của các thay đổi có sẵn.
