# Bài luyện TOPIK II PBT

- Feature ID: `exam-practice`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| exam-practice-REQ-01 | Khởi tạo/tiếp tục một lượt active/user/exam; snapshot đề và deadline server. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| exam-practice-REQ-02 | Trước nộp ẩn answer/explanation, autosave có version; chủ khác 404. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| exam-practice-REQ-03 | Nộp chấm câu khách quan xác định; worker chấm Writing riêng, giữ rubric/model. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| exam-practice-REQ-04 | Full schema yêu cầu 50 Nghe/50 Đọc/4 Viết, 100 điểm/skill, 180 phút; mini được ghi nhãn riêng. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/exams[?attempt=...] — list/history hoặc owned attempt.
- POST /api/exams — {examId}; {id}; PATCH — {id,version,answers,submit}.
- PUT /api/exams — admin nhập examSchema có source/rights.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Chưa có kho đề đầy đủ có quyền sử dụng, chưa chia phiên PBT hoàn chỉnh, không quy đổi điểm thành chứng chỉ. Không triển khai TOPIK Speaking/IBT/IELTS/HSK/JLPT.
