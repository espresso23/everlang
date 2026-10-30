# Function description — immersive-learning

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/library/page.tsx](../../../app/library/page.tsx) · `Library` | `export default function Library()` | Component/type `Library` thuộc luồng đọc, nghe và luyện nói; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/library/page.tsx](../../../app/library/page.tsx) · `record` | `async function record()` | Hàm/binding `record` phục vụ đọc, nghe và luyện nói; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/library/page.tsx](../../../app/library/page.tsx) · `send` | `async function send()` | Hàm/binding `send` phục vụ đọc, nghe và luyện nói; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [data/reading-lessons.ts](../../../data/reading-lessons.ts) · `readingLessons` | `export const readingLessons` | Hàm/binding `readingLessons` phục vụ đọc, nghe và luyện nói; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/recordings/route.ts](../../../app/api/recordings/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/recordings/route.ts](../../../app/api/recordings/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/media.ts](../../../lib/media.ts) · `mediaConfigured` | `() ` | Kiểm tra biến bucket/access key/secret đã có, không chứng minh dịch vụ hoạt động. |
| [lib/media.ts](../../../lib/media.ts) · `storage` | `function storage()` | Hàm/binding `storage` phục vụ đọc, nghe và luyện nói; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/media.ts](../../../lib/media.ts) · `saveAudio` | `export async function saveAudio(key: string, bytes: Buffer)` | PUT audio/webm tới bucket cấu hình, key theo user và recording. |
| [lib/media.ts](../../../lib/media.ts) · `audioUrl` | `export async function audioUrl(key: string)` | Sinh signed GET URL hạn 300 giây sau khi API đã kiểm ownership. |

## Input, output và lỗi theo điểm vào

- GET /api/recordings[?id=...] — configured/history hoặc signed URL của chủ tài khoản.
- POST /api/recordings — {audio,consent:true}; thiếu config 503, audio không hợp lệ 400/413, không nhận dạng 422.

readingLessons là nội dung code; recordings SQL lưu transcript/feedback/object key; audio ở S3. API audio tối đa 3MB, base64 tối đa 4.2 triệu ký tự.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
