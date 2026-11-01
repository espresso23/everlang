# Workflow giao việc cho agent

Áp dụng: 2026-11-01. Phạm vi lượt này: tài liệu/quy trình/skills, không triển khai backlog hay sửa runtime. Chủ dự án đã chọn agent tự triển khai và kiểm tra; human QA, merge và deploy thuộc chủ dự án.

[Quyết định đã ghi nhận từ phiên phỏng vấn](decisions.md).

## Bắt đầu nhanh

Agent bắt buộc chọn skill theo [bảng định tuyến trong AGENTS.md](../../AGENTS.md#bắt-buộc-chọn-và-dùng-skill-đúng-công-việc), đọc SKILL.md trước khi dùng và kiểm lại đầu ra trước bàn giao. Ưu tiên nguồn skill trong repo nếu trùng bản cài cá nhân.

Phiên mới đọc [NEW_SESSION](NEW_SESSION.md). Feature mới dùng [PRD template](../templates/feature/README.md), [biên bản phỏng vấn](../templates/workflow/interview.md), [issue template](../templates/workflow/issue.md), [context checkpoint](../templates/workflow/context.md). [Audit workflow](../audits/agent-delivery-workflow.md) ghi phạm vi đã kiểm.

| Bước | Đầu ra và điều kiện chuyển bước | Skill |
|---|---|---|
| Context | Branch/status, issue được giao, docs/phụ thuộc cần đọc; ghi rõ thay đổi có sẵn | [everlang-session](../../.agents/skills/everlang-session/SKILL.md) |
| Shared understanding | Phân biệt fact/giả định/quyết định; giải quyết câu hỏi ảnh hưởng scope, dữ liệu, UX và kiểm chứng | `grill-me` dùng chung; [everlang-prd](../../.agents/skills/everlang-prd/SKILL.md) |
| PRD | README feature là tài liệu đích đến: vấn đề, outcome, non-goals, REQ/AC, rủi ro, quyết định; năm docs chuẩn sẵn trước code | [everlang-prd](../../.agents/skills/everlang-prd/SKILL.md) |
| Vertical slices | Mỗi issue có REQ/task ID, kết quả end-to-end, dependencies, test và phạm vi ghi; tracer bullet trước | [prd-to-issue](../../.agents/skills/prd-to-issue/SKILL.md) |
| AFK | Chỉ issue được giao, Ready; triển khai/test/refactor và checkpoint khi gặp blocker | [issue-afk](../../.agents/skills/issue-afk/SKILL.md) |
| Review và QA | Self-review/audit riêng, lưu bằng chứng; agent đưa Review; chủ dự án QA và quyết định Done/merge/deploy | [audit template](../templates/feature/audit.md) |

## Những gì base đã có và được bổ sung

| Nội dung | Base quan sát được | Bổ sung |
|---|---|---|
| Context/reset | HANDOFF, project-status, feature docs | Context packet theo issue, resume prompt; ưu tiên chat mới sau checkpoint |
| Grill-me | Skill dùng chung đã có | Gate trước code, decision log, không hỏi lại facts trong repo |
| PRD | README feature có scope/REQ/traceability | Outcome đo được, AC, non-goals, giả định, trạng thái thống nhất |
| Chia việc | WBS/PBI/task/dependency JSON | Issue xuyên lớp; dependency và giới hạn file rõ; không chia chỉ DB/API/UI |
| AFK | Chưa có hợp đồng thực thi issue | Ready/stop/Review, quyền tự chủ, checkpoint và human QA |
| Test/audit | Vitest, Playwright, check scripts, audit bắt buộc | Red/green/refactor theo rủi ro, self-review riêng, QA vẫn là gate con người |
| Deep modules | Ba runtime và shared packages đã có | Thiết kế interface/invariant theo module; không tuyên bố codebase đã audit toàn bộ |
| GitHub | Không có `.github` lúc kiểm tra | Skill soạn/đăng issue khi được yêu cầu; chống trùng và đối chiếu local tracking |

## Context và chuyển phiên

- Chỉ đọc AGENTS, issue, PRD và hợp đồng phụ thuộc liên quan; dùng tìm kiếm theo symbol thay vì nạp toàn repo/log.
- Dưới khoảng 100k token là ngân sách nội bộ mong muốn, không phải ranh giới “smart zone” được kiểm chứng cho mọi model. Nếu không đo được token thì ghi không biết; theo dõi đổi scope, lặp thao tác hoặc bỏ sót quyết định để checkpoint sớm.
- Trước clear/chat mới: lưu quyết định, file đang sửa, test đã chạy/kết quả, blocker và bước tiếp theo bằng [context template](../templates/workflow/context.md). Không cần commit để checkpoint. Không tự clear/archive/xóa lịch sử.
- Chat mới kiểm tra lại branch/status/diff thực tế; checkpoint là hướng dẫn phục hồi, không thay thế trạng thái repo. Nếu auto-compaction xảy ra, tiếp tục nhiệm vụ đang làm từ checkpoint.

## PRD và slicing

Feature mới dùng README làm PRD; feature cũ bổ sung phần thiếu khi được sửa, không backfill hoặc gắn nhãn verified hàng loạt. Quyết định sản phẩm ghi trong PRD, hợp đồng kỹ thuật ghi system-design/functions/UI. Chưa thống nhất thì ghi open/blocked ở đúng phần phụ thuộc, vẫn có thể làm phần độc lập đã rõ.

Ví dụ phân rã *minh họa, không giao triển khai*: slice đầu lưu một từ hợp lệ → kiểm auth/ownership → API/service → lưu PG → UI phản hồi và reload thấy dữ liệu; slice sau xử lý duplicate/retry/conflict rồi mới mở rộng biến thể. Queue/worker chỉ xuất hiện nếu hành vi thực sự cần. Mỗi slice có ít nhất một happy path và một lỗi có ý nghĩa; migration/backup có thể là prerequisite riêng vì rủi ro dữ liệu, không ép thành một màn hình.

Issue độc lập phải không đòi cùng schema/contract chưa ổn định hoặc cùng file dễ xung đột. Nếu không độc lập thì sắp dependency và thực hiện tuần tự; không tự dùng nhiều agent chỉ vì có nhiều issue.

## GitHub và một nguồn tracking

`documentation/planning/work-items.json` vẫn là nguồn trạng thái chuẩn. File `features/<feature-id>/issues/<task-id>.md` chứa hợp đồng triển khai và URL GitHub; không tạo state machine thứ hai trong frontmatter. Issue product phải map ID hiện có; thêm task qua refine trong JSON khi cần, không tự bịa ticket GitHub hoặc đưa vào sprint Proposed.

Skill PRD → issue mặc định chuẩn bị bản local. Khi người dùng yêu cầu đăng GitHub, xác định đúng repo, kiểm issue mở/đóng và marker task trước khi tạo. URL/issue number do GitHub trả về mới được ghi lại. Mỗi lần tạo xong lưu URL ngay; request timeout phải tìm lại trước retry. Thiếu quyền/dịch vụ thì giữ draft, ghi blocker. Không ghi status vào generated Markdown/CSV bằng tay; tracking đổi thì chạy plan:sync và plan:check.

## AFK và điểm dừng

AFK là cách thực thi issue được giao trong phiên agent, không phải daemon/scheduler đã cài. Không tự kéo task tiếp theo ngoài danh sách được giao. Ready cần scope/AC rõ, PRD đã thống nhất, dependencies đạt, môi trường test khả dụng hoặc giới hạn được chấp nhận rõ. Không coi field Ready riêng lẻ là đủ nếu upstream đang thay đổi.

Agent tự giải quyết lỗi trong scope và chạy kiểm tra phù hợp. Dừng phần phụ thuộc khi yêu cầu mâu thuẫn, thiếu quyền/credential, migration phá dữ liệu chưa có phương án khôi phục, thay đổi contract ngoài scope hoặc test bắt buộc không thể chạy. Ghi blocker/NOT VERIFIED và câu hỏi cụ thể; tiếp tục phần độc lập nếu có. Không diễn giải im lặng thành phê duyệt.

TDD ưu tiên kiểm hành vi/bug có thể tái hiện, không test phản chiếu implementation. Lượt self-review đọc lại diff so với AC, kiểm auth/ownership/validation, lỗi/retry/concurrency, data/UI theo phạm vi; audit lưu phát hiện và sửa. Test xanh chỉ đủ đề nghị Review. Done cần human QA và các gate tracking hiện có; human QA không tự chứng nhận dịch vụ ngoài chưa test.

## Thiết kế module sâu

UI/API gọi một interface nghiệp vụ rõ thay vì tự lắp transaction, retry hay provider state. Implementation module sở hữu invariant và failure semantics; kiểm thử qua interface. Giữ contracts browser-safe trong `packages/contracts`, server behavior trong API/worker/backend theo [kiến trúc](../shared/architecture.md). Trong system-design ghi public interface, invariant được che giấu và dependency direction. Một service chuyển tiếp đơn thuần chưa chứng minh module sâu; không đo chất lượng bằng số lớp/file. Chỉ refactor khi cần cho slice và có regression evidence.

## Skills và tính di động

Nguồn versioned: `.agents/skills/*/SKILL.md`. Bản cài cá nhân tại `C:/Users/TAN/.codex/skills/` có cùng nội dung tại thời điểm bàn giao; khi đổi skill, cập nhật và kiểm tra lại bản cài. Máy mới dùng nguồn repo; nếu chưa discover skill, yêu cầu agent đọc đường dẫn SKILL.md trong bảng trên. Không phụ thuộc chat cũ để bắt đầu.

Không cài runner, tạo GitHub issue thật, push, merge hay deploy trong lượt thiết lập workflow này. Quy trình đã được review cấu trúc; việc vận hành end-to-end trên một issue sản phẩm thật vẫn cần kiểm chứng riêng.
