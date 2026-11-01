# Verification — 2026-11-01

[account helper](../../tests/e2e/helpers/account.ts) tạo disposable email/password user, lấy link Mailpit đúng email/origin, verify và login. [JWT context](../../tests/e2e/helpers/jwt-context.ts) giữ access token RAM, CSRF và fresh family khi tạo browser context; không serialize Bearer token vào fixture. Traces chứa cookie/token nên ở test-results ignored, không commit.

- `npm test`: unit business/FSRS/provider/error/worker, scrypt, JWT signature/issuer/audience/expiry/revocation và global filter.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run backend:check`, `npm run docs:check`, `npm run plan:check`.
- `E2E_BASE_URL=http://localhost:3002`, `E2E_AUTH_TESTS=1`: beta.spec và nest-auth.spec trên candidate riêng. `E2E_NO_AI_KEY=1` chỉ khi candidate worker không có AI key, kiểm API→queue→worker failure/retry/tracing mà không gọi provider.
- `E2E_KNOWLEDGE=1`, `E2E_CATALOG=1`: candidate riêng có admin QA tương ứng; real DB transactions/ownership/concurrency/catalogFSRS/UI. Không chạy trên dữ liệu thật.
- `E2E_NATIVE_MEDIA=1`: private-audio.spec chỉ QA database tên cố định, fixture seed WAV tổng hợp chỉ kiểm authorization/blob cleanup, không chứng nhận ASR.
- `E2E_SPEECH=1`, `E2E_SPEECH_DISABLED=1`: disabled provider UI; inference thật cần fixture được duyệt và worker/provider cấu hình riêng.
- profile-ui/sample-audio/grading-retry/editorial dùng transport/platform fixtures, không thay thế native auth/service integration.

[Migration audit](../features/backend-nestjs-migration/audit.md) ghi kết quả và giới hạn. Google live/SMTPproduction/cloud AI/ASR chưa verified trên Nest nếu không có evidence riêng; không lấy baseline cũ làm bằng chứng mới. Backup restore rehearsal không thay thế final maintenance snapshot.
