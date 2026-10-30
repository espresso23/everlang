# Function description — content-authoring

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/admin/page.tsx](../../../app/admin/page.tsx) · `Admin` | `export default function Admin()` | Component/type `Admin` thuộc luồng kho học liệu và kiểm duyệt; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/admin/page.tsx](../../../app/admin/page.tsx) · `transition` | `async function transition(c: Content, action: string)` | Hàm/binding `transition` phục vụ kho học liệu và kiểm duyệt; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/admin/page.tsx](../../../app/admin/page.tsx) · `AdvancedTools` | `function AdvancedTools(` | Component/type `AdvancedTools` thuộc luồng kho học liệu và kiểm duyệt; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/api/admin/content/route.ts](../../../app/api/admin/content/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/admin/content/route.ts](../../../app/api/admin/content/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/admin/content/route.ts](../../../app/api/admin/content/route.ts) · `PATCH` | `export const PATCH` | Handler `PATCH`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/sentences/generate/route.ts](../../../app/api/sentences/generate/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/models/Sentence.ts](../../../lib/models/Sentence.ts) · `Sentence` | `export const Sentence` | Component/type `Sentence` thuộc luồng kho học liệu và kiểm duyệt; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [lib/content.ts](../../../lib/content.ts) · `initializeContent` | `async function initializeContent()` | Bổ sung metadata legacy và upsert seed bằng sourceId. |
| [lib/content.ts](../../../lib/content.ts) · `publishedSentence` | `export async function publishedSentence(id: string)` | Validate ObjectId rồi đọc đúng bài published, trả snapshot JSON-friendly. |
| [lib/content.ts](../../../lib/content.ts) · `ensureContent` | `export function ensureContent()` | Cache initialization seed, reset promise khi lỗi để có thể thử lại. |
| [data/seed-sentences.json](../../../data/seed-sentences.json) | Cấu hình/schema/asset/script | Mongo Sentence; nguồn và quyền dùng được ghi thành text, chưa xác minh pháp lý tự động. contentReady chỉ cache quá trình seed trong process. |
| [scripts/extract-seed.py](../../../scripts/extract-seed.py) | Cấu hình/schema/asset/script | Mongo Sentence; nguồn và quyền dùng được ghi thành text, chưa xác minh pháp lý tự động. contentReady chỉ cache quá trình seed trong process. |

## Input, output và lỗi theo điểm vào

- GET/POST/PATCH /api/admin/content — list/create/generate/review/publish/edit; admin only.
- POST /api/sentences/generate — endpoint cũ, admin nhận 410 để dùng workflow mới.

Mongo Sentence; nguồn và quyền dùng được ghi thành text, chưa xác minh pháp lý tự động. contentReady chỉ cache quá trình seed trong process.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
