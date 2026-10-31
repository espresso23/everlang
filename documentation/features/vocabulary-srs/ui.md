# UI — vocabulary-srs

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/vocabulary: thêm/sửa/dừng thẻ; ?review=true vào ôn; hiện đáp án rồi chọn mức nhớ; empty/loading/message.

## Luồng UI ↔ dữ liệu

Kho từ/review UI → API → SQL row lock/version → FSRS review → card/review_logs commit → refresh UI/dashboard

## Trạng thái và giới hạn

Chưa có optimizer cá nhân hóa từ lịch sử dài hạn; dùng preset FSRS-7.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Ảnh QA 2026-10-30, viewport 1440×1000: [màn hình learner](assets/screen-learner-desktop.png). Đây là bằng chứng render màn hình, không thay audit mọi thao tác/provider.

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.

/vocabulary thêm Link /word-sets, giữ lưới/kho từ/ôn cũ. Từ nhiều nghĩa hiển thị thành thẻ riêng, cùng term nhưng meaning/context khác và id riêng. Không tự merge manual card; người học chọn link trong catalogue. [UI mới](../vocabulary-catalog/ui.md).

Recall gate trước code: catalogue snapshot có ví dụ Hàn–Việt; trước “Hiện nghĩa” chỉ hiện phần Hàn của context do catalogue tạo, dịch Việt xuất hiện sau reveal. Context cá nhân tùy chỉnh giữ nguyên, không tự phân loại ngôn ngữ. Lưu mới contextKO; snapshot giữ cả KO/VI và helper hỗ trợ thẻ tạo bằng formatKO+VI cũ. Audio SRS dùng chung playKorean có error/cancel feedback thay vì silent fallback; cancel là hành vi dừng, không lỗi. Không thay layout/rating/FSRS.
