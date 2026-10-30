# Function description — identity-auth

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [lib/auth.ts](../../../lib/auth.ts) · `isAdmin` | `(email: string) ` | So email chuẩn hóa với ADMIN_EMAILS; không lấy role từ client. |
| [lib/auth.ts](../../../lib/auth.ts) · `sendMail` | `async function sendMail(to: string, subject: string, url: string)` | Gửi URL verify/reset qua SMTP; không log URL có token. |
| [lib/auth.ts](../../../lib/auth.ts) · `createAuth` | `function createAuth()` | Hàm/binding `createAuth` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/auth.ts](../../../lib/auth.ts) · `getAuth` | `export function getAuth()` | Khởi tạo lazy singleton Better Auth; yêu cầu BETTER_AUTH_SECRET ở runtime. |
| [lib/auth-client.ts](../../../lib/auth-client.ts) · `authClient` | `export const authClient` | Hàm/binding `authClient` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/sql/schema.ts](../../../lib/sql/schema.ts) · `user` | `export const user` | Hàm/binding `user` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/sql/schema.ts](../../../lib/sql/schema.ts) · `session` | `export const session` | Hàm/binding `session` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/sql/schema.ts](../../../lib/sql/schema.ts) · `account` | `export const account` | Hàm/binding `account` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/sql/schema.ts](../../../lib/sql/schema.ts) · `verification` | `export const verification` | Hàm/binding `verification` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/sign-in/page.tsx](../../../app/sign-in/page.tsx) · `Form` | `function Form()` | Component/type `Form` thuộc luồng tài khoản và xác thực; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/sign-in/page.tsx](../../../app/sign-in/page.tsx) · `submit` | `async function submit(e: React.FormEvent<HTMLFormElement>)` | Hàm/binding `submit` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/sign-in/page.tsx](../../../app/sign-in/page.tsx) · `SignIn` | `export default function SignIn()` | Component/type `SignIn` thuộc luồng tài khoản và xác thực; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/api/auth/[...all]/route.ts](../../../app/api/auth/[...all]/route.ts) · `runtime` | `export const runtime` | Hàm/binding `runtime` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/auth/[...all]/route.ts](../../../app/api/auth/[...all]/route.ts) · `GET` | `(request: Request) ` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/auth/[...all]/route.ts](../../../app/api/auth/[...all]/route.ts) · `POST` | `(request: Request) ` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/config/route.ts](../../../app/api/config/route.ts) · `dynamic` | `export const dynamic` | Hàm/binding `dynamic` phục vụ tài khoản và xác thực; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/config/route.ts](../../../app/api/config/route.ts) · `GET` | `() ` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |

## Input, output và lỗi theo điểm vào

- GET/POST /api/auth/* — handler Better Auth cho sign-up/email, sign-in/email, sign-in/social, callback/google, get-session, verify-email, reset/change password, sign-out.
- GET /api/config — {google:boolean}, no-store; không trả credential.

auth_user, auth_account, auth_session, auth_verification trong PostgreSQL; SMTP/Mailpit chỉ phục vụ email, không tham gia OAuth.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
