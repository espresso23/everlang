# Hạ tầng, hợp đồng dùng chung và vận hành

- Feature ID: `platform-operations`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| platform-operations-REQ-01 | Node24/Next standalone và worker riêng; PostgreSQL/Mongo/Redis nội bộ, app bind loopback, Caddy profile production. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| platform-operations-REQ-02 | Migration có advisory lock và transaction; backup riêng tư; không commit credential. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| platform-operations-REQ-03 | API chung xác minh session/email/role, Origin và JSON cho mutation; query SQL parameterized. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| platform-operations-REQ-04 | Logger có requestId, redaction; docs checker đối chiếu file/symbol/hash/link, không thay semantic audit. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- Internal project planning: [work-items.json](../../planning/work-items.json) là nguồn duy nhất; [planning.mjs](../../../scripts/planning.mjs) sinh/check WBS/backlog/sprints/task CSV/dashboard. Không phải feature học hoặc route mới, không ghi DB. Xem [hướng dẫn](../../planning/README.md).

- JwtGuard.canActivate + GlobalExceptionFilter.respondError + ResponseInterceptor — native authentication, role và response/error boundary.
- query(sql,values), connectDb(), rateLimit(), getGradingQueue(), log/requestLogging là module shared.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Local Mailpit không chuyển email tới Gmail. Production cần SMTP/domain/HTTPS thật. Tên ảnh worker vẫn chứa dependencies development; chưa tối ưu kích thước image. docs:check chỉ là kiểm tra cấu trúc.

## 2026-10-31 — Worker/exception contract

Dùng exception/logging contract chuẩn và xử lý retry/cooldown/recovery có giới hạn; không giả điểm hoặc bỏ lỗi để tiếp tục process hỏng. [Chuẩn dùng chung](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).
