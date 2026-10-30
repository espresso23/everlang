# Trợ giảng truy xuất học liệu

- Feature ID: `ai-tutor`
- Trạng thái hiện thực: `blocked`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| ai-tutor-REQ-01 | Admin lập chỉ mục tối đa 100 bài published, id theo content/version; không index lại id đã có. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| ai-tutor-REQ-02 | Embedding 1536 chiều qua OpenRouter; retrieval pgvector 4 đoạn. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| ai-tutor-REQ-03 | Câu hỏi mặc định nhận hints trước; reveal=true mới yêu cầu giải thích đầy đủ. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| ai-tutor-REQ-04 | Chỉ dẫn phân biệt câu hỏi/học liệu là dữ liệu; trả nguồn học liệu đi kèm. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- POST /api/tutor — {question,reveal}; {answer,hints,sources}.
- PUT /api/tutor — admin tạo index, {indexed}; thiếu index 503; giới hạn tần suất 429.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Chưa kiểm chứng indexing/retrieval/grounding qua dịch vụ thật. Citation trả từ retrieval, không phải kiểm định mọi câu AI đều được nguồn hỗ trợ.
