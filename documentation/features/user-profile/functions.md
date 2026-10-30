# Function description — user-profile

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/profile/page.tsx](../../../app/profile/page.tsx) · `Profile` | `export default function Profile()` | Component/type `Profile` thuộc luồng hồ sơ và mục tiêu học; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/profile/page.tsx](../../../app/profile/page.tsx) · `LegacyDraftImport` | `function LegacyDraftImport(` | Xác nhận nhập nháp local, dùng version0 để không ghi đè cloud đã tồn tại. |
| [app/api/profile/route.ts](../../../app/api/profile/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/profile/route.ts](../../../app/api/profile/route.ts) · `PUT` | `export const PUT` | Handler `PUT`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |

## Input, output và lỗi theo điểm vào

- GET /api/profile — {profile,user,googleEnabled}.
- PUT /api/profile — {name,level,goal,minutes,timezone}; {saved:true}; 400 validation, 401/403 auth.

Tên/email/image nằm ở auth_user; level/goal/minutes/timezone nằm ở profiles. Hiện PUT gọi updateUser rồi SQL riêng, chưa phải transaction chung.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
