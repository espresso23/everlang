# Audit cập nhật — 2026-10-30, feature/user-profile

PASS phạm vi sửa: 23 unit, 7 Playwright; lint/typecheck và Docker production build. Profile API/DB/session/header dùng hai fixture email thật; trạng thái session/avatar/error dùng mock có chủ đích. Google login thật được chủ tài khoản xác nhận và SQL kiểm provider/image/session; explicit linking và SMTP production chưa kiểm end-to-end.

Review riêng bắt và sửa mobile selector ẩn avatar. Header không mount trang cá nhân khi pending/error; không phản chiếu raw OAuth query hoặc ghi code/state vào log mới.

[Audit nhóm](../../audits/profile-auth-integration.md) · [Profile UI và ảnh](../user-profile/ui.md).

## Lịch sử audit baseline

# Audit — identity-auth

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | OAuth từng lỗi redirect_uri_mismatch đã khắc phục; log 2026-10-30 ghi invalid_client vì secret không hợp lệ. Probe sau khi người dùng cập nhật trả invalid_grant với refresh token giả; chưa phải kiểm thử login/session thật. Email đã có tài khoản phải dùng explicit linking. SMTP production chưa được cấu hình. |

## Audit kết nối

Luồng phải kiểm: **Form/Google → Better Auth → PostgreSQL account/session → cookie → useSession → Shell/API**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

OAuth từng lỗi redirect_uri_mismatch đã khắc phục; log 2026-10-30 ghi invalid_client vì secret không hợp lệ. Probe sau khi người dùng cập nhật trả invalid_grant với refresh token giả; chưa phải kiểm thử login/session thật. Email đã có tài khoản phải dùng explicit linking. SMTP production chưa được cấu hình.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.
