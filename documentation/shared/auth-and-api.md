# Hợp đồng auth và API

Điểm chuẩn: [auth](../../lib/auth.ts), [API guard](../../lib/api.ts), [client request](../../lib/client.ts). Canonical feature: [identity-auth](../features/identity-auth/README.md).

- Đăng ký email mở bình thường; xác minh email trước truy cập dữ liệu cá nhân. Google bật khi có hai biến OAuth. Không có danh sách email mời.
- Cookie server session; `x-user-id` không cấp quyền. Mutation yêu cầu Origin phù hợp và JSON. Admin được xác định server từ `ADMIN_EMAILS`, không từ body.
- Liên kết Google từ phiên đã đăng nhập, không tự gộp tài khoản trùng email. Callback `/api/auth/callback/google` phải khớp Google Cloud.
- `401`: không có session. `403`: chưa verify hoặc thiếu admin. `404`: không tìm thấy tài nguyên thuộc user. `409`: version/trùng tác vụ hoặc xung đột. `415`: mutation sai content type. Lỗi cấu hình provider có thể trả `503`; lỗi dữ liệu `400`.
- Chấm bài: `202 + jobId` khi queued; đọc trạng thái theo session. Kết quả cache có thể trả `200`; failure không sinh điểm giả. Nháp/SRS/dashboard có hợp đồng version riêng ở từng feature.
- GET profile chỉ công khai dữ liệu hồ sơ của chính user; tuyệt đối không trả auth_account token/password. Log không lưu code/state/cookie/OAuth secret.

SMTP dùng cho verify/reset của email/password; Google OAuth không gọi Mailpit để đổi code/token. Production cần SMTP thật và HTTPS/cookie/domain đúng. Cấu hình OAuth hợp lệ không chứng minh user đã hoàn tất callback; phải xác nhận session qua luồng thực tế.

Profile GET có explicit user fields và providers:string[]; PUT strict schema, một transaction name/settings, client refetch session không dùng cookie cache. Xem [profile contract](../features/user-profile/README.md).

## Speech API

/api/speech GET own history/status; POST strict provider/consentVersion/consent/audio/mime/reference/requestId trả202; DELETE own UUID. /api/speech/audio?id=uuid owner-only cookie-auth no-store. Không tin x-user-id, không nhận file path. Provider snapshot mismatch409; worker/config mismatch503; deleted nonce410; concurrency/rate429; không score. [Canonical contracts](../features/self-hosted-speech/functions.md).

/api/word-sets GET verified published catalogue, /api/word-sets/learn GET/POST/PUT owner state/server snapshots/preferences, /api/admin/word-sets admin-only CRUD workflow. Không nhận userId/meaning/card/score client khi save; server validates published set membership/revision. New/day quota per-user advisory transaction; self-report không sửa lịch/card. [Detailed contracts](../features/vocabulary-catalog/functions.md).

Kho hệ thống: GET /api/knowledge và /api/word-sets trả metadata language=ko, ownership=system; unsupported language400, session verified vẫn bắt buộc. Học liệu published dùng chung, lưu/bookmark/note/SRS theo session riêng; không tự publish seed. [Error boundaries](error-handling.md).
