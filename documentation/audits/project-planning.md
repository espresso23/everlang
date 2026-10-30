# Audit — WBS, product backlog và sprint tracking

2026-10-31, docs/self-study-wbs-sprints, baseline4eb249c. Đây là công cụ/tài liệu quản trị nội bộ thuộc platform-operations; không triển khai các feature sản phẩm trong backlog.

## Đối chiếu yêu cầu

| Phạm vi | Kết quả | Bằng chứng |
|---|---|---|
| WBS theo deliverable và task | PASS | [WBS](../planning/WBS.md),14 domain baseline tách khỏi33 PBI/72 task mới |
| Product backlog theo ưu tiên | PASS review | P0/P1/P2, Core/Stretch/Deferred, dependencies và acceptance;9 PBI sau beta không bị ép estimate hoặc gán task giả |
| Sprint plan cho solo | PASS review, Proposed |6 sprint2 tuần đề xuất; owner Chủ dự án, review tiếng Hàn đã xác nhận, giờ/tuần/date/capacity TBD. Content không tính như người thứ hai |
| Nguồn trạng thái duy nhất | PASS | work-items.json→validatePlanning→buildViews→7 MD/CSV views; plan:check phát hiện drift, plan:sync tái sinh |
| State/dependency/evidence gates | PASS |8 unit tests planning: Done thiếu evidence/Pass, upstream chưa Done, cycle, Core phụ thuộc Stretch, overcommit, derived full/partial completion |
| Release milestones | PASS review | M1→M2, M3 sauM2, M4 cầnM2 và release tasks. Chỉ Ready for PO review; không tự phát hành |
| Cross-platform và drift | PASS thử thực tế | Đổi DASHBOARD sang CRLF: checker chấp nhận; chèn stale text TASK_BOARD: checker từ chối; finally restore lại file gốc |
| Repo checks | PASS |31 unit tổng, lint, tsc, production build, docs:check và plan:check |
| Năng lực/velocity thực tế | NOT VERIFIED | Chưa có sprint Closed và giờ/tuần; SP là forecast dev, không đổi thành ngày hoặc hứa12 tuần |
| Nội dung/feature mới | NOT STARTED | Tất cả72 task Todo, không coi việc tạo kế hoạch là hoàn thành feature hoặc bắt đầu sprint |
| Browser/Docker/provider E2E mới | N/A phạm vi | Không đổi route/UI/schema/DB/worker, không deploy; không chạy lại dịch vụ ngoài chỉ vì thêm tracking |

## Review riêng và giới hạn

- Baseline được đọc từ code-map và audit hiện có, giữ trạng thái Partial của audio/STT/Tutor/full exam. Không báo toàn dự án0% hoặc100% bằng số task bổ sung.
- Các PB là ID nội bộ, không giả ticket Jira/GitHub. Feature mới phải tạo5 docs ở task đầu; feature đã có tiếp tục canonical docs, tránh spec trùng.
- Content review/source/rights, benchmark do người dùng duyệt, audit/handoff và release gate đều có task. Scope giảm phù hợp solo; không cho Core phụ thuộc Stretch.
- Không khóa lịch hay capacity khi thiếu thông tin. S1-S2 refine trước; forecast S3-S6 phải cập nhật khi có velocity/carry-over thực tế. Nội dung chưa estimate không là0 effort.
- Checker cấu trúc chỉ kiểm field/reference/file có tồn tại; không chứng minh teacher review hoặc nội dung evidence là đúng. Cùng một owner vẫn cần tách lượt audit khỏi implementation.
- Build checkout chính ban đầu thiếu package font Inter đã có trong lockfile; chạy npm ci theo lockfile, sau đó production build đạt. Không sửa dependency version hoặc source UI để né lỗi.

## Bàn giao và rollback

[Hướng dẫn tracking](../planning/README.md), [Dashboard](../planning/DASHBOARD.md), [source](../planning/work-items.json), [CLI](../../scripts/planning.mjs), [unit](../../tests/unit/planning.test.ts). CSV xuất UTF-8 để mở/lọc Excel; không sửa CSV thay cho source.

Không migration/data write. Có thể rollback công cụ planning bằng commit trước; dữ liệu app và container đang chạy giữ nguyên. Kế hoạch chưa là sprint commitment, chưa tạo automation/ticket ngoài repo hoặc gọi AI.
