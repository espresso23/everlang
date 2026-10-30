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
