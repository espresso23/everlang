# Chấm AI bất đồng bộ

- Feature ID: `ai-grading`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| ai-grading-REQ-01 | Snapshot đề, model, prompt/rubric version và báo cáo Zod hợp lệ được giữ cùng bài làm. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| ai-grading-REQ-02 | Request trùng dùng dedup_key; thay dấu câu không tạo lượt thường mới; forceRegrade gắn requestId mới. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| ai-grading-REQ-03 | Lỗi chỉ ra phải trích tiếng Hàn từ bài; bỏ sửa chỉ khác dấu câu; xếp loại tính lại theo score. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| ai-grading-REQ-04 | Worker retry 3 lần exponential, đối soát queued/active từ SQL mỗi 30 giây. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- POST /api/submissions/grade — {sentenceId,userTranslation,requestId,forceRegrade}; cached report 200 hoặc {jobId,status} 202.
- GET /api/jobs?id=... — {status,error,report}; chủ khác 404.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Đã có smoke OpenRouter thật trong audit trước, không thay bộ chuẩn do người chấm. Cần kiểm định sư phạm và drift model; provider 401/429/5xx không được giả thành điểm hợp lệ.

## 2026-10-31 — Worker/exception contract

Dùng exception/logging contract chuẩn và xử lý retry/cooldown/recovery có giới hạn; không giả điểm hoặc bỏ lỗi để tiếp tục process hỏng. [Chuẩn dùng chung](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).
