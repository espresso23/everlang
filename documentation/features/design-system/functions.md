# Function description — design-system

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [components/shell.tsx](../../../components/shell.tsx) · `Shell` | `export function Shell(` | Component/type `Shell` thuộc luồng app shell và nhận diện; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/layout.tsx](../../../app/layout.tsx) · `metadata` | `export const metadata` | Hàm/binding `metadata` phục vụ app shell và nhận diện; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/layout.tsx](../../../app/layout.tsx) · `RootLayout` | `export default function RootLayout(` | Component/type `RootLayout` thuộc luồng app shell và nhận diện; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/globals.css](../../../app/globals.css) | Cấu hình/schema/asset/script | Không có database riêng; Shell đọc Better Auth session; design tokens trong globals.css là nguồn CSS chuẩn. |
| [app/icon.svg](../../../app/icon.svg) | Cấu hình/schema/asset/script | Không có database riêng; Shell đọc Better Auth session; design tokens trong globals.css là nguồn CSS chuẩn. |
| [app/favicon.ico](../../../app/favicon.ico) | Cấu hình/schema/asset/script | Không có database riêng; Shell đọc Better Auth session; design tokens trong globals.css là nguồn CSS chuẩn. |

## Input, output và lỗi theo điểm vào

- Không thêm public API; dùng /api/auth/get-session từ authClient.

Không có database riêng; Shell đọc Better Auth session; design tokens trong globals.css là nguồn CSS chuẩn.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
