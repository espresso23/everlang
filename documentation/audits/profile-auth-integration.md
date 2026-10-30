# Audit tích hợp profile/auth — 2026-10-30

Branch feature/user-profile; nền tài liệu d151dcb. Review riêng đối chiếu REQ → UI → session → API → PostgreSQL → refetch header.

## Review code và contract

- Profile API chỉ trả trường user được chọn và provider_id; không SELECT password/token. PUT strict schema, không nhận user_id/email/role. Guard xác minh session giữ nguyên.
- UPDATE auth_user và UPSERT profiles cùng một transaction/connection, rollback/release đầy đủ. Không thay schema/dữ liệu người dùng hiện có.
- Better Auth hiện không bật cookie cache/secondary storage; sau lưu client GET profile và refetch session. Nếu bật cache sau này cần audit invalidation lại.
- Shell pending/error không mount private pages, tránh các 401 do page fetch sớm; guest CTA chỉ xuất hiện sau kết quả session null. API vẫn kiểm quyền độc lập.
- UserAvatar dùng ảnh HTTPS unoptimized, không proxy; lỗi ảnh chuyển initials có alt. Profile/security state phân biệt Google/credential.
- Auth callback wrapper log route cố định và mã whitelist; không ghi query, Location, code/state/cookie. OAuth error UI không phản chiếu query; invalid email token có thông báo riêng.
- Snapshot lịch hôm nay không sửa khi profile thay đổi. Profile hai tab hiện dùng last successful save, không có version-conflict UI.

## Bằng chứng

| Kết nối / ca kiểm | Trạng thái | Bằng chứng |
|---|---|---|
| Google token exchange → account/image/session | PASS tại local trước deploy UI mới | Chủ tài khoản xác nhận vào trang học; SQL đếm một google provider, một image và một active session; không lưu danh tính/token |
| Schema và quyền field identity | PASS | [unit](../../tests/unit/profile.test.ts), [beta E2E](../../tests/e2e/beta.spec.ts) |
| API → PostgreSQL → session → profile/header | PASS | beta E2E dùng email QA, không giả auth cho ca này |
| Pending/guest, avatar success/fallback, lỗi session/profile retry | PASS | [UI tests](../../tests/e2e/profile-ui.spec.ts), provider/session mô phỏng |
| Build/lint/typecheck | PASS | npm run lint; npx tsc --noEmit; production Docker build, app recreate và 7/7 Playwright trên container mới |
| Google linking trùng email / Google-only tạo password qua email thật | NOT VERIFIED end-to-end | Giữ API Better Auth; UI và contract review, không thao tác account Google thật ngoài đăng nhập người dùng đã xác nhận |
| SMTP production, thiết bị thật thứ hai | NOT VERIFIED | Local Mailpit khác SMTP gửi Internet; Playwright không thay kiểm thiết bị thật |

## Phục hồi và phạm vi

Không migration mới. Có thể redeploy commit nền để rollback code; profile settings người dùng đã lưu giữ nguyên. Không drop volume hoặc sửa account thật để kiểm thử. Tài khoản QA phải dọn theo email fixture chính xác sau E2E.

[Profile audit](../features/user-profile/audit.md) · [Auth](../features/identity-auth/audit.md) · [Design system](../features/design-system/audit.md).


## Kết quả cuối

- 23/23 unit test, 7/7 Playwright (32.2 giây), lint/typecheck/production Docker build đạt. Hai fixture email đã dọn; Google account/session của chủ dự án giữ nguyên.
- 2 test E2E dùng auth/API/DB thật; 5 test UI mô phỏng session/provider để chủ động tái hiện pending, lỗi ảnh/kết nối/callback. Test UI mô phỏng không được tính là Google OAuth thật.
- Review ảnh desktop 1440 và mobile 390px: avatar/fallback, identity, form/security render đúng; không tràn ngang trang. Nav được phép cuộn ngang.
- Phát hiện và sửa trong audit: selector mobile cũ ẩn tất cả span trong user-link, nay chỉ ẩn user-name. Thêm assertion avatar header vẫn visible mobile.
- Lượt Playwright đầu có hai lỗi selector test (Google notice nằm trong paragraph dài và Next route announcer cũng có role=alert); đã sửa locator theo nội dung. Lượt cuối toàn bộ 7 test đạt.
- Ảnh bền vững nằm trong assets của profile và 5 feature học tập; chỉ dữ liệu QA. Docs/file/symbol/hash được kiểm bởi docs:check sau review, không dùng hash như chứng nhận hành vi.
