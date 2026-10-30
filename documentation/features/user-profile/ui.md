# UI — user-profile

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/profile: mục tiêu học tập, bảo mật, nhập nháp cũ, admin link. Baseline chưa có avatar, thông tin provider hay trạng thái loading rõ ràng; form mật khẩu vẫn hiện cho Google-only account.

## Luồng UI ↔ dữ liệu

Profile UI → api session/ownership → Better Auth updateUser + SQL profiles → thông báo UI

## Trạng thái và giới hạn

Feature này là baseline trước mở rộng profile. Avatar không được render trong Shell; cập nhật tên chưa chủ động refresh cache session. Các lỗi này chưa được sửa trong commit tài liệu.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
