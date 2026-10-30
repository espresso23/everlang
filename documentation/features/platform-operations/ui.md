# UI — platform-operations

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

Project tracking không có route app: [planning dashboard](../../planning/DASHBOARD.md) và [task board](../../planning/TASK_BOARD.md) đọc dưới Markdown/Git, CSV mở Excel để lọc. Chỉ sửa work-items.json rồi plan:sync; không sửa view xuất ra, không tạo màn hình product hoặc page trong app.

Không có trang quản trị hạ tầng. Mailpit chỉ có giao diện local :8025 khi bật profile local; Caddy profile production; browser screens được liệt kê ở shared/screens.md.

## Luồng UI ↔ dữ liệu

Browser → Next → API guard/services → SQL/Mongo/Redis/providers; Docker migrations → app/worker; Caddy → app

## Trạng thái và giới hạn

Local Mailpit không chuyển email tới Gmail. Production cần SMTP/domain/HTTPS thật. Tên ảnh worker vẫn chứa dependencies development; chưa tối ưu kích thước image. docs:check chỉ là kiểm tra cấu trúc.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.
