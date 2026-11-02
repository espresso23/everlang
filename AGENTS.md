<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Workflow agent — áp dụng từ 2026-11-01

- Đọc [workflow chuẩn](documentation/workflow/README.md); phiên mới bắt đầu tại [NEW_SESSION.md](documentation/workflow/NEW_SESSION.md). Quy trình: context → grill-me → PRD → vertical issues → AFK → self-review/audit → human QA.
- Trước code hành vi mới, dùng `grill-me` cho các quyết định sản phẩm còn mở: hỏi một quyết định mỗi lượt, tối đa hai phương án có khuyến nghị; không hỏi lại điều đã chốt hoặc có thể đọc trong repo. Chỉ sửa code khi các quyết định ảnh hưởng implementation đã rõ; yêu cầu nhỏ rõ ràng dùng PRD/issue ngắn tương xứng.
- PRD chuẩn là `documentation/features/<feature-id>/README.md`, không tạo bản PRD cạnh tranh. Lưu kết luận phỏng vấn, giả định và câu trả lời tại feature; không suy diễn im lặng là đồng ý. Năm tài liệu feature hiện có vẫn bắt buộc.
- Chia issue thành lát cắt có kết quả quan sát được xuyên các lớp cần thiết; lát đầu là tracer bullet chạy end-to-end. Dependency phải rõ, không gọi các issue chung schema/file là độc lập.
- AFK chỉ xử lý issue được giao và đã Ready; tự triển khai, kiểm tra, sửa lỗi trong scope, cập nhật docs/evidence/HANDOFF rồi chuyển Review. Chủ dự án QA, quyết định Done/merge/deploy; không tự mở rộng backlog, push/merge/deploy hoặc đóng GitHub issue chỉ vì test xanh.
- Dùng TDD cho thay đổi logic/bug khi có test hành vi hữu ích: red có đúng nguyên nhân → green → refactor. Docs/UI nhỏ dùng kiểm tra phù hợp, ghi N/A có lý do. Self-review là lượt riêng sau implementation và trước human QA.
- Ưu tiên module sâu: interface nhỏ, giữ invariant/transaction/retry bên trong module nghiệp vụ; không tự đại tu kiến trúc hoặc tạo wrapper chỉ chuyển tiếp để đạt số lớp.
- Context chỉ chứa issue và phụ thuộc cần thiết; dưới khoảng 100k token là ngân sách làm việc nội bộ, không phải giới hạn kỹ thuật/đảm bảo chất lượng chung. Ưu tiên checkpoint bền vững rồi clear/chat mới khi đổi scope hoặc quá tải; không tự xóa chat. Nếu môi trường tự compact, tiếp tục từ checkpoint, không làm lại phần đã xong.
- Skills chuẩn theo repo nằm ở `.agents/skills/`: `everlang-prd`, `prd-to-issue`, `issue-afk`, `everlang-session`. Đọc SKILL.md liên quan nếu phiên mới chưa tự liệt kê; `grill-me` hiện có là skill phỏng vấn dùng chung. Tạo skill không đồng nghĩa được phép đăng GitHub issues.

## Bắt buộc chọn và dùng skill đúng công việc

- Khi bắt đầu nhiệm vụ, xác định kết quả được giao, kiểm tra branch/status và chọn skill theo bảng dưới. Nếu người dùng gọi tên skill, phải đọc `SKILL.md` của skill đó trước khi thực hiện. Khi công việc khớp rõ mô tả skill, chủ động dùng; không chờ người dùng nhắc.
- Bản skill chuẩn của dự án nằm trong `.agents/skills/`. Nếu danh sách skill của phiên chưa hiển thị hoặc trùng với bản cài cá nhân, đọc bản trong repo. Chỉ nạp skill và tài liệu tham chiếu cần cho bước hiện tại; không nạp toàn bộ skills vào context.

| Công việc / dấu hiệu cần dùng | Skill và hướng dẫn | Kết quả cần có |
|---|---|---|
| Phiên mới, tiếp nối sau reset/compact hoặc nhận bàn giao | [everlang-session](.agents/skills/everlang-session/SKILL.md) | Đối chiếu checkpoint với repo; xác định issue, quyền tự chủ và bước tiếp theo |
| Feature mới hoặc thay đổi đáng kể yêu cầu sản phẩm | [everlang-prd](.agents/skills/everlang-prd/SKILL.md) | PRD chuẩn trong README feature; quyết định/giả định rõ trước code |
| Quyết định sản phẩm/thiết kế còn mở, cần phản biện để hiểu chung | `grill-me` trong danh sách skills của phiên | Một quyết định mỗi lượt, tối đa hai phương án; ghi câu trả lời thực tế |
| Audit frontend, phản biện UX/UI hoặc đề xuất bố trí component EverLang | [everlang-ux-ui](.agents/skills/everlang-ux-ui/SKILL.md) | Findings có bằng chứng, đối chiếu Editorial Design, đề xuất tối đa hai phương án mỗi quyết định; phân biệt đề xuất và triển khai |
| Chuyển PRD đã thống nhất thành task/issue hoặc đăng GitHub Issues khi được yêu cầu | [prd-to-issue](.agents/skills/prd-to-issue/SKILL.md) | Vertical slices có AC/dependencies, map task ID; kiểm trùng trước đăng |
| Triển khai/sửa lỗi theo issue đã được giao và đủ Ready | [issue-afk](.agents/skills/issue-afk/SKILL.md) | Code + kiểm tra + self-review + docs/audit/HANDOFF; chuyển Review cho chủ dự án QA |

- Lần đầu dùng một skill trong chat, thông báo ngắn tên skill và mục đích. Thực hiện các bước/hợp đồng liên quan trong skill; chỉ nói tên skill không được coi là đã dùng.
- Yêu cầu nhỏ đã rõ có thể làm trực tiếp với kiểm tra tương xứng; không ép mọi chỉnh sửa docs/UI qua phỏng vấn hoặc tạo issue mới. Không dùng skill chỉ vì trùng từ khóa. Những skill chuyên biệt khác trong phiên áp dụng khi đúng phạm vi hoặc được người dùng gọi tên.
- Thiếu skill: tìm trong `.agents/skills/` và vị trí được khai báo trong danh sách skills trước. Nếu vẫn không có, nói rõ giới hạn; không tuyên bố đã dùng. Chỉ tiếp tục phần độc lập bằng quy trình tương đương khi không mất hợp đồng bắt buộc; phần thật sự phụ thuộc phải ghi blocker.
- Skill không mở rộng quyền được giao: không tự đăng GitHub, gửi thông báo, lấy backlog tiếp theo, gọi nhiều agent, push/merge/deploy hoặc đánh dấu Done. Quyền đã được người dùng cấp trong phiên vẫn có hiệu lực; không hỏi xác nhận lại theo nghi thức.
- Trước bàn giao, đối chiếu kết quả với issue/PRD và hướng dẫn skill đã dùng; ghi kiểm tra thực tế, phần chưa xác minh và việc còn lại trong audit/HANDOFF. Chỉ cập nhật task status ở `work-items.json` theo quy tắc tracking.

## Quy tắc bàn giao dự án

- Sau **mọi thay đổi tính năng, sửa lỗi, cấu hình vận hành hoặc thay đổi dữ liệu** được yêu cầu trong dự án, cập nhật `HANDOFF.md` ngay trong cùng lượt làm việc.
- Ghi ngày, nội dung đã thay đổi, file liên quan, cách kiểm tra/kết quả và việc còn phải làm (nếu có). Giữ phần lịch sử cũ; bổ sung mục mới ở đầu nhật ký.
- Nếu chưa thể xác minh (ví dụ dịch vụ ngoài không khả dụng), ghi rõ giới hạn thay vì tuyên bố đã kiểm tra thành công.
- Không bao giờ ghi API key, mật khẩu, URI có thông tin xác thực hoặc nội dung bí mật vào `HANDOFF.md`, README, log hay mã nguồn. Chỉ ghi tên biến môi trường.

## Quy tắc branch

- Trước khi triển khai, kiểm tra branch hiện tại và `git status`; giữ nguyên các thay đổi có sẵn của người dùng. Không tự reset, stash, đổi tên branch hoặc chuyển công việc chưa commit sang branch khác.
- Mỗi feature hoặc nhóm feature liên quan dùng một branch có dạng `<type>/<ticket-id-tùy-chọn><mô-tả-kebab-case>`. Tái sử dụng branch hiện tại nếu đúng phạm vi; không triển khai feature mới trực tiếp trên `main`/`master`.
- Prefix theo mục đích: `feature/` (tính năng), `bugfix/` (sửa lỗi thông thường), `hotfix/` (lỗi khẩn cấp), `release/` (chuẩn bị phát hành). Công việc chuyên biệt có thể dùng `docs/`, `refactor/`, `test/`, `chore/`.
- Mô tả ngắn, tiếng Anh, chữ thường và phân cách bằng dấu `-`; không dùng khoảng trắng, `_` hoặc mô tả chung chung như `update`/`fix-stuff`. Ticket ID giữ định dạng của hệ thống, ví dụ `JIRA-456`; không tự tạo ticket ID khi chưa có.
- Ví dụ: `feature/JIRA-456-add-login-page`, `bugfix/prevent-duplicate-reviews`, `hotfix/restore-google-callback`, `release/v1-2-0`, `docs/feature-workflow-rules`.
- Kiểm tra tên branch bằng `git check-ref-format --branch <branch-name>`. Nếu người dùng chỉ định tên/prefix khác, ưu tiên chỉ định đó và ghi rõ trong bàn giao.

## Tài liệu feature và đối chiếu 1:1 với code

- Mọi công việc frontend bắt buộc đọc và tuân thủ [EverLang Editorial Design](documentation/design/README.md): tokens, typography, nội dung học, component, accessibility và gate audit. Giữ wireframe hiện hành; chỉ đổi layout khi người dùng yêu cầu. Không tái sử dụng palette/theme cũ để tạo giao diện song song.
- Mọi thao tác xác nhận trong UI phải dùng component do dự án xây dựng theo Editorial Design, ưu tiên component dùng chung. Không dùng `window.confirm`, `confirm` hoặc hộp thoại trình duyệt tương tự (`window.alert`, `window.prompt` và các dạng gọi tương đương) để thay thế UI này. Component phải có nội dung/hành động rõ ràng, nút hủy, hỗ trợ bàn phím và quản lý focus phù hợp; chỉ thực thi thao tác sau khi người dùng xác nhận.

- `/documentation` là thư mục tài liệu kỹ thuật chuẩn của dự án. Mỗi feature có một `feature-id` duy nhất dạng kebab-case và đúng một thư mục chuẩn tại `documentation/features/<feature-id>/`; đăng ký trong [mục lục tài liệu](documentation/README.md).
- Trước khi viết hoặc sửa code, đọc tài liệu feature và các thành phần phụ thuộc. Feature mới phải có đặc tả, system design, function description và UI dự kiến trước khi triển khai; cập nhật chúng theo kết quả thực tế trong cùng lượt thay đổi.
- Mỗi feature bắt buộc có `README.md`, `system-design.md`, `functions.md`, `ui.md`, `audit.md`, theo [bộ mẫu](documentation/templates/feature/README.md). Với tính năng không có UI, ghi rõ lý do trong `ui.md` thay vì bỏ file.
- Đối chiếu **hai chiều**: mỗi yêu cầu, API, hàm/điểm vào có hành vi và trạng thái UI được mô tả phải có tham chiếu tới file + symbol/route trong code và bằng chứng kiểm tra; mỗi hành vi được thêm/sửa/xóa trong code phải được cập nhật vào tài liệu tương ứng. Không chỉ dùng số dòng vì chúng dễ thay đổi.
- “1:1” nghĩa là một đặc tả chuẩn cho một feature và từng hành vi có ánh xạ rõ ràng; không ép một file Markdown cho mỗi file code. Thành phần dùng chung có một tài liệu chuẩn trong `documentation/shared/`; các feature phụ thuộc tham chiếu tới đó, không sao chép các hợp đồng dễ lệch nhau.
- Các bảng ánh xạ và liên kết phải trỏ tới file/symbol thực sự tồn tại. Tách rõ `planned`, `implemented`, `verified`, `blocked`; không mô tả phần dự kiến như chức năng đã chạy.
- Khi code và docs khác nhau, phải xử lý trong cùng thay đổi: code làm đúng đặc tả đã thống nhất; nếu cần đổi thiết kế, cập nhật quyết định, hợp đồng, UI và tiêu chí nghiệm thu liên quan. Không âm thầm sửa docs để hợp thức hóa lỗi hoặc xóa yêu cầu chưa làm được.
- Mọi thay đổi route, chữ ký hàm, schema, migration, quyền truy cập hoặc component phải cập nhật các tham chiếu bị ảnh hưởng, kể cả feature liên quan. Ảnh UI, sơ đồ và bằng chứng bền vững lưu dưới feature tương ứng trong `/documentation`; không dùng `.local/` làm nơi lưu duy nhất cho bằng chứng bàn giao feature.
- Feature cũ chưa có tài liệu chuẩn phải được bổ sung khi bắt đầu sửa feature đó; ghi rõ phần legacy chưa audit. Không tuyên bố toàn bộ feature cũ đã tuân thủ chỉ vì thêm quy tắc này.

## Audit từng feature và nhóm feature

- Tracking product: đọc [WBS/backlog/sprint guide](documentation/planning/README.md) trước khi thực hiện feature có trong kế hoạch. Chỉ cập nhật trạng thái tại `documentation/planning/work-items.json`; giữ ID, cập nhật task liên quan cùng evidence/verification/HANDOFF. Không tự đánh dấu Done chỉ vì có code, không tự chốt ngày/capacity sprint còn Proposed.
- Sau cập nhật tracking chạy `npm run plan:sync` và `npm run plan:check`; không sửa tay Markdown/CSV được sinh tự động. Feature phát sinh phải đưa vào backlog/refine trước khi tự đưa vào scope sprint. Quy tắc này áp dụng cho product work, không tự khởi động các task còn lại khi người dùng chỉ yêu cầu lập hoặc cập nhật kế hoạch.

- Audit là bước bắt buộc sau triển khai và trước bàn giao/đánh dấu hoàn tất. Thực hiện một lượt review riêng đối chiếu đặc tả → code → kiểm tra thực tế; không chỉ dựa vào build thành công hoặc tự ghi “đạt”.
- Audit từng feature; nếu thay đổi nhiều feature liên quan, thêm audit tích hợp tại `documentation/audits/<group-id>.md`, tham chiếu audit của từng feature và các hợp đồng kết nối.
- Kiểm tra luồng liên kết thực tế theo phạm vi: thao tác UI → xác thực/phân quyền → API/service → worker/queue nếu có → database/storage → phản hồi/trạng thái UI. Đối chiếu payload, schema, mã lỗi, quyền sở hữu, cache invalidation, retry/idempotency và cập nhật dữ liệu giữa các thành phần liên quan.
- Bao phủ luồng thành công và lỗi có ý nghĩa: dữ liệu không hợp lệ, thiếu quyền, dịch vụ ngoài lỗi/timeout, trạng thái rỗng/loading, xung đột nhiều tab/thiết bị, migration/khôi phục khi có thay đổi dữ liệu. Đánh giá accessibility và responsive với thay đổi UI.
- Chạy lint/typecheck/build và các kiểm tra phù hợp với thay đổi. Dùng unit/integration/E2E khi chúng kiểm chứng rủi ro thực sự; chỉnh sửa UI nhỏ có thể dùng kiểm tra trực quan và smoke test sẵn có, không tạo test chỉ lặp lại implementation.
- `audit.md` phải ghi ngày, phạm vi/phiên bản hoặc branch, yêu cầu đã kiểm, kết quả `PASS`/`FAIL`/`NOT VERIFIED`/`N/A`, lệnh hoặc bước tái hiện, bằng chứng, phát hiện và việc còn lại. Nhóm audit phải chỉ rõ các kết nối giữa feature đã/ chưa được xác minh.
- Không đánh dấu feature hoàn tất khi còn yêu cầu bắt buộc lỗi/chưa kiểm chứng, hợp đồng không khớp hoặc liên kết docs–code bị thiếu. Nếu thiếu credential/dịch vụ ngoài, ghi `blocked`/`NOT VERIFIED` đúng phạm vi và nêu điều kiện để kiểm tra tiếp; không giả kết quả thành công.
- Trước bàn giao, kiểm tra liên kết tương đối, file/symbol được tham chiếu, UI/contract và trạng thái trong mục lục. Cập nhật `HANDOFF.md` ở root bằng tóm tắt và đường dẫn tới tài liệu/audit trong `/documentation`, đồng thời giữ lịch sử cũ.

## Chỉ định tracking GitHub — 2026-11-01

- Mỗi đầu việc được giao phải có GitHub issue trước thực thi, đối chiếu marker/tracking để không tạo trùng. Ưu tiên plugin GitHub; fallback CLI khi thiếu quyền/capability.
- Owner cho phép mark Done/đóng completed khi acceptance đã đạt và review có bằng chứng; đồng bộ work-items.json, plan views, audit/HANDOFF rồi báo cáo DONE–DOING–NEXT. Không coi tạo issue hoặc test xanh là hoàn tất khi còn human content QA/production gate. Xem documentation/planning/GITHUB_ISSUES.md.
