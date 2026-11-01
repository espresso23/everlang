# Audit — workflow agent và skills

## Bổ sung 2026-11-01 — Quy tắc dùng skill trong AGENTS.md

- Phạm vi: mục bắt buộc chọn/dùng skill trong AGENTS.md, liên kết workflow và HANDOFF; giữ branch/edits có sẵn theo ngoại lệ chủ dự án đã cấp.
- Self-review riêng: đối chiếu năm tình huống session/PRD/grill-me/issue planning/implementation với đúng skill và đầu ra; kiểm đường dẫn SKILL.md thực sự tồn tại. PASS về hướng dẫn và routing.
- Đã kiểm quy tắc không ép việc nhỏ qua phỏng vấn, không nạp toàn bộ skills, ưu tiên nguồn repo, xử lý skill thiếu và không mở rộng quyền. PASS qua review nội dung; tự động lựa chọn skill trong phiên tương lai NOT VERIFIED.
- `npm run docs:check`: PASS — 19 features, 232 source/config files, 1.835 local links. Kết quả này là lượt kiểm mới; giữ nguyên lịch sử hash drift bên dưới.
- `git diff --check -- AGENTS.md HANDOFF.md documentation/workflow/README.md documentation/audits/agent-delivery-workflow.md`: PASS, exit 0 trước khi ghi bổ sung audit; kiểm cuối ghi trong HANDOFF.
- Lint/typecheck/build/runtime tests N/A: chỉ sửa hướng dẫn Markdown. Không thay nội dung SKILL.md hoặc bản cài cá nhân.

- Ngày: 2026-11-01, Asia/Saigon.
- Branch: `refactor/typeorm-data-access`; chủ dự án cho phép bổ sung ngay trên branch đang có thay đổi ORM chưa commit. Không switch/reset/stash/chuyển thay đổi.
- Phạm vi: AGENTS, workflow, templates, bốn skills và hướng dẫn phiên mới. Không sửa application runtime/dữ liệu/tracking task trong lượt này.
- Reviewer: cùng agent, lượt self-review riêng sau khi soạn implementation.
- Kết luận: kiểm tra tài liệu/skill theo bảng dưới; chạy sản phẩm/GitHub end-to-end `NOT VERIFIED` và không thuộc việc tạo bộ workflow.

## Đối chiếu yêu cầu → hiện thực → kiểm tra

| Yêu cầu | Hiện thực | Cách kiểm | Kết quả |
|---|---|---|---|
| Context/reset | [Workflow](../workflow/README.md), [context template](../templates/workflow/context.md), [session skill](../../.agents/skills/everlang-session/SKILL.md) | Đọc đường đi checkpoint → chat mới → kiểm lại repo; phân biệt ngân sách nội bộ và giới hạn model | PASS qua review nội dung |
| Grill-me/shared understanding | [PRD skill](../../.agents/skills/everlang-prd/SKILL.md), [interview template](../templates/workflow/interview.md) | Một quyết định mỗi lượt, hai phương án tối đa; không suy diễn im lặng | PASS qua review; đã hỏi và nhận quyết định AFK/branch thực tế |
| PRD duy nhất | [Feature template](../templates/feature/README.md), [mục lục](../README.md) | README feature giữ REQ/traceability, bổ sung outcome/non-goals/giả định | PASS qua review; không thêm PRD cạnh tranh |
| Vertical slices | [Issue template](../templates/workflow/issue.md), [PRD → issue skill](../../.agents/skills/prd-to-issue/SKILL.md) | Có tracer bullet, AC success/error, dependency/schema/file conflicts | PASS qua review cấu trúc |
| AFK/human QA | [AFK skill](../../.agents/skills/issue-afk/SKILL.md), [planning guide](../planning/README.md) | Chỉ issue được giao, Ready không thay dependency evidence, kết thúc Review; owner QA/Done/merge/deploy | PASS qua review |
| TDD/self-review | AFK skill và workflow | Red đúng nguyên nhân → green → refactor; N/A có lý do cho docs/UI nhỏ; audit riêng | PASS qua review; TDD runtime N/A vì chỉ thay docs/skills |
| Deep modules | [System-design template](../templates/feature/system-design.md), workflow | Public interface/invariant/dependency direction thay số lớp/file | PASS qua review; audit toàn kiến trúc legacy NOT VERIFIED |
| GitHub reliability | PRD → issue skill | Tình huống đã tạo nhưng timeout: tìm marker trước retry; tìm cả open/closed; lưu URL sau mỗi lần tạo; partial failure giữ drafts | PASS qua walkthrough; remote writes NOT VERIFIED, không được yêu cầu ở lượt này |
| Skill discovery/format | Bốn `.agents/skills/*/SKILL.md` và bản cài cá nhân | quick_validate.py mỗi skill; đối chiếu SHA256 bản cài và nguồn | PASS: 4/4 valid, 4/4 bản cài hash giống nguồn; discovery tự động ở chat mới chưa kiểm |
| Tracking | plan checker | npm run plan:check | PASS: 14 domains, 40 PBI, 86 tasks, 6 Proposed; không đổi tracking JSON |
| Docs check toàn repo | docs checker | npm run docs:check | FAIL baseline source/hash drift ORM; lần sau còn `scripts/import-records.ts`; không có broken link trong output. Không refresh hash ngoài phạm vi |
| Whitespace | git | git diff --check | PASS, exit 0; có cảnh báo LF/CRLF ở changes có sẵn |
| Liên kết tài liệu | 157 Markdown files trong documentation, skills và AGENTS | Quét Markdown relative targets bằng Python pathlib/re, kiểm tồn tại file | PASS: 1.786 liên kết; không kiểm fragment/anchor |

## Phát hiện trong self-review

- Template PRD giữ README canonical để không phát sinh hai bản yêu cầu.
- Tracking JSON giữ nguồn trạng thái duy nhất; issue local là hợp đồng và remote URL. Chưa đổi task status, sprint hoặc tạo backlog product mới vì đây là thiết lập quy trình.
- Không dùng “100k token” như đảm bảo chất lượng; không hứa clear chat/daemon AFK tự chạy.
- Không tự refresh code-map ORM: kiểm tra baseline trước sửa workflow đã báo hash drift. Baseline plan:check PASS: 14 domains, 40 PBIs, 86 tasks, 6 Proposed sprints.

## Giới hạn và việc tiếp theo

- Chưa chạy vòng thực thi skill trên GitHub thật hoặc issue sản phẩm thật; cần một yêu cầu cụ thể và repo/issue scope để xác minh tiếp. Không tạo remote side effects chỉ để test skill.
- Không chạy lint/typecheck/build/application tests: chỉ thêm/sửa Markdown và hướng dẫn skill, không sửa runtime/config executable. Đây là N/A cho phạm vi này, không chứng nhận changes ORM sẵn có.
- Không kiểm chứng toàn bộ legacy PRD/codebase. Feature cũ bổ sung khi sửa đúng phạm vi.
- [HANDOFF](../../HANDOFF.md) ghi quyết định, file và kết quả cuối.
