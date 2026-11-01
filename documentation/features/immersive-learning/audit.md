## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: read/listen/shadow UI, sample play/pause/time bar, mobile và text spacing.
- Giọng TTS thiết bị thật/content review vẫn gate riêng.
- Evidence/checks: sample-audio.spec.ts, editorial-design.spec.ts; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — immersive-learning

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Google STT/S3 và microphone/TTS thiết bị thật chưa kiểm chứng toàn bộ. Không có điểm phát âm; chưa có audio người bản ngữ hoặc bản đồ từ đồng bộ transcript. |

## Audit kết nối

Luồng phải kiểm: **Library tab → local TTS/MediaRecorder hoặc POST recordings → Google STT → AI góp ý → S3 + SQL → UI**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Google STT/S3 và microphone/TTS thiết bị thật chưa kiểm chứng toàn bộ. Không có điểm phát âm; chưa có audio người bản ngữ hoặc bản đồ từ đồng bộ transcript.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

## 2026-10-31 — Sample audio player

- Branch `bugfix/sample-audio-player`; scope: sample playback controls only. [Shared contract](../../shared/sample-audio-player.md), [integration audit](../../audits/sample-audio-player.md).
- PASS: Play/pause/resume, active elapsed clock frozen during pause, text-boundary progress, end100%, replay reset, failure alert, keyboard Enter, cleanup when leaving tab, Library320/390/1440 no horizontal overflow; practice renders player and starts playback. Command: `E2E_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/sample-audio.spec.ts` —1passed10.3s. Uses deterministic SpeechSynthesis events; no database writes.
- Evidence: [browser test](../../../tests/e2e/sample-audio.spec.ts), [320px](../immersive-learning/assets/sample-player-320.png), [390px](../immersive-learning/assets/sample-player-390.png), [1440px](../immersive-learning/assets/sample-player-1440.png). Separate review found grid min-content overflow at320px; `Library` content now min-width0, retest passed.
- PASS: lint (0errors, pre-existing warning in .local/catalog-final-counts.ts), TypeScript and production build42routes. Final container/build/runtime results recorded in integration audit.
- NOT VERIFIED: acoustic output/installed Korean voice, physical screenreader/zoom; browsers lacking boundary events only advance progress on end. No total duration/seek supported by browser TTS. Other legacy provider gates retain their prior status.

## 2026-10-31 — Rà soát Nghe câu còn sót

Theo ảnh user: Library read/listen và Practice reference đã thống nhất play/pause player; single active owner, reset/cancel/cleanup và accessibility bổ sung. PASS3Playwright29.1s,70unit, targeted lint, responsive1440/390/320+spacing. [Audit/bằng chứng/giới hạn và final deploy](../../audits/sentence-audio-controls.md). Physical speech/native zoom/screenreader NOT VERIFIED; không đóng provider gates legacy.
