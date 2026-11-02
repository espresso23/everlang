# Thư viện kiến thức — đặc tả triển khai

Feature ID `knowledge-library`. Trạng thái **implemented, NOT VERIFIED** trước integration audit, branch `feature/self-study-library`, ngày 2026-10-31. Thuộc mục tiêu tự học, không thay module luyện dịch/nghe đã có.

## Yêu cầu

- KL-01: tìm kiếm Hàn–Việt, lọc loại/chủ đề/level, danh sách published mới nhất mỗi key. Loại grammar/idiom/proverb/hanja/collocation/phonetics/article; draft không rò sang learner.
- KL-02: đọc HTML text có sections/anchor, ví dụ song ngữ, điều kiện dùng và cảnh báo lỗi, nội dung liên quan; nghe TTS có nhãn và fallback. TTS không được gọi audio người bản ngữ đã duyệt.
- KL-03: bookmark, ghi chú, vị trí đọc và đánh dấu đã đọc theo tài khoản PostgreSQL, optimistic concurrency; đọc không đồng nghĩa mastery. Lỗi lưu giữ nguyên dữ liệu và cho tải bản mới sau xác nhận.
- KL-04: bài MCQ/cloze được chấm server, chỉ trả đáp án/giải thích sau submit; attempt lưu snapshot và idempotent theo user/requestId, không trả điểm giả khi lỗi database.
- KL-05: lưu mẫu + nghĩa/ngữ cảnh/source vào SRS hiện có, không reset lịch. Phase này vẫn giữ uniqueness legacy term/kind; đa nghĩa cần migration riêng trước bộ từ curated.
- KL-06: admin tạo/sửa draft, review, publish, clone revision; nội dung published bất biến, revision mới không xóa lịch sử. Review do owner thực hiện; seed tự biên soạn **draft**, không tự duyệt ground truth.

Nguồn code sẽ ánh xạ theo [functions](functions.md); [UI](ui.md), [system design](system-design.md), [audit](audit.md). Không đánh dấu Done trước audit runtime và duyệt content.

## 2026-10-31 — Kho hệ thống và lưu cá nhân

Kho từ và tài liệu ngữ pháp thuộc hệ thống, dùng chung theo ngôn ngữ; bản đã published cho mọi tài khoản verified xem/lưu. Beta chỉ có tiếng Hàn (ko); không tự xuất bản draft. [Audit tích hợp](../../audits/system-library-worker-errors.md).


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Reader](../../../apps/web/app/knowledge/page.tsx): `reloadState`, back và related links. Tải ghi chú mới nhất/đi sang bài khác cần xác nhận khi dirty; hủy giữ note. Bỏ native beforeunload; đóng tab/reload không có guard tùy chỉnh.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
