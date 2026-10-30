# Nháp, lịch sử, yêu thích và thống kê

- Feature ID: `learning-records`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| learning-records-REQ-01 | Mọi truy vấn dữ liệu học đều lọc theo user_id từ session, không tin x-user-id. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| learning-records-REQ-02 | Nháp dùng optimistic version; version cũ trả 409 thay vì ghi đè. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| learning-records-REQ-03 | History giữ từng lượt; thống kê dùng lần hoàn tất mới nhất cho từng câu. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| learning-records-REQ-04 | Import legacy là CLI có xác nhận chủ sở hữu, chạy lặp không nhân dữ liệu, giữ Mongo gốc. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET/PUT /api/drafts — {sentenceId,text,version}; PUT trả version mới hoặc 409.
- GET /api/submissions — sentenceId tùy chọn; {submission} hoặc {submissions}.
- GET/POST /api/user/favorites — {favorites}; mutation {sentenceId,favorite}.
- GET /api/user/stats — totalCompleted,averageScore,weakTopics.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Import lịch sử thật chưa thực hiện vì phải đối chiếu UUID và tài khoản đã xác minh. Fixture từng kiểm tra import lần đầu 1, lần lặp 0.
