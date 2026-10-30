# Function description — dictionary

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/api/dictionary/route.ts](../../../app/api/dictionary/route.ts) · `runtime` | `export const runtime` | Hàm/binding `runtime` phục vụ tra cứu từ điển tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/dictionary/route.ts](../../../app/api/dictionary/route.ts) · `asArray` | `function asArray<T>(value: T  /  T[]  /  undefined): T[]` | Hàm/binding `asArray` phục vụ tra cứu từ điển tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/dictionary/route.ts](../../../app/api/dictionary/route.ts) · `text` | `function text(value: unknown): string` | Hàm/binding `text` phục vụ tra cứu từ điển tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/dictionary/route.ts](../../../app/api/dictionary/route.ts) · `handleGet` | `async function handleGet(request: NextRequest)` | Hàm/binding `handleGet` phục vụ tra cứu từ điển tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/dictionary/route.ts](../../../app/api/dictionary/route.ts) · `search` | `async function search(term: string, part: EntryPart)` | Hàm/binding `search` phục vụ tra cứu từ điển tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/dictionary/route.ts](../../../app/api/dictionary/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |

## Input, output và lỗi theo điểm vào

- GET /api/dictionary?q=... — {configured,items}; KRdict key chỉ server.

Cache dictionary:ko:vi:<query>; không phải tiến độ lâu dài. Không có tokenizer hình thái học hoàn chỉnh.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
