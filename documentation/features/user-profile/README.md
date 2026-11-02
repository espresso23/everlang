# Hồ sơ và mục tiêu học

Feature ID: user-profile. Branch: feature/user-profile. Ngày: 2026-10-30.
Trạng thái triển khai: implemented; xác minh cụ thể trong [audit](audit.md).

## Delta thiết kế được yêu cầu — feature/profile-editorial-layout

Người dùng cho phép đổi layout riêng /profile. View mặc định là learning passport hai cột: identity Cobalt, mục tiêu và nhịp học bằng dữ liệu thật; một hành động Chỉnh sửa hồ sơ mở inline editor. Editor có Hủy, Lưu, trạng thái lỗi/saving và focus rõ; hủy không gọi API. Lưu thành công quay về view và refetch header/session. Lỗi giữ nguyên dữ liệu đang nhập. Security và nhập nháp nằm trong disclosure riêng, không bị mất chức năng. Mobile xếp một cột; các route khác giữ wireframe đã chốt.

REQ-09: phân biệt view/edit, cancel không ghi, failure giữ draft, saving khóa hành động cạnh tranh, responsive320/390/1440, tên/goal/email dài không tràn, chỉ hiển thị thông tin thật. Không thêm upload ảnh, số thành tích hoặc mã học viên giả. API/schema/quyền giữ nguyên.

| Yêu cầu | Hành vi | Source và kiểm tra |
|---|---|---|
| REQ-01 | Chỉ chủ session đọc/lưu profile; email/role/user_id không được sửa qua body | [route GET/PUT](../../../apps/api/src/domains/profile.service.ts), [profileInput](../../../packages/contracts/src/profile.ts), [E2E thật](../../../tests/e2e/beta.spec.ts) |
| REQ-02 | Tên 1–80, mục tiêu 1–300, Trung/Cao cấp, phút nguyên 5–120, múi giờ hợp lệ; lưu nguyên tử | [PUT](../../../apps/api/src/domains/profile.service.ts), [schema tests](../../../tests/unit/profile.test.ts) |
| REQ-03 | Lịch đã tạo giữ nguyên; cấu hình mới dùng khi tạo lịch mới | [dashboard](../daily-dashboard/README.md), [profile UI](../../../apps/web/app/profile/page.tsx) |
| REQ-04 | Google avatar hoặc initials fallback ở header/profile; lỗi ảnh không làm mất định danh | [UserAvatar](../../../apps/web/components/user-avatar.tsx), [UI tests](../../../tests/e2e/profile-ui.spec.ts) |
| REQ-05 | Pending/error/guest/signed-in khác nhau; không hiện login khi pending hoặc mount private page sớm | [Shell](../../../apps/web/components/shell.tsx), [UI tests](../../../tests/e2e/profile-ui.spec.ts) |
| REQ-06 | Sau lưu refresh profile và session để header hiện tên mới; loading/error/retry/saving rõ ràng | [Profile](../../../apps/web/app/profile/page.tsx), [E2E thật](../../../tests/e2e/beta.spec.ts) |
| REQ-07 | Hiện provider; credential đổi password, Google-only yêu cầu email tạo password; explicit Google linking | [Profile](../../../apps/web/app/profile/page.tsx), [auth](../identity-auth/README.md) |
| REQ-08 | Nhập nháp local có xác nhận và không ghi đè nháp cloud; admin link theo role | [LegacyDraftImport](../../../apps/web/app/profile/page.tsx), [records](../learning-records/README.md) |

GET /api/profile → {user:{id,name,email,image,emailVerified,admin},profile:{level,goal,minutes,timezone},providers:string[],googleEnabled:boolean}. Provider chỉ là tên phương thức, không trả credential/token.
PUT /api/profile nhận đúng 5 trường REQ-02 và trả {saved:true}; 400 validation, 401 session, 403 verification/Origin, 415 JSON. Không nhận user_id hoặc role.

[System design](system-design.md) · [Functions](functions.md) · [UI](ui.md) · [Audit](audit.md).
Không hỗ trợ upload ảnh riêng hoặc đổi email. Dùng ảnh Google/session nếu có. SMTP production là điều kiện để người dùng thật nhận reset/verify; Mailpit chỉ inbox phát triển.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[LegacyDraftImport](../../../apps/web/app/profile/page.tsx). Nhập local drafts có dialog Nhập nháp/Hủy; khóa nút khi đang nhập và mở lại trong finally, giữ nguyên không ghi đè nháp cloud.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
