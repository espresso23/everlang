# Luyện dịch tiếng Hàn

- Feature ID: `translation-practice`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| translation-practice-REQ-01 | Danh sách/thẻ, lọc chủ đề/cấp độ, tìm kiếm, phân trang; chỉ bài published. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| translation-practice-REQ-02 | Deep link sentence/topic mở bài liên quan; mistakes=true lọc câu từng có grammarErrors của chủ tài khoản. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| translation-practice-REQ-03 | Viết bản dịch, xem gợi ý/đáp án, nghe mẫu, xem lịch sử hoặc gửi chấm nền. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| translation-practice-REQ-04 | Giữ nháp cục bộ theo tài khoản, lưu cloud theo version và báo conflict. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/sentences — topic,level,page,limit,search,sentenceId,mistakes; {items,page,limit,total,pages}.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Limit hiện tối đa 50, API lịch sử tối đa 200; chưa có server pagination toàn bộ lịch sử. Nút lưu kiến thức mở trang kho từ với dữ liệu điền sẵn, người dùng vẫn phải lưu thẻ.

## Cập nhật 2026-10-31 — audio mẫu

Nút nghe mẫu dùng play/pause icon, thanh tiến trình và thời gian đã phát; `AnswerInput → SampleAudioPlayer`. Hợp đồng tại [sample audio player](../../shared/sample-audio-player.md); bằng chứng/giới hạn tại [audit](audit.md).

## 2026-10-31 — Hoàn thiện Nghe câu

Hoàn thiện icon play/pause+progress tại Library read/listen/speak và Practice AnswerDetails; chỉ1player phát một lúc, đổi câu/bài/tab dừng đúng session. [Player contract](../../shared/sample-audio-player.md), [audit](../../audits/sentence-audio-controls.md).

## 2026-10-31 — Retry failed grading

Failed duplicate không phải lỗi gateway mới: POST grade trả409/code GRADING_PREVIOUS_FAILED, giữ draft/attempt cũ và không tự enqueue. Người học có nút Chấm lại bằng AI ngay trong error alert; click explicit tạo lượt mới bằng forceRegrade/requestId mới. [Audit](../../audits/grading-retry.md).
