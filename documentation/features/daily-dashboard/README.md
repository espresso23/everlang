# Dashboard và lịch học

- Feature ID: `daily-dashboard`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| daily-dashboard-REQ-01 | Tạo lịch đúng một lần theo user và ngày tại múi giờ đã chọn. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| daily-dashboard-REQ-02 | Ưu tiên review → draft → weak topic → new, không vượt ngân sách phút. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| daily-dashboard-REQ-03 | Bỏ/đổi/đánh dấu task có version; không sửa ngày đã qua. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| daily-dashboard-REQ-04 | Khi task không còn pending và có ít nhất một done, ghi study_days duy nhất; streak tính ngày liên tiếp. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/dashboard — {profile,plan,dueCount,stats,streak,errors}.
- PATCH /api/dashboard — {day,version,taskId,action:done|skipped|pending|replace}; 409 stale/day rollover.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Chưa có AI lập lịch, notification hoặc cron bắt buộc. Rule-based tạo khi mở dashboard.
