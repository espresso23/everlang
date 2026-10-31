# Shared integration test fixtures

`tests/e2e/helpers/account.ts` planned helper: tạo disposable email/password user, lấy verify link từ Mailpit local theo email, kiểm origin đúng test baseURL, xác minh và login. Không log password/token/link; callback relative. Account chỉ QA *@example.test, cleanup sau test; không tự tạo tài khoản bên ngoài. Playwright failure traces ở test-results private/ignored, không commit token. Feature audits phân biệt actual services/provider với fake transport/platform state. Helper canonical owner platform-operations, mỗi feature link contracts riêng.
