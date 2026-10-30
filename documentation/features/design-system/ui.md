# UI — design-system

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

Áp dụng mọi route; header hiển thị UserAvatar từ session.image hoặc initials. Pending hiển thị trạng thái tải; lỗi kết nối có retry; private page chỉ mount khi session hợp lệ. Xem [profile UI](../user-profile/ui.md).

## Luồng UI ↔ dữ liệu

RootLayout → Shell/useSession → navigation + page → shared CSS tokens

## Trạng thái và giới hạn

Session pending/avatar đã sửa trong feature/user-profile; xem [audit tích hợp](../../audits/profile-auth-integration.md). Một số utility colors trong Practice vẫn có màu trạng thái ngữ nghĩa.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
