# Kho học liệu và kiểm duyệt

- Feature ID: `content-authoring`
- Trạng thái hiện thực: `implemented`; snapshot 2026-10-30, baseline `1d0fbad`.
- Phân biệt code hiện có với kết quả xác minh trong [audit](audit.md); không phải chứng nhận toàn bộ feature hoàn tất.

## Yêu cầu và traceability

| ID | Hành vi hiện tại/tiêu chí | Tham chiếu hiện thực | Xác minh |
|---|---|---|---|
| content-authoring-REQ-01 | Seed 100 bài idempotent và bổ sung metadata language/skill/contentVersion/status cho legacy. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| content-authoring-REQ-02 | Admin biên soạn hoặc AI tạo draft; chỉ draft được review, reviewed mới publish khi có source/rights. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| content-authoring-REQ-03 | Bài published bất biến; thay đổi nội dung phải tạo draft mới. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |
| content-authoring-REQ-04 | Mutation version cũ trả 409; learner không được dùng admin API. | [Code/functions](functions.md), [UI](ui.md) | [Audit](audit.md) |

## Hợp đồng hiện có

- GET/POST/PATCH /api/admin/content — list/create/generate/review/publish/edit; admin only.
- POST /api/sentences/generate — endpoint cũ, admin nhận 410 để dùng workflow mới.

## Tài liệu chuẩn

- [System design](system-design.md) · [Function description](functions.md) · [UI](ui.md) · [Audit](audit.md).
- [Kiến trúc toàn hệ thống](../../shared/architecture.md) · [Tech stack](../../shared/tech-stack.md) · [Màn hình](../../shared/screens.md).

## Giới hạn và việc còn lại

Cần audit nguồn/quyền học liệu trước phát hành rộng. Một trang tạo index có thể gọi provider nhiều lần; chưa có batching UI.

## Admin workspace — quyết định 2026-11-01 (đặc tả trước code, hiện implemented local)

Owner chọn admin đăng nhập mặc định vào Quản trị, có chuyển Học tập. PB-042-T01 là increment riêng, không thay yêu cầu duyệt học liệu của #1.

- AW-01: email/Google login thành công điều hướng admin tới /admin/overview, learner tới /. Google linking tại profile giữ callback hiện tại.
- AW-02: /admin/* có nhãn Quản trị và menu Tổng quan, Bài luyện, Kiến thức, Bộ từ; active route rõ, chuyển Học tập/Quản trị, responsive và keyboard. Giữ Editorial tokens.
- AW-03: chưa xác định session chỉ loading/error; learner mở admin không render editor hoặc gọi API admin. API vẫn kiểm quyền server.
- AW-04: tổng quan chỉ dẫn tới các module có thật, không hiển thị thống kê giả; refresh/deep link/back và chuyển chế độ không lặp redirect.

Non-goals: user management, analytics, thay workflow review/publish, schema/DB/provider. AC: E2E admin login→overview→3editor→study→admin, learner denial, loading/error, Google callback landing contract, desktop1440/mobile390/320; ảnh và audit. Live Google cần owner test, không dùng mock để chứng nhận OAuth upstream.

## Editorial workbench EW-01–05 — agreed2026-11-01, specified before code; now implemented

Owner chọn tự build EverLang từ research, thêm preview student trước publish; kiểm tra rồi merge main và chuyển phiên. Không tích hợp CMS ngoài. Increment PB-043-T01 kết nối API/PG/UI cùng các editors có sẵn.

- EW-01: cả3admin có server pagination25/50/100, total, query/status/level/topic/sort; lọc cả kho trước phân trang, thứ tự ổn định. Giữ query trong URL, revision hiển thị rõ, không giả nhóm revisions.
- EW-02: bảng compact → mở editor hiện hành, previous/next trong trang lọc; guard unsaved. Batch metadata source/rights cho draft với explicitID+version, CAS, kết quả từng mục và retryfailed. Không auto-review/publish bulk.
- EW-03: JSON import tối đa50draft/lần, dry-run schema từng dòng trước confirm, không import khi lỗi; server vẫn validate, duplicate/conflict báo từng dòng, không ghi đè. Không gọi AI; CSV nested content không thuộc slice vì không có agreed mapping.
- EW-04: preview student trước publish trên saved exactversion: nội dung/sections/examples, câu hỏi ẩn đáp án trước thao tác, sentence mẫu reveal, set resolve pinned sense đúng revision. Không ghi progress/attempt/SRS; preview không xuất bản. Cancel không mutate. Publish qua service hiện hành vẫn check quyền/CAS/status; nội dung đổi phải preview lại.
- EW-05: realPG >200fixtures/filter/page boundary/ownership/CAS, browser preview/cancel/publish/filter/bulk partial errors/mobile/keyboard. Review riêng rồi merge/push theo owner; không chứng nhận language quality/Google live chỉ từ fixtures.

Non-goals: taxonomy/schema mới, CMSintegration, users/analytics, đổiFSRS/media/provider. Publication source/history invariant giữ nguyên. Database migration N/A.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Admin](../../../apps/web/app/admin/page.tsx), [KnowledgeAdmin](../../../apps/web/app/admin/knowledge/page.tsx) và [EditorialDesk](../../../apps/web/components/editorial-desk.tsx): `choose`, `open`, `importDrafts`, `batch`. Đổi editor, duyệt knowledge, import và batch dùng dialog; onSelect cho phép Promise, active item chỉ đổi sau chấp thuận. Bỏ native beforeunload trong knowledge editor.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
