# UI — ai-grading

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/practice: pending, hoàn tất modal score/comment/errors/suggestions/3 rewrites; phục hồi polling từ pending job theo tài khoản; lỗi không xóa nháp.

## Luồng UI ↔ dữ liệu

POST grade → SQL queued → BullMQ → worker → OpenRouter → validate JSON → SQL completed/failed → GET jobs → GradeModal

## Trạng thái và giới hạn

Đã có smoke OpenRouter thật trong audit trước, không thay bộ chuẩn do người chấm. Cần kiểm định sư phạm và drift model; provider 401/429/5xx không được giả thành điểm hợp lệ.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.

## 2026-10-31 — Worker/exception contract

Không thêm màn hình hoặc đổi layout. Trạng thái job queued/active/completed/failed qua API hiện có; lỗi cuối trả thông báo provider-safe và giữ nháp. Fatal process errors là log vận hành, không đưa stack/connection vào UI. [Chuẩn dùng chung](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).

## 2026-10-31 — Retry failed grading

Khi lần chấm cũ thất bại hoặc worker trả failed, alert hiển thị lý do và nút Chấm lại bằng AI; không cần mở report modal vốn không tồn tại khi chấm thất bại. Không tự gọi AI lại. Click explicit giữ textarea, đổi requestId/forceRegrade, khóa submit trong lúc chờ. Mã log vẫn hiển thị qua API helper; đóng alert vẫn giữ nháp. Giữ layout/tokens Editorial. [Audit](../../audits/grading-retry.md).
