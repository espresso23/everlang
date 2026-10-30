# UI — ai-tutor

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

Tab tutor của /library; form question, hints/answer, reveal, sources, busy/error; Admin AdvancedTools kích hoạt index.

## Luồng UI ↔ dữ liệu

Library Tutor → POST tutor → embed → pgvector nearest chunks → generateJson → answer/hints/sources

## Trạng thái và giới hạn

Chưa kiểm chứng indexing/retrieval/grounding qua dịch vụ thật. Citation trả từ retrieval, không phải kiểm định mọi câu AI đều được nguồn hỗ trợ.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.
