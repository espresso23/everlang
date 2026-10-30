# UI — <feature-id>

Liên quan: [đặc tả](README.md), [system design](system-design.md), [audit](audit.md).

Nếu feature chỉ có backend, ghi `N/A` và lý do; mô tả UI tiêu thụ hợp đồng này nếu có.

## Màn hình và component

| UI ID | Route/vị trí | Component: file + symbol | Yêu cầu/contract | Hành vi và trạng thái |
|---|---|---|---|---|
| <UI-01> | <route thật> | <liên kết + component> | <REQ-01/API-01> | <hành vi quan sát được> |

## Luồng tương tác

<Thao tác → validation → request → cập nhật dữ liệu → phản hồi UI; chỉ rõ điều hướng, quyền truy cập, trạng thái trước/sau và thao tác tiếp theo.>

## Trạng thái và lỗi

<Default, loading, empty, success, validation error, unauthorized/forbidden, provider error, retry và conflict nếu áp dụng. Nút nào disabled, nội dung giữ lại, focus và thông báo thay đổi như thế nào.>

## Thiết kế và accessibility

<Design tokens/component chuẩn được dùng, responsive, bàn phím/focus, label/ARIA, tương phản. Tham chiếu thiết kế dùng chung; mô tả khác biệt của feature này.>

## Bằng chứng giao diện

<Ảnh desktop/mobile hoặc bản thiết kế liên kết dưới assets/. Mỗi ảnh ghi trạng thái, viewport, ngày và đó là mockup hay ảnh chạy thật. Dùng dữ liệu giả; không đưa credential, token hoặc dữ liệu người dùng thật vào ảnh.>
