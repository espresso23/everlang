# Tech stack thực tế

Nguồn phiên bản: [package.json](../../package.json), [lockfile](../../package-lock.json), [Docker Compose](../../docker-compose.yml). Các dấu `^` trong package là range; lockfile quyết định bản cài.

| Lớp | Stack hiện tại | Vai trò |
|---|---|---|
| Web | Next.js 16.4.3, React 19.3, TypeScript 5, Tailwind 4 | App Router, UI, Route Handlers |
| Auth | Better Auth / Drizzle adapter 1.7.14 | Email/password, Google, server session |
| Cá nhân | PostgreSQL 17 image pgvector, pg 8.23, Drizzle 0.45 | Auth, tiến độ, JSONB báo cáo, embedding |
| Học liệu | MongoDB 8, Mongoose 9.11 | Sentence/Exam và bản lưu dữ liệu cũ |
| Queue/cache | Redis 7, ioredis 6, BullMQ 6.5 | Chấm nền, cache và rate limit |
| AI | OpenRouter, Zod 4.6, jsonrepair 3.15 | Chấm/nháp/Tutor và kiểm tra đầu ra |
| Ôn tập | ts-fsrs **6.0.0** | FSRS-7, lưu phiên bản thuật toán |
| Email | Nodemailer 10.3, SMTP | Verify/reset; Mailpit chỉ là inbox local |
| Audio | Google Cloud Speech 8.2, AWS SDK S3 3.x, Web Speech API | STT, private object, phát âm trình duyệt |
| Kiểm tra | Vitest 5, Playwright 1.64, ESLint 9 | Logic, API/luồng UI, lint |
| Vận hành | Docker, Node 24, Caddy | App standalone và worker riêng |

Mô hình không tách NestJS/microservice. Chưa có billing/quota kinh doanh. Mở tiếng Hàn trước; cấu trúc language/skill/level/contentVersion được giữ để mở rộng sau. Phiên bản Next hiện tại có thay đổi API: trước sửa code đọc guide tương ứng trong `node_modules/next/dist/docs/`.
