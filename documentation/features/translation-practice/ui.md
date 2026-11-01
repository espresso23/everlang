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

## Audio mẫu — 2026-10-31

Play icon44px có accessible name/tooltip; khi phát chuyển pause, khi tạm dừng có thể tiếp tục. Thanh tiến trình theo vị trí chữ và đồng hồ mm:ss đã phát, không bịa tổng thời lượng. Thanh chỉ hiển thị, không kéo tua. Có loading/error, phát lại reset; đổi câu/unmount dừng audio. Tokens Editorial, wrap ở320px. [Hợp đồng](../../shared/sample-audio-player.md).

## 2026-10-31 — Hoàn thiện Nghe câu

Play/pause icon44px thay text Nghe câu và Nghe câu đầu tiên; player compact210px cho các câu lặp lại. Tên/tooltip riêng từng câu, progress+mm:ss đã phát, loading spinner/aria-busy/live status, lỗi cạnh control. Đổi câu dừng player trước kể cả không nhận canceled event; đổi bài/tab reset audio; tab aria-pressed và lesson aria-current. Giữ lưới/sidebar/nội dung/đường lưu-tra từ. [Player contract](../../shared/sample-audio-player.md), [audit](../../audits/sentence-audio-controls.md).

## 2026-10-31 — Retry failed grading

Khi lần chấm cũ thất bại hoặc worker trả failed, alert hiển thị lý do và nút Chấm lại bằng AI; không cần mở report modal vốn không tồn tại khi chấm thất bại. Không tự gọi AI lại. Click explicit giữ textarea, đổi requestId/forceRegrade, khóa submit trong lúc chờ. Mã log vẫn hiển thị qua API helper; đóng alert vẫn giữ nháp. Giữ layout/tokens Editorial. [Audit](../../audits/grading-retry.md).
