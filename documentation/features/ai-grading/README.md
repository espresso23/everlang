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

## 2026-10-31 — Retry failed grading

Failed duplicate không phải lỗi gateway mới: POST grade trả409/code GRADING_PREVIOUS_FAILED, giữ draft/attempt cũ và không tự enqueue. Người học có nút Chấm lại bằng AI ngay trong error alert; click explicit tạo lượt mới bằng forceRegrade/requestId mới. [Audit](../../audits/grading-retry.md).

## 2026-11-01 — New click after a failed attempt

A new ordinary POST grade request no longer stops at the old base failed dedup row. The service preserves that history and resolves a separate requestId-keyed attempt, returning202/queue. Replaying the same UUID resolves the same attempt (including409 if that exact retry has failed); a new button click has a new UUID. Completed base reports still return200 cached:true, explicit forceRegrade still works. No automatic new attempt from polling/process recovery and no infinite retry loop. Dedup/error state is durable PostgreSQL data, not in-memory response cache. Implementation: SubmissionsGradeService.post; tests/unit/grading-retry.test.ts and native nest-auth E2E. This supersedes the earlier always409-on-base-failed behavior.

Original request UUID is retained in snapshot.gradingRequestId to distinguish a new click from replay of that original failed request. reportView strips it from returned report sentence. Legacy snapshots without this optional marker remain readable.
