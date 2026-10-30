# Kho từ và lặp lại ngắt quãng

- Feature ID: `vocabulary-srs`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| vocabulary-srs-REQ-01 | Lưu word/phrase/grammar cùng nghĩa, ngữ cảnh, ghi chú và nguồn; chống trùng user/term/kind. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| vocabulary-srs-REQ-02 | FSRS-7 qua ts-fsrs@6.0.0, retention 0.9; lưu card và revlog. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| vocabulary-srs-REQ-03 | Bốn mức Again/Hard/Good/Easy; chỉ ôn thẻ đến hạn, không suspended. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| vocabulary-srs-REQ-04 | Review có transaction, row lock, version và requestId; nhiều tab không ghi đè. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/vocabulary?due=true — {items,dueCount}, tối đa 500.
- POST/PUT /api/vocabulary — term,meaning,context,note,kind,sourceId; PUT thêm id/version/suspended.
- POST /api/reviews — {id,rating:1..4,version,requestId}; 404 ownership, 409 stale/due.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Chưa có optimizer cá nhân hóa từ lịch sử dài hạn; dùng preset FSRS-7.
