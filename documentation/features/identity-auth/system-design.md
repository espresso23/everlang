# System design — identity-auth

[Nguồn hợp đồng auth duy nhất](../../shared/auth-and-api.md). Browser AuthProvider→Nest AuthController→AuthService→PG auth_refresh_sessions/auth_refresh_tokens/auth_one_time_tokens/users/auth_identities; SMTP verify/reset, Google token endpoint/JWKS cho code flow.

008 rename user/account, bỏ session/verification/provider tokens cũ; IDs/password/provider subjects không đổi, business FK được PostgreSQL giữ theo rename. Session/token insert và refresh transaction; replay lock serialized và revoke family. JWT verification kiểm RS256/issuer/audience/exp rồi truy vấn active session; quyền server hiện tại không phụ thuộc roles claim.

Google state token hash+PKCE verifier/nonce/link target lưu one-time server; cookie hash(state) ràng buộc browser,10phút. Callback consume một lần, verify ID token/JWKS/nonce/email, explicit linking không email takeover. Không lưu Google tokens. Lỗi callback chỉ code whitelist/generic trên UI; query/code/state không log.

Backup/restore/cutover theo [operations](../../shared/operations.md), kết quả [migration audit](../backend-nestjs-migration/audit.md).

## ORM data access — 2026-11-01

PostgreSQL dùng TypeORM EntitySchema/QueryBuilder; transaction dùng một QueryRunner, giữ ownership, row lock, CAS/version, JSONB và idempotency. MongoDB vẫn Mongoose. Hợp đồng dùng chung tại [ORM design](../postgresql-orm-migration/system-design.md); chi tiết regression ở [audit tích hợp](../../audits/postgresql-orm-migration.md). UI/layout không thay đổi.
