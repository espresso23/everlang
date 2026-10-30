<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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

- Audit là bước bắt buộc sau triển khai và trước bàn giao/đánh dấu hoàn tất. Thực hiện một lượt review riêng đối chiếu đặc tả → code → kiểm tra thực tế; không chỉ dựa vào build thành công hoặc tự ghi “đạt”.
- Audit từng feature; nếu thay đổi nhiều feature liên quan, thêm audit tích hợp tại `documentation/audits/<group-id>.md`, tham chiếu audit của từng feature và các hợp đồng kết nối.
- Kiểm tra luồng liên kết thực tế theo phạm vi: thao tác UI → xác thực/phân quyền → API/service → worker/queue nếu có → database/storage → phản hồi/trạng thái UI. Đối chiếu payload, schema, mã lỗi, quyền sở hữu, cache invalidation, retry/idempotency và cập nhật dữ liệu giữa các thành phần liên quan.
- Bao phủ luồng thành công và lỗi có ý nghĩa: dữ liệu không hợp lệ, thiếu quyền, dịch vụ ngoài lỗi/timeout, trạng thái rỗng/loading, xung đột nhiều tab/thiết bị, migration/khôi phục khi có thay đổi dữ liệu. Đánh giá accessibility và responsive với thay đổi UI.
- Chạy lint/typecheck/build và các kiểm tra phù hợp với thay đổi. Dùng unit/integration/E2E khi chúng kiểm chứng rủi ro thực sự; chỉnh sửa UI nhỏ có thể dùng kiểm tra trực quan và smoke test sẵn có, không tạo test chỉ lặp lại implementation.
- `audit.md` phải ghi ngày, phạm vi/phiên bản hoặc branch, yêu cầu đã kiểm, kết quả `PASS`/`FAIL`/`NOT VERIFIED`/`N/A`, lệnh hoặc bước tái hiện, bằng chứng, phát hiện và việc còn lại. Nhóm audit phải chỉ rõ các kết nối giữa feature đã/ chưa được xác minh.
- Không đánh dấu feature hoàn tất khi còn yêu cầu bắt buộc lỗi/chưa kiểm chứng, hợp đồng không khớp hoặc liên kết docs–code bị thiếu. Nếu thiếu credential/dịch vụ ngoài, ghi `blocked`/`NOT VERIFIED` đúng phạm vi và nêu điều kiện để kiểm tra tiếp; không giả kết quả thành công.
- Trước bàn giao, kiểm tra liên kết tương đối, file/symbol được tham chiếu, UI/contract và trạng thái trong mục lục. Cập nhật `HANDOFF.md` ở root bằng tóm tắt và đường dẫn tới tài liệu/audit trong `/documentation`, đồng thời giữ lịch sử cũ.
