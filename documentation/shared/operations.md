# Vận hành và rollback

Nguồn: [Compose](../../docker-compose.yml), [Dockerfile](../../Dockerfile), [Caddy](../../Caddyfile), [scripts](../features/platform-operations/functions.md).

Local: `docker compose --profile local up -d --build`. App ở localhost:3000, Mailpit ở localhost:8025. Mailpit bắt email verify/reset để kiểm tra link mà không gửi email ra ngoài; không tham gia Google OAuth. Để dùng email thật, cấu hình SMTP tương ứng trong môi trường; không tắt verify chỉ vì bỏ inbox local.

Các biến bắt buộc/tuỳ chọn được liệt kê trong file cấu hình mẫu của dự án; chỉ điền giá trị thật trong `.env` bị gitignore. Khi thay biến môi trường cần recreate container; chỉ restart không đọc lại `.env`. Không in `docker compose config` đầy đủ vì có thể lộ secret.

Kiểm tra: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run docs:check`. E2E `E2E_AUTH_TESTS=1` cần local SMTP/Mailpit và account dùng một lần; test OAuth thật cần thao tác người sở hữu Google. Giữ kết quả thực tế ở audit, không đổi skipped thành passed.

Trước thay schema/import: backup MongoDB/PostgreSQL, kiểm tra đọc được bản backup, giữ volume cũ. Migration là additive 001–003; rollback ứng dụng phải đánh giá tương thích schema, không tự drop bảng/volume. CLI nhập legacy chỉ chạy sau xác nhận ánh xạ tài khoản. Không có cam kết restore thành công nếu chưa diễn tập tại môi trường đích.

## Speech providers

Xem [speech ops/system design](../features/self-hosted-speech/system-design.md). Chạy migration005/006 trước app mới. Chọn đúng **một** provider/profile:

- Gemini: GEMINI_API_KEY server-only từ project Free tier chưa bật billing, SPEECH_PROVIDER=gemini; build app + speech-api-worker, `docker compose --profile speech-api up -d --build speech-api-worker app`. Không cần model volume/native build. Limit384MB/1CPU, quota nội bộ20 calls/day UTC; Redis outage failclosed. Không tự xác minh billing bằng key. Hiện key trả402 prepaid depleted; không bật billing/nạp tiền trong task.
- Whisper: SPEECH_PROVIDER=whispercpp; `docker compose --profile speech up -d --build speech-worker app` chạy model init explicit, SHA verified, model mounted readonly;2CPU/1200MB/concurrency1, AVX2+FMA+F16C hoặc portable. Hosting/RAM không miễn phí dù model không có API fee.

Không bật hai worker profile cùng queue. Stop worker đang dùng trước đổi provider; pending snapshot khác provider sẽ failed rõ, cần người dùng consent/gửi lại. Default disabled giữ khả năng thu/nghe trên thiết bị.

Backup PostgreSQL **và speech_media** khi không có upload/jobs đang ghi, restore cả hai cùng snapshot. Không dùng chỉ pg_dump để hứa khôi phục audio. Giữ dump/archive ngoài Git; chỉ evidence không chứa bí mật trong documentation. Rollback app cũ giữ bảng/volume, không DROP. Next output tracing loại .local/.env/.git/test artifacts; dynamic private read có turbopackIgnore theo build docs để không trace private filesystem vào standalone.
