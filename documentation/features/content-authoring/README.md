# Kho học liệu và kiểm duyệt

- Feature ID: `content-authoring`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| content-authoring-REQ-01 | Seed 100 bài idempotent và bổ sung metadata language/skill/contentVersion/status cho legacy. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| content-authoring-REQ-02 | Admin biên soạn hoặc AI tạo draft; chỉ draft được review, reviewed mới publish khi có source/rights. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| content-authoring-REQ-03 | Bài published bất biến; thay đổi nội dung phải tạo draft mới. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| content-authoring-REQ-04 | Mutation version cũ trả 409; learner không được dùng admin API. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET/POST/PATCH /api/admin/content — list/create/generate/review/publish/edit; admin only.
- POST /api/sentences/generate — endpoint cũ, admin nhận 410 để dùng workflow mới.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Cần audit nguồn/quyền học liệu trước phát hành rộng. Một trang tạo index có thể gọi provider nhiều lần; chưa có batching UI.
