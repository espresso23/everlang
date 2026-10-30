# Function description — <feature-id>

Liên quan: [đặc tả](README.md), [system design](system-design.md).

## Bản đồ điểm vào và hàm có hành vi

Bao phủ route handler, service, worker, hook và component có logic mà feature thêm/sửa. Helper đơn giản có thể gom theo module; helper dùng chung trỏ tới tài liệu shared. Không tạo lời hứa về symbol chưa tồn tại khi đánh dấu implemented/verified.

| Function ID | File + symbol/route | Yêu cầu | Bên gọi | Thành phần được gọi | Bằng chứng kiểm tra |
|---|---|---|---|---|---|
| <FN-01> | <liên kết thật + tên export> | <REQ-01> | <UI/API/job> | <service/DB/provider> | <test hoặc manual evidence> |

## <FN-01> — <tên hàm/route>

- Mục đích: <hành vi cụ thể và yêu cầu được hiện thực>.
- Chữ ký/input: <tham số, kiểu/schema, giới hạn và validation>.
- Output: <return type/payload/status hoặc UI output>.
- Điều kiện/quyền: <session, role, ownership, trạng thái dữ liệu>.
- Side effects: <đọc/ghi dữ liệu, gọi provider, publish event, cập nhật cache/UI>.
- Lỗi và xử lý: <điều kiện, error/status, phía gọi phản hồi ra sao>.
- Tính nhất quán: <transaction, idempotency/concurrency nếu có; N/A nếu không>.
- Liên kết: <contract, UI state, symbol phụ thuộc và kiểm tra liên quan>.
