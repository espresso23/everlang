# Function description — learning-records

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/api/drafts/route.ts](../../../app/api/drafts/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/drafts/route.ts](../../../app/api/drafts/route.ts) · `PUT` | `export const PUT` | Handler `PUT`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/submissions/route.ts](../../../app/api/submissions/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/user/favorites/route.ts](../../../app/api/user/favorites/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/user/favorites/route.ts](../../../app/api/user/favorites/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/user/stats/route.ts](../../../app/api/user/stats/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/learning/submissions.ts](../../../lib/learning/submissions.ts) · `reportView` | `export function reportView(row: StoredSubmission)` | Đổi row SQL sang contract báo cáo client và metadata phiên bản. |
| [lib/learning/submissions.ts](../../../lib/learning/submissions.ts) · `statistics` | `export async function statistics(userId: string)` | Chọn report completed mới nhất mỗi câu, tổng hợp điểm/chủ đề yếu. |
| [lib/models/Submission.ts](../../../lib/models/Submission.ts) · `Submission` | `export const Submission` | Component/type `Submission` thuộc luồng nháp, lịch sử, yêu thích và thống kê; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [lib/models/UserSentenceState.ts](../../../lib/models/UserSentenceState.ts) · `UserSentenceState` | `export const UserSentenceState` | Component/type `UserSentenceState` thuộc luồng nháp, lịch sử, yêu thích và thống kê; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [scripts/import-legacy.ts](../../../scripts/import-legacy.ts) | Cấu hình/schema/asset/script | drafts, favorites, submissions, legacy_imports. Hai model Mongo cũ chỉ phục vụ di sản, API hiện hành dùng SQL. |

## Input, output và lỗi theo điểm vào

- GET/PUT /api/drafts — {sentenceId,text,version}; PUT trả version mới hoặc 409.
- GET /api/submissions — sentenceId tùy chọn; {submission} hoặc {submissions}.
- GET/POST /api/user/favorites — {favorites}; mutation {sentenceId,favorite}.
- GET /api/user/stats — totalCompleted,averageScore,weakTopics.

drafts, favorites, submissions, legacy_imports. Hai model Mongo cũ chỉ phục vụ di sản, API hiện hành dùng SQL.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
