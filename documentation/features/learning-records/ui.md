# UI — learning-records

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

History/favorites/report trong /practice; profile có xác nhận nhập nháp local. Chưa có trang history độc lập.

## Luồng UI ↔ dữ liệu

Practice/Profile → API cá nhân → SQL ownership/version → history/stats/UI; CLI riêng đọc legacy Mongo → SQL

## Trạng thái và giới hạn

Import lịch sử thật chưa thực hiện vì phải đối chiếu UUID và tài khoản đã xác minh. Fixture từng kiểm tra import lần đầu 1, lần lặp 0.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.
