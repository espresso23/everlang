# UI — dictionary

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

Popup trong /practice và /library qua DictionarySelectionLookup, DictionaryResultCard/useLookup (module thuộc translation-practice). Có configured/empty/error/loading.

## Luồng UI ↔ dữ liệu

Bấm/chọn tiếng Hàn → DictionarySelectionLookup → /api/dictionary → Redis/KRdict → popup + TTS/link

## Trạng thái và giới hạn

Chưa xác minh chất lượng mọi dạng chia động từ; fallback không phải Mecab/KoNLPy. TTS dùng trình duyệt, không đảm bảo có giọng ko-KR.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.

## 2026-11-01 — Native request URL correction

DictionaryService uses the shared queryParams(Request) helper for Express originalUrl. A relative /api/dictionary?q=학교 no longer triggers Invalid URL; invalid input400 and unconfigured provider200/configured:false remain. Unit relative-URL/invalid-query regression and native authenticated request cover the boundary; provider quality limits unchanged.
