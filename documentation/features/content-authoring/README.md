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

## Admin workspace — quyết định 2026-11-01 (đặc tả trước code, hiện implemented local)

Owner chọn admin đăng nhập mặc định vào Quản trị, có chuyển Học tập. PB-042-T01 là increment riêng, không thay yêu cầu duyệt học liệu của #1.

- AW-01: email/Google login thành công điều hướng admin tới /admin/overview, learner tới /. Google linking tại profile giữ callback hiện tại.
- AW-02: /admin/* có nhãn Quản trị và menu Tổng quan, Bài luyện, Kiến thức, Bộ từ; active route rõ, chuyển Học tập/Quản trị, responsive và keyboard. Giữ Editorial tokens.
- AW-03: chưa xác định session chỉ loading/error; learner mở admin không render editor hoặc gọi API admin. API vẫn kiểm quyền server.
- AW-04: tổng quan chỉ dẫn tới các module có thật, không hiển thị thống kê giả; refresh/deep link/back và chuyển chế độ không lặp redirect.

Non-goals: user management, analytics, thay workflow review/publish, schema/DB/provider. AC: E2E admin login→overview→3editor→study→admin, learner denial, loading/error, Google callback landing contract, desktop1440/mobile390/320; ảnh và audit. Live Google cần owner test, không dùng mock để chứng nhận OAuth upstream.
