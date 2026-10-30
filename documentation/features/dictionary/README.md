# Tra cứu từ điển tiếng Hàn

- Feature ID: `dictionary`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| dictionary-REQ-01 | Chỉ người đăng nhập được tra; query tiếng Hàn tối đa 48 ký tự. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| dictionary-REQ-02 | Tra word/idiom KRdict; fallback tách token/bỏ tiểu từ đơn giản khi không có kết quả. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| dictionary-REQ-03 | Chuẩn hóa XML, giới hạn 12 mục và cache Redis 3600 giây. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| dictionary-REQ-04 | Thiếu key trả configured:false; lỗi upstream trả 502, không giả nghĩa từ. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET /api/dictionary?q=... — {configured,items}; KRdict key chỉ server.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Chưa xác minh chất lượng mọi dạng chia động từ; fallback không phải Mecab/KoNLPy. TTS dùng trình duyệt, không đảm bảo có giọng ko-KR.
