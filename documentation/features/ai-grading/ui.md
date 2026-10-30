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

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
