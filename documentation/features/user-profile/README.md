# Hồ sơ và mục tiêu học

- Feature ID: `user-profile`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| user-profile-REQ-01 | GET hồ sơ của chủ session, tạo profiles mặc định nếu chưa có. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| user-profile-REQ-02 | Lưu tên, trình độ Trung/Cao cấp, mục tiêu tối đa 300 ký tự, 5–120 phút/ngày và múi giờ IANA hợp lệ. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| user-profile-REQ-03 | Đổi mục tiêu không ghi đè lịch đã tạo trong ngày; lịch mới đọc cấu hình mới. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| user-profile-REQ-04 | Hỗ trợ đổi mật khẩu, liên kết Google, nhập nháp legacy có xác nhận. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/profile — {profile,user,googleEnabled}.
- PUT /api/profile — {name,level,goal,minutes,timezone}; {saved:true}; 400 validation, 401/403 auth.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Feature này là baseline trước mở rộng profile. Avatar không được render trong Shell; cập nhật tên chưa chủ động refresh cache session. Các lỗi này chưa được sửa trong commit tài liệu.
