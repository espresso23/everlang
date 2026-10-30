# UI — exam-practice

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/exams: list/history, attempt timer, radio/audio/textarea, submit confirmation, objective/writing result. Seed duy nhất là mini Đọc/Viết tự biên soạn.

## Luồng UI ↔ dữ liệu

Exam list → start SQL attempt → autosave → server deadline/submit → scoreExam → writing queue → result UI

## Trạng thái và giới hạn

Chưa có kho đề đầy đủ có quyền sử dụng, chưa chia phiên PBT hoàn chỉnh, không quy đổi điểm thành chứng chỉ. Không triển khai TOPIK Speaking/IBT/IELTS/HSK/JLPT.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
