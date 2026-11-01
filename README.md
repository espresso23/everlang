# EverLang

[Checkpoint tính năng và bàn giao sprint tiếp theo](documentation/project-status.md) · [Tracking](documentation/planning/DASHBOARD.md).

Quy tắc phát triển: [AGENTS.md](AGENTS.md). Đặc tả, system design, function description, UI và audit từng feature: [documentation/README.md](documentation/README.md).

Beta tự học tiếng Hàn trung–cao cấp: luyện dịch → hiểu lỗi → lưu kiến thức → ôn SRS → lịch học mỗi ngày.

## Chạy cục bộ

1. Sao chép `.env.example` sang `.env`; tạo `POSTGRES_PASSWORD` ngẫu nhiên, chạy `npm run auth:keys` để ghi RSA/CSRF keys vào `.env`. Không có tài khoản/mật khẩu mặc định.
2. Mọi email đều có thể đăng ký; đặt riêng email quản trị trong `ADMIN_EMAILS`, phân cách dấu phẩy.
3. Chạy `docker compose --profile local up --build -d`. Migration chạy trước app/worker. Với bản cũ dùng MongoDB, đọc bước snapshot/cutover PostgreSQL-only trước khi chạy runtime mới.
4. Mở [EverLang](http://localhost:3000/sign-in), đăng ký rồi xác minh email qua [Mailpit local](http://localhost:8025).
5. AI cần `OPENROUTER_API_KEY`; từ điển cần `KRDICT_API_KEY`. Không tạo phản hồi giả khi thiếu khóa.

Node.js 24.11 trở lên. Web dùng Next.js/TypeScript/Tailwind; API và worker dùng NestJS, JWT RS256 và PostgreSQL/TypeORM (pg chỉ là driver). PostgreSQL JSONB giữ cả học liệu; không cần MongoDB/Mongoose; Redis/BullMQ phục vụ cache và hàng đợi. FSRS dùng `ts-fsrs@6.0.0`, FSRS-7, retention 0.9.

## Google và email

- Đặt `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` mới; thay secret từng xuất hiện trong ảnh/cuộc trò chuyện.
- Callback local: `http://localhost:3000/api/auth/callback/google`; production: `https://<domain>/api/auth/callback/google`.
- Để mọi tài khoản Google dùng được, chuyển OAuth consent screen sang Production; chế độ Testing của Google vẫn giới hạn test users. Email đã tồn tại: đăng nhập phương thức cũ rồi liên kết Google tại Cài đặt, không tự gộp tài khoản.
- Production dùng SMTP thật qua `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`. Mailpit chỉ dùng cho local.
- JWT Bearer, active session và ownership được kiểm tra trên server; không tin `x-user-id`. Email đăng ký bằng mật khẩu cần được xác minh; không có danh sách mời.

## API và dữ liệu

- `/api/auth/*`: native Nest AuthController; access token RAM/Bearer, refresh HttpOnly cookie rotate/replay detection. `/api/profile`, `/api/drafts`: hồ sơ cập nhật nguyên tử, nháp có kiểm tra version để tránh ghi đè nhiều thiết bị. Hồ sơ hiện dùng last successful save; chi tiết ở documentation/features/user-profile.
- `/api/submissions/grade`: POST `{sentenceId,userTranslation,requestId,forceRegrade}`; `requestId` là UUID. Trả báo cáo cache hoặc `202 {jobId}`; đọc kết quả tại `/api/jobs?id=...`.
- `/api/submissions`: lịch sử từng lần; `/api/user/stats`, `/api/user/favorites`: thống kê/yêu thích.
- `/api/vocabulary`, `/api/reviews`, `/api/dashboard`: kho từ, ôn SRS, lịch ngày. Mutation gửi JSON và version đang đọc.
- `/api/admin/content`: draft → reviewed → published; chỉ admin. Bài đã xuất bản bất biến. Endpoint sinh bài cũ ngừng dùng; AI tạo nháp qua admin.
- `/api/tutor`: POST hỏi; PUT admin tạo chỉ mục embedding (có chi phí).
- `/api/recordings`: POST audio WebM Opus base64 tối đa 3 MB với consent; GET bản ghi của mình hoặc URL riêng tư 5 phút.
- `/api/exams`: GET danh sách/lượt thi; POST bắt đầu/tiếp tục; PATCH tự lưu/nộp; PUT admin nhập đề theo `packages/contracts/src/exams.ts`.
- Báo cáo giữ snapshot học liệu và phiên bản model/prompt/rubric. PostgreSQL giữ trạng thái job; worker đối soát hàng đợi mỗi 30 giây. Redis không giữ tiến độ lâu dài.

## Học liệu và tích hợp mở rộng

- 100 bài luyện dịch gốc giữ để dùng beta; cần rà soát nguồn/quyền sử dụng trước phát hành công khai.
- Thư viện có bài đọc tự biên soạn, TTS trình duyệt, chép chính tả, thu âm/nghe lại cục bộ. Chưa có audio luyện thi do người bản ngữ biên soạn.
- S3 cần `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`; bucket phải private.
- Google Speech dùng `GOOGLE_CLOUD_PROJECT` và Application Default Credentials. Nếu dùng JSON, mount read-only bằng compose override, đặt `GOOGLE_APPLICATION_CREDENTIALS` thành đường dẫn trong container; không đưa credential vào image.
- Tutor dùng pgvector và `openai/text-embedding-3-small` (1536 chiều) qua OpenRouter. Chưa có chỉ mục thì báo trạng thái rõ ràng; admin chủ động tạo chỉ mục.
- Engine thi có mini và full TOPIK II PBT. Beta có một bài mini tự biên soạn, không phải đề thật. Full cần 50 Nghe/50 Đọc/4 Viết, 100 điểm/kỹ năng, 180 phút và nội dung có quyền sử dụng. Chưa mô phỏng chia phiên PBT hoàn chỉnh; chưa quy đổi điểm được kiểm định.
- TOPIK Speaking/IBT, IELTS/HSK/JLPT và điểm phát âm chưa triển khai; mở sau audit tiếng Hàn.

## Kiểm tra, backup và vận hành

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- `npm run test:e2e`: smoke UI/anonymous isolation. Test tài khoản dùng môi trường riêng với `E2E_AUTH_TESTS=1` và hai email QA riêng biệt; không dùng dữ liệu người học thật.
- `docker compose logs --tail=100 api worker`. API có `x-request-id`; không log body, credential hay audio.
- Backup: `./scripts/backup.ps1`, lưu riêng tư trong `.local/backups` (gitignored). Thử phục hồi vào database khác trước khi chuyển dữ liệu.
- Import lịch sử: `docker compose run --rm worker npm run records:import -- <legacyUUID> <verifiedEmail> --confirm-owner`. Đối chiếu chủ dữ liệu trước khi chạy. Đọc PG legacy archive đã nhập từ snapshot, chạy lại không tạo trùng. Không có API nhận UUID để tự nhận lịch sử.
- Khi migration lỗi: giữ bản app cũ; khôi phục PostgreSQL từ backup vào database mới rồi đổi cấu hình. Không xóa volume để cập nhật app.
- Production: cấu hình DNS/domain, `PUBLIC_ORIGIN=https://<domain>`, SMTP thật và profile `production`. Caddy cấp HTTPS; database không publish cổng. Không mở Mailpit khi phát hành Internet.

Xem [FEATURE_AUDIT.md](FEATURE_AUDIT.md) và [HANDOFF.md](HANDOFF.md) cho bằng chứng và việc còn lại.

## Backend NestJS — 2026-11-01

`apps/web` UI (3001), `apps/api` native HTTP (4000), `apps/worker` BullMQ; Caddy gateway tại3000. Không public API/web port riêng. `packages/contracts` browser-safe; `packages/backend` dữ liệu/provider/log. [Kiến trúc](documentation/shared/architecture.md), [JWT contract](documentation/shared/auth-and-api.md), [cutover/rollback](documentation/shared/operations.md), [migration audit](documentation/features/backend-nestjs-migration/audit.md).

`npm ci`, `npm run build`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run backend:check`, `npm run docs:check`, `npm run plan:check`. Host dev cần PostgreSQL/Redis và env endpoints truy cập được: `npm run dev` khởi động bốn process. Docker là cách chạy đầy đủ mặc định. Swagger `/api/docs`, health `/api/health/ready`. `npm run start` chỉ khởi gateway cho các runtime đã chạy; production dùng Compose.

Migration008 giữ ID/password/Google identity/business data, vô hiệu phiên và link verify/reset cũ. Không rollback bằng image cũ trên schema mới: phục hồi đủ snapshot PG/Mongo/Redis/media vào môi trường riêng. Google thật trên Nest cần chủ tài khoản xác nhận; không dùng xác minh backend cũ để kết luận backend mới.

Data layer: [TypeORM migration/design/audit](documentation/features/postgresql-orm-migration/README.md); [system design](documentation/shared/architecture.md). PostgreSQL kiểm soát rate limit, tiến độ/auth hoạt động khi Redis down; queue trả503 có requestId và phục hồi khi Redis trở lại.

PostgreSQL-only migration: [PRD/kiểm chứng](documentation/features/postgresql-only/README.md). Dữ liệu Mongo được nhập bằng snapshot offline; giữ bản gốc riêng để rollback, không cần Mongo service khi chạy app.
