# UI — Learning Passport

2026-10-30, feature/profile-editorial-layout. User yêu cầu thay layout riêng /profile; [design guide](../../design/README.md) giữ theme editorial.

View: desktop 304px identity sidebar + main linh hoạt, gap48px. Passport Cobalt gồm avatar, tên/email, ngôn ngữ/trình độ và xác minh từ dữ liệu thật. Mục tiêu được nhấn bằng vạch Cobalt, phút/ngày lớn; facts trình độ/timezone. Một CTA Chỉnh sửa hồ sơ. Không có mã học viên hay thành tích giả.

Editor inline thay phần mục tiêu: tên/trình độ, goal full-width, phút/timezone; sidebar giữ dữ liệu đã lưu. Click Edit focus Tên; Hủy unmount draft, không PUT, trả focus CTA. Lưu chụp FormData trước khi khóa fieldset/Save/Cancel; thành công PUT→GET→refetch session→view mới/header mới. Failure giữ draft và alert tại editor để retry. Nếu PUT thành công nhưng GET thất bại, giữ editor để chưa xác nhận sai trạng thái mới.

Bảo mật & đăng nhập và Dữ liệu trên thiết bị dùng native details/summary đóng mặc định. Google linking/password/reset giữ các API đã có; feedback AccountSecurity local trong disclosure. Legacy import giữ confirm và version0. Admin có link quản trị.

Mobile<760: một cột, avatar nằm cạnh identity trong passport compact; prose sidebar ẩn. <360: metric/facts một cột. Tên80 ký tự, goal300 ký tự và email dài không gây overflow. CSS chỉ prefix profile-, không đổi route khác.

Source: [Profile/saveProfile/AccountSecurity/LegacyDraftImport](../../../app/profile/page.tsx), [profile.css](../../../app/profile/profile.css). Loading/error/retry và session/avatar fallback giữ nguyên. Không upload ảnh/đổi email hay schema.

Ảnh QA: [view desktop](assets/profile-desktop.png), [view mobile](assets/profile-mobile.png), [edit desktop](assets/profile-edit-desktop.png), [edit mobile](assets/profile-edit-mobile.png). Fixture synthetic Google/session chỉ chứng minh UI; [beta E2E](../../../tests/e2e/beta.spec.ts) kiểm API/DB/session thật. [UI tests](../../../tests/e2e/profile-ui.spec.ts) kiểm cancel/failure/lock/success/focus/320px.

[Audit](audit.md).
