# Vận hành và rollback

Nguồn: [Compose](../../docker-compose.yml), [Dockerfile](../../Dockerfile), [Caddy](../../Caddyfile), [scripts](../features/platform-operations/functions.md).

Local: `docker compose --profile local up -d --build`. App ở localhost:3000, Mailpit ở localhost:8025. Mailpit bắt email verify/reset để kiểm tra link mà không gửi email ra ngoài; không tham gia Google OAuth. Để dùng email thật, cấu hình SMTP tương ứng trong môi trường; không tắt verify chỉ vì bỏ inbox local.

Các biến bắt buộc/tuỳ chọn được liệt kê trong file cấu hình mẫu của dự án; chỉ điền giá trị thật trong `.env` bị gitignore. Khi thay biến môi trường cần recreate container; chỉ restart không đọc lại `.env`. Không in `docker compose config` đầy đủ vì có thể lộ secret.

Kiểm tra: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run docs:check`. E2E `E2E_AUTH_TESTS=1` cần local SMTP/Mailpit và account dùng một lần; test OAuth thật cần thao tác người sở hữu Google. Giữ kết quả thực tế ở audit, không đổi skipped thành passed.

Trước thay schema/import: backup MongoDB/PostgreSQL, kiểm tra đọc được bản backup, giữ volume cũ. Migration là additive 001–003; rollback ứng dụng phải đánh giá tương thích schema, không tự drop bảng/volume. CLI nhập legacy chỉ chạy sau xác nhận ánh xạ tài khoản. Không có cam kết restore thành công nếu chưa diễn tập tại môi trường đích.
