# UI — immersive-learning

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/library có read/listen/speak/tutor tabs. Speak có audio local, checkbox consent, busy/error/transcript/feedback; chưa có UI duyệt toàn bộ recording history đã lưu.

## Luồng UI ↔ dữ liệu

Library tab → local TTS/MediaRecorder hoặc POST recordings → Google STT → AI góp ý → S3 + SQL → UI

## Trạng thái và giới hạn

Google STT/S3 và microphone/TTS thiết bị thật chưa kiểm chứng toàn bộ. Không có điểm phát âm; chưa có audio người bản ngữ hoặc bản đồ từ đồng bộ transcript.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Ảnh QA 2026-10-30, viewport 1440×1000: [màn hình learner](assets/screen-learner-desktop.png). Đây là bằng chứng render màn hình, không thay audit mọi thao tác/provider.

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.
