# UI — identity-auth

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/sign-in: login/signup/forgot/reset; Google enabled phụ thuộc cấu hình. Callback account_not_linked hướng dẫn liên kết rõ ràng; lỗi token email có thông báo riêng, mã lạ không phản chiếu vào UI. Shell có avatar và tách pending/error session khỏi guest.

## Luồng UI ↔ dữ liệu

Form/Google → Better Auth → PostgreSQL account/session → cookie → useSession → Shell/API

## Trạng thái và giới hạn

OAuth từng lỗi redirect_uri_mismatch đã khắc phục; log 2026-10-30 ghi invalid_client vì secret không hợp lệ. Probe sau khi người dùng cập nhật trả invalid_grant với refresh token giả; sau đó chủ tài khoản đã đăng nhập thật, DB xác nhận một Google account có image và session hoạt động. Email đã có tài khoản phải dùng explicit linking. SMTP production chưa được cấu hình.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

## Cập nhật profile/auth 2026-10-30

Google login thực tế đã được chủ tài khoản xác nhận sau cập nhật secret; DB xác nhận provider/image/session (không ghi danh tính/token). Sign-in social và linkSocial dùng errorCallbackURL=/sign-in; lỗi account_not_linked hướng dẫn explicit linking, lỗi khác hiển thị thông báo chung, không phản chiếu raw query. [Auth route](../../../app/api/auth/[...all]/route.ts) handleAuth bọc withApiLogging và log callback outcome/mã whitelist, không query/Location/code/state. Redirected chỉ có nghĩa HTTP redirect, không tự chứng nhận session. [UI tests](../../../tests/e2e/profile-ui.spec.ts) và [audit nhóm](../../audits/profile-auth-integration.md).
