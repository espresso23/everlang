# App shell và nhận diện

- Feature ID: `design-system`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| design-system-REQ-01 | Nhận diện hiện hành: chữ e/ngôi sao nhỏ, xanh cobalt #4546C7, vàng chanh #F9FA91, nền trắng/trung tính. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| design-system-REQ-02 | Không Neo-brutalism, không gradient/kính/bóng trang trí; header/nav/form/control nhất quán. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| design-system-REQ-03 | Shell chọn nội dung theo guest/session; có nav 6 mục và footer. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| design-system-REQ-04 | Responsive: nav cuộn ngang, dashboard về một cột, auth story ẩn dưới 760px. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- Không thêm public API; dùng /api/auth/get-session từ authClient.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Hai thiếu sót session UI/avatar được ghi cho feature user-profile tiếp theo. Một số utility colors trong Practice vẫn có màu trạng thái ngữ nghĩa.
