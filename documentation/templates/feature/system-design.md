# System design — <feature-id>

Liên quan: [đặc tả](README.md), [functions](functions.md), [UI](ui.md), [audit](audit.md).

## Thành phần và ranh giới

<Liệt kê thành phần thực sự cần dùng: UI, auth, API/service, worker/queue, database/storage, dịch vụ ngoài. Chỉ rõ trách nhiệm và nguồn dữ liệu chuẩn.>

## Luồng end-to-end

<Sơ đồ kiến trúc và sequence bằng Mermaid hoặc sơ đồ lưu trong assets/; đi từ thao tác người dùng đến phản hồi cuối. Phân biệt thiết kế dự kiến với luồng đã chạy.>

## Hợp đồng và dữ liệu

| Contract ID | Bên gọi → bên nhận | Route/hàm/event và code | Input/output, validation | Quyền truy cập và lỗi | Version/compatibility |
|---|---|---|---|---|---|
| <API-01> | <thành phần> | <liên kết thật + symbol> | <kiểu/schema> | <quyền/mã lỗi> | <version hoặc N/A có lý do> |

<Schema/entity, ownership, khóa/index/unique constraint khi có; snapshot, transaction và consistency giữa các kho dữ liệu. Tham chiếu migration thật và feature phụ thuộc.>

## Tích hợp và failure modes

<Luồng lỗi có liên quan: retry, timeout, idempotency, cache invalidation, concurrency, trạng thái dở dang và phục hồi. Ghi N/A có lý do cho phần không áp dụng; không thêm hạ tầng không cần thiết.>

## Vận hành và rollout

<Tên biến môi trường, observability không chứa bí mật, deploy/feature flag nếu có, migration/backup/rollback nếu thay dữ liệu. Liên kết tới quy trình dùng chung thay vì sao chép.>
