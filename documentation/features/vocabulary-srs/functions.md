# Function description — vocabulary-srs

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/vocabulary/page.tsx](../../../app/vocabulary/page.tsx) · `Vocabulary` | `function Vocabulary()` | Component/type `Vocabulary` thuộc luồng kho từ và lặp lại ngắt quãng; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/vocabulary/page.tsx](../../../app/vocabulary/page.tsx) · `save` | `async function save(e: React.FormEvent<HTMLFormElement>)` | Hàm/binding `save` phục vụ kho từ và lặp lại ngắt quãng; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/vocabulary/page.tsx](../../../app/vocabulary/page.tsx) · `rate` | `async function rate(rating: number)` | Hàm/binding `rate` phục vụ kho từ và lặp lại ngắt quãng; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/vocabulary/page.tsx](../../../app/vocabulary/page.tsx) · `Page` | `export default function Page()` | Component/type `Page` thuộc luồng kho từ và lặp lại ngắt quãng; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/api/vocabulary/route.ts](../../../app/api/vocabulary/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/vocabulary/route.ts](../../../app/api/vocabulary/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/vocabulary/route.ts](../../../app/api/vocabulary/route.ts) · `PUT` | `export const PUT` | Handler `PUT`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/reviews/route.ts](../../../app/api/reviews/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/learning/srs.ts](../../../lib/learning/srs.ts) · `ALGORITHM` | `export const ALGORITHM` | Component/type `ALGORITHM` thuộc luồng kho từ và lặp lại ngắt quãng; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [lib/learning/srs.ts](../../../lib/learning/srs.ts) · `newCard` | `export async function newCard(id: string, now = new Date())` | Tạo card mới bằng preset FSRS-7, cardId và thời điểm đầu vào. |
| [lib/learning/srs.ts](../../../lib/learning/srs.ts) · `reviewCard` | `export async function reviewCard( card: unknown, rating: number, now = new Date(), )` | Phục hồi Date từ JSON rồi tính card/revlog mới cho mức nhớ 1–4. |

## Input, output và lỗi theo điểm vào

- GET /api/vocabulary?due=true — {items,dueCount}, tối đa 500.
- POST/PUT /api/vocabulary — term,meaning,context,note,kind,sourceId; PUT thêm id/version/suspended.
- POST /api/reviews — {id,rating:1..4,version,requestId}; 404 ownership, 409 stale/due.

vocabulary, review_logs; due là timestamp, version tăng khi sửa/ôn. JSON card phục hồi dueAt/lastReviewAt thành Date.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
