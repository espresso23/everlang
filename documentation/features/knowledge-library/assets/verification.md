# Verification record — 2026-10-31

Branch `feature/self-study-library`. Các lệnh chạy tại repo primary D:/Project/langz, không phải checkout profile cũ. Không lưu credential, email verification URL hoặc browser storageState vào bằng chứng Git.

- `npm test`:37/37 unit đạt, gồm5 knowledge contract cases và9 planning cases; kiểm seed/answers/cloze/identity/versions, planning constraints.
- `npx tsc --noEmit`, `npm run lint`: exit0 sau source mới.
- `npm run build`: compile/typecheck/static generation thành công; thêm knowledge/admin routes và API.
- `docker compose build app worker`: đạt; app build lại sau CSS review. Candidate chạy cùng PG/Mongo nhưng port3001 và allowlist admin **chỉ trong candidate**, không thay cấu hình tài khoản ứng dụng chính.
- `E2E_KNOWLEDGE=1 E2E_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/knowledge.spec.ts`:1/1 integration test đạt (15.5s final run), hai account QA đăng ký/verify qua Mailpit thật. Bao phủ auth/role, draft visibility, workflow/CAS, search, notes isolation/stale recovery, submit idempotency, UI feedback/SRS, related references, keyboard mục lục và viewport320/390. Auth/provider không mock trong test này.
- `npx playwright test tests/e2e/beta.spec.ts --grep 'sign-in is responsive'`:1/1 smoke đạt (6.0s) trên app local3000 sau update. Không rerun Google OAuth bằng người dùng thật trong lượt này.
- Browser screenshots committed tại reader-desktop.png và reader-mobile.png; đã xem trực quan bằng image viewer, fixture QA không phải dữ liệu học đã duyệt.
- PG: `pg_dump -Fc`, restore bằng `pg_restore --exit-on-error` vào database tạm everlang_knowledge_restore, kiểm schema_migrations=3 trước004, rồi xóa database tạm. Mongo: `mongodump --archive`, `mongorestore --nsFrom=korean_practice.* --nsTo=everlang_knowledge_restore.*`;4 collections restored, xóa database tạm. Backup private trong .local/backups, không commit.
- `docker compose run --rm --no-deps worker npm run db:migrate`: Applied004. `npm run seed:knowledge`:13 draft insert, lần2=0. Legacy translations/submissions không sửa.
- Candidate và các tài khoản/knowledge fixtures QA đã dọn sau test; còn13 draft thực, không published QA. Nội dung đang chờ owner review qua app.

Thêm rendering720CSSpx/DPR2 (tương đương layout1440px scale200%) và user text spacing override trên390px, không horizontal overflow; screenshot reader-scale2.png. Keyboard focus/Enter mục lục và ghi nhớ/save kiểm bằng Playwright. Không suy ra toàn ứng dụng đạt WCAG.

Giới hạn: thiết bị phát âm/TTS thật, nội dung người duyệt, browser zoom/assistive technology thật và SPA unsaved guard toàn app còn mở. Retag warm rollback image cũ thất bại vì image cũ không còn trong local image store; đã rebuild thành công từ source commit98dd29a thành everlang-before-knowledge:local; candidate3002 trên DB sau migration trả sign-in200, profile401 và knowledge404 đúng app cũ, rồi đã dọn candidate. Đây là build/bootstrap compatibility check, không là thử restore mọi người dùng/Google login trên bản rollback. Schema additive nên app cũ có thể bỏ qua bảng mới; không drop dữ liệu để rollback.
