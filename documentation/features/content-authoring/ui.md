# UI — content-authoring

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/admin: form content, list/status/version, AI draft, Tutor indexing, nhập JSON đề. Chặn quyền nằm ở API; baseline còn hiện khung form cho learner khi họ mở trực tiếp URL, nhưng mutation bị 403.

## Luồng UI ↔ dữ liệu

Admin form/AI draft → api(admin) → Mongo Sentence → review → publish → học viên đọc published

## Trạng thái và giới hạn

Cần audit nguồn/quyền học liệu trước phát hành rộng. Một trang tạo index có thể gọi provider nhiều lần; chưa có batching UI.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).
