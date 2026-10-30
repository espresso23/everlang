# Function description — exam-practice

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/exams/page.tsx](../../../app/exams/page.tsx) · `Exams` | `export default function Exams()` | Component/type `Exams` thuộc luồng bài luyện topik ii pbt; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [app/api/exams/route.ts](../../../app/api/exams/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/exams/route.ts](../../../app/api/exams/route.ts) · `POST` | `export const POST` | Handler `POST`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/exams/route.ts](../../../app/api/exams/route.ts) · `PATCH` | `export const PATCH` | Handler `PATCH`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/exams/route.ts](../../../app/api/exams/route.ts) · `PUT` | `export const PUT` | Handler `PUT`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/exams.ts](../../../lib/exams.ts) · `questionSchema` | `export const questionSchema` | Hàm/binding `questionSchema` phục vụ bài luyện topik ii pbt; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/exams.ts](../../../lib/exams.ts) · `examSchema` | `export const examSchema` | Hàm/binding `examSchema` phục vụ bài luyện topik ii pbt; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [lib/exams.ts](../../../lib/exams.ts) · `publicExam` | `export function publicExam(e: Exam)` | Loại answer/explanation khỏi snapshot gửi client trước nộp. |
| [lib/exams.ts](../../../lib/exams.ts) · `scoreExam` | `export function scoreExam(e: Exam, answers: Record<string, string>)` | Chấm objective bằng đáp án; tạo trạng thái Writing queued/none, không chấm thay AI. |
| [lib/models/Exam.ts](../../../lib/models/Exam.ts) · `ExamModel` | `export const ExamModel` | Component/type `ExamModel` thuộc luồng bài luyện topik ii pbt; hành vi và trạng thái UI ở [ui.md](ui.md). |

## Input, output và lỗi theo điểm vào

- GET /api/exams[?attempt=...] — list/history hoặc owned attempt.
- POST /api/exams — {examId}; {id}; PATCH — {id,version,answers,submit}.
- PUT /api/exams — admin nhập examSchema có source/rights.

Đề trong Mongo ExamModel; exam_attempts SQL; index unique partial ở migration003. Khi hết deadline, server giữ câu trả lời đã lưu thay vì nhận chỉnh sửa muộn.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
