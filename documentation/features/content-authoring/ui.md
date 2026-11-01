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

[Design system](../design-system/README.md): logo e, paper/ink/Cobalt, Inter Variable, viền mảnh, không bóng nổi. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.

## Tích hợp 2026-10-31

Trang /admin thêm link tới [editor kiến thức](../knowledge-library/ui.md) tại /admin/knowledge. Workflow Sentence cũ giữ nguyên; knowledge dùng model/contract riêng có canonical docs, không tự publish seed.

/admin thêm Link /admin/word-sets cho biên tập sense/set; giữ bảng translation cũ. Quy trình/phân quyền ở [catalog](../vocabulary-catalog/README.md).

## Admin workspace — AW implemented local 2026-11-01

Thay đổi layout được owner yêu cầu rõ. Header có nhãn Quản trị, nút Học tập trong admin / nút Quản trị khi admin học. Menu admin ngang wrap trên mobile: Tổng quan (/admin/overview), Bài luyện (/admin), Kiến thức (/admin/knowledge), Bộ từ (/admin/word-sets). Tổng quan có heading và 3 module link thật. Learner direct link thấy Không có quyền quản trị và về học tập; không lóe form. Pending/error giữ thông báo + retry trước quyền. Không sidebar mới/theme song song. Existing editors giữ layout.

Header admin cho phép wrap khi không đủ chỗ (320px), giữ nút chuyển chế độ và không tràn ngang; header learner giữ bố cục hiện hành.
