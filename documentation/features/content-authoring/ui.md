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


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.

EW UI: library table before existing editor, compact rows with title/status/version, 25/50/100 page size, literal search/status/level/topic/sort, previous/next editor within filtered page. Empty/loading/error retry, local filters preserved in URL. Table scrolls internally on320/390; page has no horizontal overflow. Source/rights batch and JSON import collapsed in details to avoid clutter. Preview native dialog labels saved version, hides answers until explicit reveal/check, clearly does not save practice state; keyboard Escape returns focus to invoker. Publish disabled unless reviewed, version conflicts remain visible in dialog; cancel unchanged. Preview only saved content; unsaved editor must be saved before it is represented.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Admin](../../../apps/web/app/admin/page.tsx), [KnowledgeAdmin](../../../apps/web/app/admin/knowledge/page.tsx) và [EditorialDesk](../../../apps/web/components/editorial-desk.tsx): `choose`, `open`, `importDrafts`, `batch`. Đổi editor, duyệt knowledge, import và batch dùng dialog; onSelect cho phép Promise, active item chỉ đổi sau chấp thuận. Bỏ native beforeunload trong knowledge editor.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
