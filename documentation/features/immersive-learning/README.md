# Đọc, nghe và luyện nói

- Feature ID: `immersive-learning`
- Trạng thái hiện thực: `blocked`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| immersive-learning-REQ-01 | Đọc hai bài tự biên soạn, xem nghĩa và mở tra từ/lưu câu vào SRS. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| immersive-learning-REQ-02 | Nghe TTS, chép câu đầu và so sánh bỏ dấu câu/khoảng trắng; bật/tắt transcript. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| immersive-learning-REQ-03 | Ghi WebM Opus tối đa 55 giây và nghe lại local; người học chủ động đồng ý trước khi gửi dịch vụ. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| immersive-learning-REQ-04 | Bản ghi server yêu cầu S3 private + Google Speech; URL nghe lại có hạn 300 giây và ownership. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/recordings[?id=...] — configured/history hoặc signed URL của chủ tài khoản.
- POST /api/recordings — {audio,consent:true}; thiếu config 503, audio không hợp lệ 400/413, không nhận dạng 422.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Google STT/S3 và microphone/TTS thiết bị thật chưa kiểm chứng toàn bộ. Không có điểm phát âm; chưa có audio người bản ngữ hoặc bản đồ từ đồng bộ transcript.

## Cập nhật 2026-10-31 — audio mẫu

Nút nghe mẫu dùng play/pause icon, thanh tiến trình và thời gian đã phát; `Library (tab speak) → SampleAudioPlayer`. Hợp đồng tại [sample audio player](../../shared/sample-audio-player.md); bằng chứng/giới hạn tại [audit](audit.md).

## 2026-10-31 — Hoàn thiện Nghe câu

Hoàn thiện icon play/pause+progress tại Library read/listen/speak và Practice AnswerDetails; chỉ1player phát một lúc, đổi câu/bài/tab dừng đúng session. [Player contract](../../shared/sample-audio-player.md), [audit](../../audits/sentence-audio-controls.md).
