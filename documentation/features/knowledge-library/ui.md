# UI — implemented, QA pending

Thêm `/knowledge`, link từ library hiện hữu; không đổi wireframe các route khác. Dùng paper/surface/ink/Cobalt và Inter theo design guide; Hangul sentence case, dòng đọc thoáng. Mobile một cột, không fixed height/clipped text.

Danh sách: search có label, filter type/level/topic, loading/error/retry/empty rõ. Chi tiết: mục lục sections, ví dụ song ngữ, nghe TTS, related links; bookmark/note/reading progress tách bài tập; back giữ filter. Không autosave từng phím gây đè note nhiều thiết bị; Save explicit, 409 giữ local note và cho tải bản mới với confirm.

MCQ fieldset/radio, cloze input, submit pending, kết quả/correct answer sau submit; chọn/nhập trước rồi mới lộ feedback. Nút lưu SRS có thông báo duplicate. Section resume qua nút chủ động và fallback khi section biến mất. Admin dùng editor trường nội dung + section/example/question, không yêu cầu người dùng sửa JSON.

User profile cá nhân, legacy dashboard/nav còn giữ layout. Admin link có tại trang authoring hiện có. Nội dung draft seed chỉ admin thấy cho tới owner review/publish.

Browse có Sổ đọc của bạn (bookmark/vị trí đã lưu). Audio TTS chỉ chạy khi thiết bị có giọng ko; thiếu giọng hiện hướng dẫn thay vì im lặng. Editor có trả reviewed chưa publish về nháp; dữ liệu lỗi/stale không tự ghi đè.

Related và sổ đọc hiển thị tiêu đề, không slug nội bộ. Editor chọn related từ tài liệu published; API chặn missing/self reference. Dirty guard hiện có ở link về thư viện/related và beforeunload; điều hướng SPA toàn app chưa có guard chung, cần kiểm/cải thiện trước final gate.

## 2026-10-31 — Kho hệ thống và lưu cá nhân

Phần mô tả tại /knowledge và /word-sets ghi rõ học liệu tiếng Hàn hệ thống và sổ đọc/kho ôn tập cá nhân. Giữ bố cục/tokens và các nút xem/lưu hiện có; nội dung chưa published vẫn không xuất hiện ở learner. [Audit tích hợp](../../audits/system-library-worker-errors.md).


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.
