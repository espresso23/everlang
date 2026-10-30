# UI — design-system

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

Áp dụng mọi route; header hiện tên + icon UserRound khi có session, chưa dùng avatar image; pending đang hiển thị nhánh guest tạm thời và có thể mount page trước khi session được xác định.

## Luồng UI ↔ dữ liệu

RootLayout → Shell/useSession → navigation + page → shared CSS tokens

## Trạng thái và giới hạn

Hai thiếu sót session UI/avatar được ghi cho feature user-profile tiếp theo. Một số utility colors trong Practice vẫn có màu trạng thái ngữ nghĩa.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
