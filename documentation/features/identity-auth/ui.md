# UI — identity-auth

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/sign-in: login/signup/forgot/reset; Google enabled phụ thuộc cấu hình. Lỗi hiện tại được hiển thị bằng thông báo tổng quát. Shell chưa có avatar và chưa tách pending/error session khỏi guest.

## Luồng UI ↔ dữ liệu

Form/Google → Better Auth → PostgreSQL account/session → cookie → useSession → Shell/API

## Trạng thái và giới hạn

OAuth từng lỗi redirect_uri_mismatch đã khắc phục; log 2026-10-30 ghi invalid_client vì secret không hợp lệ. Probe sau khi người dùng cập nhật trả invalid_grant với refresh token giả; chưa phải kiểm thử login/session thật. Email đã có tài khoản phải dùng explicit linking. SMTP production chưa được cấu hình.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
