# Tài khoản và xác thực

- Feature ID: `identity-auth`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| identity-auth-REQ-01 | Mọi email có thể đăng ký; mật khẩu tối thiểu 10 ký tự, email phải xác minh trước khi dùng API cá nhân. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| identity-auth-REQ-02 | Google dùng authorization-code flow; callback khớp, token exchange thành công mới tạo được account/session. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| identity-auth-REQ-03 | Liên kết Google chỉ khi người dùng chủ động đăng nhập tài khoản hiện có; không tự gộp cùng email. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| identity-auth-REQ-04 | Reset mật khẩu qua email; đổi mật khẩu có thể thu hồi các phiên khác. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET/POST /api/auth/* — handler Better Auth cho sign-up/email, sign-in/email, sign-in/social, callback/google, get-session, verify-email, reset/change password, sign-out.
- GET /api/config — {google:boolean}, no-store; không trả credential.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

OAuth từng lỗi redirect_uri_mismatch đã khắc phục; log 2026-10-30 ghi invalid_client vì secret không hợp lệ. Probe sau khi người dùng cập nhật trả invalid_grant với refresh token giả; sau đó chủ tài khoản đã đăng nhập thật, DB xác nhận một Google account có image và session hoạt động. Email đã có tài khoản phải dùng explicit linking. SMTP production chưa được cấu hình.

## Cập nhật profile/auth 2026-10-30

Google login thực tế đã được chủ tài khoản xác nhận sau cập nhật secret; DB xác nhận provider/image/session (không ghi danh tính/token). Sign-in social và linkSocial dùng errorCallbackURL=/sign-in; lỗi account_not_linked hướng dẫn explicit linking, lỗi khác hiển thị thông báo chung, không phản chiếu raw query. [Auth route](../../../app/api/auth/[...all]/route.ts) handleAuth bọc withApiLogging và log callback outcome/mã whitelist, không query/Location/code/state. Redirected chỉ có nghĩa HTTP redirect, không tự chứng nhận session. [UI tests](../../../tests/e2e/profile-ui.spec.ts) và [audit nhóm](../../audits/profile-auth-integration.md).
