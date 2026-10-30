# Function description — ai-tutor

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/api/tutor/route.ts](../../../app/api/tutor/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/tutor/route.ts](../../../app/api/tutor/route.ts) · `PUT` | `export const PUT` | Handler `PUT`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/tutor.ts](../../../lib/tutor.ts) · `embed` | `export async function embed(text: string)` | Gọi OpenRouter embeddings và kiểm 1536 số hữu hạn trước trả vector string. |

## Input, output và lỗi theo điểm vào

- POST /api/tutor — {question,reveal}; {answer,hints,sources}.
- PUT /api/tutor — admin tạo index, {indexed}; thiếu index 503; giới hạn tần suất 429.

tutor_chunks + pgvector (migration 002); mô hình embedding openai/text-embedding-3-small; chưa có queue riêng cho indexing.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
