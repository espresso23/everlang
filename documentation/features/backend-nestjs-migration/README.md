# Backend NestJS migration

2026-11-01; feature backend-nestjs-migration; implemented; đặc tả tạo trước code, verification xem audit, branch feature/nestjs-jwt-migration. Checkpoint retry409 giữ tại0b34a97.

REQ01: monorepo web/API/worker, toàn bộ business routes Nest native, không BetterAuth/Next backend. REQ02: JWT RS25615min RAM/Bearer, opaque refresh256bit HttpOnly/Secure/SameSiteLax/pathauth30days absolute, hash/rotation/replay/session revocation, Google/email/password giữ ID/hash. REQ03: global filter/interceptor và JSON log requestId xuyên queue/job/attempt; không secrets/body/audio trong log. REQ04: bảo toàn PG/Mongo/FSRS/media/queue, backup/restore, một lần maintenance cutover. REQ05: parity tests, docs18features/source map/legacy gate; Google thật cần owner xác nhận.

[System design](system-design.md) · [Functions](functions.md) · [UI](ui.md) · [Audit](audit.md). Không đánh dấu hoàn tất khi gate bắt buộc chưa verified.
