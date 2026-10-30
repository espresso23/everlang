# UI — translation-practice

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/practice: list/card, filters, pending grading, saved report modal, dictionary popup, history/favorites, empty/error. Components SourceText/AnswerInput/ExerciseCard/GradeModal/DictionarySelectionLookup dùng chung trong file practice.

## Luồng UI ↔ dữ liệu

Practice → /api/sentences MongoDB → nháp SQL → grade/job → báo cáo/UI → lưu kiến thức vào SRS

## Trạng thái và giới hạn

Limit hiện tối đa 50, API lịch sử tối đa 200; chưa có server pagination toàn bộ lịch sử. Nút lưu kiến thức mở trang kho từ với dữ liệu điền sẵn, người dùng vẫn phải lưu thẻ.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Ảnh QA 2026-10-30, viewport 1440×1000: [màn hình learner](assets/screen-learner-desktop.png). Đây là bằng chứng render màn hình, không thay audit mọi thao tác/provider.

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.
