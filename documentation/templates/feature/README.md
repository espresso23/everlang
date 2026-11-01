# <feature-id> — <tên feature>

> Đây là template, không phải mô tả một feature đã triển khai. Sao chép toàn bộ thư mục, thay placeholder và dùng liên kết thật trước khi bàn giao.

- Trạng thái: `planned | implemented | verified | blocked`
- Branch/ticket: <branch và ticket nếu có>
- Cập nhật: <YYYY-MM-DD>
- Điểm vào: <liên kết file + symbol/route>
- Phụ thuộc: <feature/thành phần dùng chung/dịch vụ ngoài; liên kết tài liệu chuẩn>

## Mục tiêu và phạm vi

<Người dùng nào, vấn đề nào, hành vi mong đợi; phần ngoài phạm vi và giới hạn đã thống nhất.>

## PRD — đích đến đã thống nhất

README này là PRD chuẩn của feature, không tạo thêm bản PRD cạnh tranh. Điền phần này trước implementation; dùng [biên bản phỏng vấn](../../templates/workflow/interview.md) khi có quyết định còn mở.

- Người dùng/vấn đề và bằng chứng:
- Outcome đo được và cách đánh giá:
- Non-goals / giới hạn / nội dung cần người dùng QA:
- Quyết định đã chốt và nguồn xác nhận:
- Giả định chấp nhận; rủi ro; câu hỏi còn mở và phần bị chặn:
- Acceptance theo Given/When/Then; lỗi/quyền/retry liên quan:
- Tracer bullet và các vertical slice dự kiến; dependency:
- Human QA / điều kiện phát hành:

## Yêu cầu và đối chiếu code

Mỗi ID là duy nhất trong feature và giữ ổn định khi refactor. Liên kết file dùng đường dẫn tương đối; symbol/route ghi chính xác. Hàm hỗ trợ dùng chung tham chiếu tài liệu chuẩn, không nhân bản mô tả.

| ID | Hành vi/tiêu chí nghiệm thu | Code: file + symbol/route | UI/contract liên quan | Kiểm tra/bằng chứng | Trạng thái |
|---|---|---|---|---|---|
| <REQ-01> | <hành vi quan sát được> | <liên kết thật + symbol> | <liên kết mục UI/API> | <test hoặc bước kiểm tra có bằng chứng> | <planned/implemented/verified/blocked> |

## Bộ tài liệu

- [System design](system-design.md)
- [Function description](functions.md)
- [UI và trạng thái tương tác](ui.md)
- [Audit và kết quả xác minh](audit.md)

## Quyết định và thay đổi

| Ngày | Quyết định | Lý do | Hợp đồng/code/UI/feature bị ảnh hưởng |
|---|---|---|---|
| <YYYY-MM-DD> | <quyết định đã thống nhất> | <lý do> | <tham chiếu thật> |

## Việc còn lại

<Yêu cầu còn thiếu, phụ thuộc và điều kiện xác minh; không xóa yêu cầu chưa làm để đánh dấu hoàn tất.>
