# HANDOFF — EverLang

Cập nhật gần nhất: 2026-10-31

## Trạng thái hiện tại

### 2026-10-31 — Bổ sung discovery thư viện kiến thức đọc lại

- Mở rộng `documentation/research/self-study-vocabulary-pronunciation.md` theo yêu cầu: ngữ pháp, idiom/quán dụng ngữ, tục ngữ, thành ngữ Hán-Hàn, collocation, phát âm và bài đọc/tài liệu; thêm tìm kiếm, bookmark, vị trí đọc, ghi chú riêng tư và liên kết SRS.
- Đối chiếu PB-001/002/005/006/007/013/014 để tránh tạo lại scope ngữ pháp; các phần bổ sung vẫn proposed, không sửa tracking/sprint/code. Nguồn NIKL API được đọc công khai, chưa gọi API hoặc kiểm coverage.
- Review phân loại/trạng thái và liên kết: tài liệu nghiên cứu không thay canonical feature spec; học liệu/UI/provider vẫn NOT VERIFIED. `npm run docs:check`, `npm run plan:check`, `git diff --check` đạt; chỉ đổi tài liệu, không cần build runtime.

### 2026-10-31 — BA discovery: bộ từ theo chủ đề và phát âm

- Branch `docs/vocabulary-pronunciation-discovery`: thêm `documentation/research/self-study-vocabulary-pronunciation.md`, đăng ký tại `documentation/README.md`. Đối chiếu vocabulary/SRS/recordings source; đề xuất taxonomy, content/audio pilot, vòng học và acceptance, liên kết PB-013/014/018/020/026; không đổi JSON tracking, code, schema hoặc scope sprint.
- Nguồn công khai: NIKL, LingQ, TEUIDA, Hàn Quốc Lý Thú, tài liệu Azure; bài Tiếng Hàn Thú Vị trả 429, chỉ ghi search signal. Azure có ko-KR assessment nhưng prosody/phoneme naming giới hạn theo locale; chưa gọi provider hoặc đo độ chính xác. Không dùng STT match làm điểm phát âm.
- Review riêng kiểm phân biệt baseline/proposed, nguồn và traceability; còn NOT VERIFIED với benchmark nhiều người/thiết bị, thử thực tế đối thủ và content/audio. Bước tiếp: chọn content-first hoặc speaking-first, refine pilot và spike trước khi triển khai.
- Kiểm tra: `npm run docs:check` đạt (14 domain, 94 source/config, 1196 local links); `npm run plan:check` đạt (33 PBI/72 task/6 sprint Proposed); `git diff --check` đạt. Không build app vì chỉ đổi tài liệu nghiên cứu.

### 2026-10-30 — Commit nền beta và đồng bộ documentation trước profile

- Đã commit nền beta/UI/quy tắc phát triển tại `1d0fbad`; không gom thay đổi riêng thư mục project-idea của người dùng.
- Backfill `/documentation` cho 14 feature: đặc tả, system design, function description, UI, audit; bổ sung architecture, stack thực tế, 8 màn hình, dữ liệu, API và vận hành. Source/symbol/hash có canonical owner trong code-map.
- Thêm `scripts/check-documentation.mjs`, `docs:check`/`docs:sync`: kiểm file, symbol, source drift và link; không thay thế review ngữ nghĩa. Kiểm tra đạt 14 feature, 82 file, 960 link; `git diff --check` đạt.
- Trace runtime xác định Google callback lỗi invalid_client trước khi tạo session. Người dùng đã cập nhật cấu hình; dummy refresh-token probe không còn invalid_client. Chưa xác minh đăng nhập Google thật thành công. Shell baseline chưa render avatar và còn hiện nút đăng nhập khi session pending; sẽ sửa cùng feature profile sau commit tài liệu.
- Mailpit là inbox SMTP local cho verify/reset, không tham gia Google OAuth. Dịch vụ ngoài STT/S3/Tutor và bộ đề đầy đủ vẫn chưa kiểm chứng; trạng thái ghi rõ trong audit. Không in hoặc lưu secret trong tài liệu.

- EverLang beta đã build và chạy Docker local tại `http://localhost:3000`; chỉ bind loopback. App/worker đang chạy, PostgreSQL/MongoDB/Redis healthy; Mailpit local tại cổng 8025. Migration 001–003 hoàn tất.
- Đã có đăng ký/đăng nhập email, xác minh/reset mật khẩu qua Mailpit; Google đã đăng nhập thật thành công sau khi người dùng cập nhật cấu hình; database có provider/image/session. Avatar và session UI đã sửa, profile lưu/refetch đồng bộ.
- Đã triển khai dashboard, kho từ/SRS FSRS-7, lịch học, nháp cloud, history/favorites theo session PostgreSQL và worker chấm AI; tên EverLang, theme editorial paper/ink/Cobalt theo documentation/design.
- Bộ 100 bài và 5 báo cáo MongoDB gốc được giữ. Không tự gán lịch sử cũ cho tài khoản mới; có CLI nhập idempotent sau đối chiếu chủ dữ liệu.
- OpenRouter đã chấm thật qua hàng đợi/lưu PostgreSQL; kết quả QA cuối 98/100 cho đáp án tham khảo. Không dùng smoke test này thay đánh giá chất lượng bằng bộ bài có người chấm.
- Có nền tảng nghe/đọc/thu âm, S3/STT/Tutor pgvector và mini exam; dịch vụ ngoài/nội dung đầy đủ còn điều kiện. Xem `FEATURE_AUDIT.md` để phân biệt đã kiểm chứng và chưa kiểm chứng.
- Tài khoản QA và học liệu test đã được dọn; mọi email có thể đăng ký, chỉ email chủ dự án giữ quyền admin trong môi trường cục bộ. Không có mật khẩu mặc định.

## Tính năng đã có

- Luyện dịch với chế độ danh sách/thẻ, lọc chủ đề và TOPIK, tìm kiếm, phân trang, tiến độ, gợi ý từ vựng ngắn, nhập câu trả lời, xem đáp án/ngữ pháp và nghe câu mẫu bằng Web Speech API `ko-KR`.
- Tạo bài mới và chấm bản dịch bằng OpenRouter; schema đầu ra được kiểm tra bằng Zod, JSON lỗi được thử phục hồi bằng `jsonrepair`, lỗi API được ghi log JSON có `requestId`.
- Chấm lại cùng nội dung dùng báo cáo đã lưu; người học có thể chủ động yêu cầu chấm lại. Điểm thống kê đếm bài/câu riêng biệt theo `sentenceId`, không tăng theo số lần gọi chấm.
- Xem lịch sử bài đã chấm, câu yêu thích, điểm/nhận xét đã lưu. Dữ liệu submission, nháp và trạng thái yêu thích hiện ở PostgreSQL theo tài khoản đã xác thực; bản MongoDB cũ chỉ giữ để lưu trữ/nhập có kiểm soát.
- Từ/cụm tiếng Hàn có thể chọn để tra; có popup từ điển, nghĩa/loại mục từ khi KRdict trả dữ liệu, liên kết mở KRdict và phát âm. Tra cứu qua API yêu cầu `KRDICT_API_KEY`; Web Speech vẫn dùng được khi thiếu khóa.
- Docker Compose khởi chạy ứng dụng và MongoDB 8; volume giữ dữ liệu MongoDB qua lần khởi động lại. Không đưa MongoDB vào Atlas trong cấu hình mặc định hiện tại.

## Lịch sử công việc của phiên

### 2026-10-31 — WBS, product backlog và kế hoạch sprint cho solo

- Branch docs/self-study-wbs-sprints từ4eb249c. User xác nhận solo và có khả năng duyệt tiếng Hàn; giờ/tuần/capacity/date TBD, không giả có nhiều người song song hoặc chốt deadline.
- documentation/planning/work-items.json là nguồn duy nhất:14 baseline domains tách riêng,33 PBIs (24 scheduled proposal +9 deferred),72 leaf task,6 sprint đề xuất2 tuần; Core/Stretch, acceptance, dependencies, verification/evidence và4 milestones. Tất cả task bổ sung Todo; không tính0% thành tiến độ toàn app.
- scripts/planning.mjs + npm plan:sync/plan:check sinh/check7 MD/CSV views (Dashboard/WBS/backlog/sprints/task board/2 CSV). Chặn dependency cycle, Done thiếu evidence/Pass, upstream chưa Done, Core dựa Stretch, sai commitment capacity. LF/CRLF được normalize; Markdown luôn kết thúc đúng một newline để diff sạch.
- Scope solo: pilot5 rồi15 bài grammar;5 bài đọc/3 audio. S1-S2 refine trước, S3-S6 forecast;25% capacity dự phòng. Luyện thi/đa ngôn ngữ/billing/gamification để backlog, không tự triển khai.
- Cập nhật AGENTS rule tracking, mục lục/status,5 docs platform-operations và code-map. Hướng dẫn tại documentation/planning/README.md; audit documentation/audits/project-planning.md.
- Kiểm:31 unit (8 planning), lint/typecheck/production build, docs:check/plan:check đạt; thử sửa generated view bị phát hiện, CRLF không tạo drift giả. Build lần đầu checkout chính thiếu Inter package; npm ci theo lockfile khắc phục, không đổi version/source UI.
- Không đổi route/UI/data/schema/worker, không deploy hoặc gọi provider/E2E app mới. Chưa start sprint hay tạo ticket/automation bên ngoài; cần refine acceptance và chốt giờ/tuần trước commitment.

### 2026-10-30 — Bàn giao main, tài liệu ý tưởng và tổng kết dự án

- Theo yêu cầu người dùng, giữ6 commit app/docs/UI đã có trên main và gom phần đã stage: chuyển Project_IDEA.md vào project-idea/ cùng ảnh mô phỏng giấy Writing. Đây là tài liệu ý tưởng, không coi là feature đã triển khai.
- Thêm documentation/project-status.md: tổng kết14 nhóm feature/8 màn hình, tách đã kiểm chứng với nền tảng còn thiếu; đề xuất2 hướng: hoàn thiện beta tự học (ưu tiên), sau đó môi trường beta thật.
- Đích đồng bộ origin/main bằng push thông thường, không force. Đối chiếu local HEAD và origin/main sau push; kết quả commit/remote được báo ở cuối lượt bàn giao.
- Kiểm thay đổi staged, pattern credential/private paths và docs:check. Không thay source runtime, schema hoặc dữ liệu; không chạy lại unit/E2E/build vì lượt này chỉ tài liệu/Git. .env, cache và log không được đưa vào commit.

### 2026-10-30 — Làm nhẹ sổ tay và shared surfaces

- Branch bugfix/lighten-editorial-surfaces từ50197f5. Theo ảnh/phản hồi, bỏ nền đen notebook, title labels, ngày/Beta, task hoàn thành và auth art note; dùng white/paper/tint + ink/muted/Cobalt. Làm nhẹ quote/layer chữ, giữ layout và profile passport.
- app/editorial.css override đủ text kế thừa để không white-on-white: heading/description, empty note, wrong/correction/explanation/link. Thêm khoảng thở18px và underline link ôn; focus Cobalt trên nền sáng.
- tests/e2e/editorial-design.spec.ts thêm empty/filled notebook regression, kiểm màu chữ/correction và href ôn; ảnh QA desktop/mobile lưu design-system/assets. Các route vẫn qua structural check1440/390/320; baseline JSON gốc không đổi.
- Sync documentation/design policy, design-system/daily-dashboard contracts/audits, code-map và documentation/audits/light-editorial-surfaces.md. Lint/tsc/production Docker build và6 Playwright UI tests đạt, container đã cập nhật.
- Không API/schema/auth/data thay đổi, không tạo/xóa tài khoản, không gọi AI. Không chạy lại full backend/provider tests vì chỉ đổi presentation. Full WCAG/native zoom/screen reader chưa chứng nhận; rollback bằng50197f5, giữ volumes.


### 2026-10-30 — Learning Passport: thiết kế lại view và edit profile

- Branch feature/profile-editorial-layout từ f7fa4cf; người dùng cho phép đổi layout /profile. Giữ editorial tokens, logo e và wireframe7 route khác.
- app/profile/page.tsx + profile.css: passport Cobalt với identity thật; goal nổi bật, phút/ngày lớn, facts; default view và inline editor hai cột. Mobile compact identity,320px chuyển một cột khi cần. Security/legacy import thành disclosure, giữ provider actions và ownership.
- View→Edit focus Tên; Cancel không PUT/discard form/return focus; saving khóa controls; failure giữ draft/alert; success PUT→GET→session refresh→view và header cập nhật. AccountSecurity tách state/status local.
- Sync profile README/system design/functions/UI/audit; design guide ghi ngoại lệ user-authorized; code-map thêm CSS và symbol. Audit nhóm documentation/audits/profile-layout-integration.md, ảnh view/edit desktop/mobile trong profile assets.
- Kiểm: lint/tsc/production Docker build,23 unit và13 E2E54.1s đều đạt. E2E gồm session/API/DB thật + mock UI cho cancel/failure/lock/long content;7 route khác so baseline không đổi. JSON wireframe gốc giữ nguyên, profile kiểm riêng do thay layout có yêu cầu.
- Không API/schema/migration mới, không thêm thông tin thành tích giả. Dọn riêng2 user QA; dữ liệu/session thật giữ nguyên. Google linking/reset Google-only thật, native zoom/screen reader không được chứng nhận lại; xem audit. Rollback bằng baseline f7fa4cf, giữ volume.


### 2026-10-30 — Editorial typography và quy chuẩn frontend

- Branch feature/editorial-design-system từ80e4247. Áp dụng Inter Variable5.3.0 self-host có Vietnamese, paper/white/ink/Cobalt; giữ logo e, wireframe, grid/container/spacing/breakpoint và logic học/auth.
- Thêm app/design-tokens.css, app/editorial.css, font license; cập nhật layout imports/Tailwind aliases và typography Dashboard. Headings UI uppercase, black labels, Cobalt số; quote/vertical/layer chỉ trong aria-hidden hero-art. Tên user, input, SRS/Hangul giữ tự nhiên; focus notebook nền đen dùng trắng. Khôi phục inset pl-10 cho search không đè icon.
- Lưu documentation/design/README.md và gallery8 màn hình trước/sau; AGENTS bắt buộc mọi FE đọc và tuân thủ. Sync feature UI, design-system contracts, code-map và audit nhóm documentation/audits/editorial-learning-ui.md.
- Kiểm: 23 unit, 11 E2E trên Docker production, lint/typecheck/build đạt; đối chiếu8 route ×1440/390/320 structural props, kiểm font/focus/text-spacing/overflow và review ảnh. Contrast token chính đạt mục tiêu; không tuyên bố toàn bộ WCAG hay tác dụng tâm lý tăng trí nhớ.
- Không migration, không đổi quyền/credential. E2E fixture users được dọn riêng, giữ dữ liệu/session thật. Rollback bằng code baseline80e4247, giữ volume. Native browser zoom200%/screen reader và dịch vụ ngoài không được chứng nhận lại trong lượt visual này.


### 2026-10-30 — Profile, Google avatar và audit tích hợp

- Branch feature/user-profile, nền tài liệu d151dcb (đồng bộ 14 feature và 8 màn hình trước viết code mới). Google lỗi invalid_client đã hết sau cập nhật môi trường của người dùng; chủ tài khoản xác nhận login thành công, SQL xác nhận provider/image/session.
- Thêm components/user-avatar.tsx, lib/profile.ts và lib/auth-errors.ts; sửa Shell pending/error/guest, avatar HTTPS/fallback và mobile selector chỉ ẩn tên. Không mount private page khi session chưa xác định. Giữ logo e và palette phẳng hiện hành.
- Profile GET chỉ trả safe user fields/provider names. PUT schema strict + transaction auth_user/profiles. UI có load/retry/save, refetch tên trên header, Google-linked notice và form password theo provider. Callback error có thông báo an toàn, wrapper log không chứa code/state/query.
- Kiểm tra cuối: 23/23 unit, 7/7 Playwright (32.2s), lint/typecheck, production Docker build và recreate app đều đạt. Playwright gồm email/session/API/DB thật và các UI mock để tái hiện failure; Google thật có xác nhận riêng. Đã xem ảnh desktop 1440/mobile390, không tràn ngang, avatar mobile visible.
- Cập nhật documentation profile/auth/design-system, code-map, audit nhóm và ảnh QA 6 màn hình. Nguồn chuẩn: documentation/audits/profile-auth-integration.md. Không có migration mới; cleanup đúng hai user QA, giữ nguyên account/session của chủ dự án và volume.
- Giới hạn: Google linking/Google-only tạo password chưa end-to-end với account thật; SMTP production, thiết bị thật thứ hai, STT/S3/Tutor và đề đầy đủ còn cần kiểm riêng. Mailpit chỉ inbox local verify/reset, không tham gia Google OAuth. Không push remote.


### 2026-10-30 — Chốt baseline trước đồng bộ tài liệu và feature hồ sơ

- Chuẩn bị commit các thay đổi EverLang đã thực hiện trong phiên, gồm quy tắc branch/tài liệu/audit; không đưa `.env`, log riêng tư hoặc thay đổi di chuyển `Project_IDEA.md` của người dùng vào commit.
- Truy vết lỗi được báo: log runtime ghi Google token exchange thất bại `invalid_client` / client secret không hợp lệ; database chưa có Google account và không có active session tại thời điểm kiểm tra. Chọn tài khoản Google chưa đồng nghĩa đăng nhập EverLang thành công.
- Chuỗi 401/409/404/403 trong log người dùng gửi khớp bài test quyền truy cập/concurrency ở `tests/e2e/beta.spec.ts`, không phải bằng chứng riêng của lỗi OAuth.
- UI Shell hiện chưa render `user.image`; đây là thiếu sót độc lập sẽ xử lý cùng feature profile sau khi đồng bộ docs hiện trạng.
- Đã yêu cầu người dùng cập nhật chính xác `GOOGLE_CLIENT_SECRET` trực tiếp trong môi trường cục bộ; chưa tự thay giá trị bằng suy đoán từ ảnh.


### 2026-10-30 — Quy tắc branch, audit và tài liệu feature đối chiếu code

- Bổ sung `AGENTS.md`: branch có prefix theo mục đích + mô tả kebab-case + ticket tùy chọn; audit từng feature/nhóm feature và các kết nối UI–auth–API–worker–DB–UI trước bàn giao.
- Bắt buộc tài liệu chuẩn tại `documentation/features/<feature-id>/`: đặc tả/tiêu chí và traceability, system design, function description, UI và audit. Code/docs đối chiếu hai chiều theo ID + file/symbol/route + bằng chứng; không đánh dấu hoàn tất khi yêu cầu bắt buộc chưa đạt/chưa kiểm chứng.
- Tạo `documentation/README.md` và 5 file mẫu tại `documentation/templates/feature/`; thêm liên kết mục lục trong README root. Tài liệu shared và audit nhóm có vị trí chuẩn, được tạo khi cần.
- Đây là thay đổi quy tắc/tài liệu; chưa backfill hoặc tuyên bố mọi feature legacy đã đạt chuẩn mới. Khi sửa feature cũ phải bổ sung bộ tài liệu cùng thay đổi.
- Kiểm tra: 19 liên kết nội bộ trong AGENTS/bộ tài liệu mới hợp lệ; 5 tên branch mẫu qua `git check-ref-format --branch`; `git diff --check` đạt. Không cần build/recreate hoặc chạy test ứng dụng cho thay đổi chỉ tài liệu này.
- File: `AGENTS.md`, `README.md`, `documentation/README.md`, `documentation/templates/feature/{README,system-design,functions,ui,audit}.md`, `HANDOFF.md`.


### 2026-10-30 — Theme màu phẳng xanh cobalt và vàng chanh theo ảnh tham khảo

- Chuyển từ nền xanh nhạt/gradient sang palette xanh cobalt và vàng chanh lấy cảm hứng từ hai ảnh người dùng: hero/trang giới thiệu vàng chanh, CTA và điều hướng xanh, thẻ nội dung trắng, sổ tay xanh tương phản.
- Loại gradient, quầng sáng, backdrop blur và bóng trang trí; dùng mảng màu phẳng, khoảng cách và viền mảnh. Giữ logo chữ e và viền nhẹ, đồng bộ icon SVG.
- File: `app/globals.css`, `components/dashboard.tsx`, `app/icon.svg`.
- Xác minh đạt: lint/typecheck, Docker production build/recreate app và 2 scenario Playwright hiện có. Đã xem trực tiếp trang đăng nhập, ảnh dashboard desktop 1440px/mobile 390px; không tràn ngang. Đã dọn hai tài khoản QA sau test. Ảnh trong `.local/everlang-dashboard-desktop.png` và `.local/everlang-dashboard-mobile.png` (gitignored).


### 2026-10-30 — Khôi phục logo chữ e, giảm độ đậm viền

- Theo yêu cầu người dùng, thay logo sách mới bằng chữ e trắng nghiêng trên nền xanh và điểm nhấn ngôi sao nhỏ như nhận diện cũ; viền xanh mảnh 1px, bóng mềm, đồng bộ favicon SVG.
- File: `components/shell.tsx`, `app/globals.css`, `app/icon.svg`.
- Xác minh đạt: lint/typecheck, Docker production build/recreate app và smoke Playwright responsive/anonymous isolation. Đã xem trực tiếp logo chữ e viền mảnh trên trang đăng nhập, đồng bộ favicon SVG.


### 2026-10-30 — Thay Neo-brutalism bằng giao diện hiện đại, tối giản

- Thiết kế lại hệ màu/surface dùng chung: nền xanh xám rất nhạt, thẻ trắng, viền mảnh, bóng mềm, chữ xanh đậm; giảm vàng thành điểm nhấn, tăng khoảng thở và chuẩn hóa input/button/nav.
- Thay logo viền đen/bóng cứng bằng biểu tượng sách gradient; cập nhật icon SVG. Dashboard dùng thẻ từ vựng nhẹ thay minh họa nghiêng; trang đăng nhập dùng khối màu mềm, bỏ nét đen dày.
- File: `app/globals.css`, `app/icon.svg`, `components/shell.tsx`, `components/dashboard.tsx`, `app/sign-in/page.tsx`.
- Xác minh đạt: lint/typecheck, production Docker build/recreate app và 2 scenario Playwright hiện có. Đã xem ảnh desktop 1440px/mobile 390px, không tràn ngang; luồng email, nháp, SRS và dashboard vẫn hoạt động. Đã dọn tài khoản QA sau test. Ảnh kiểm thử trong `.local/everlang-dashboard-desktop.png` và `.local/everlang-dashboard-mobile.png` (gitignored).


### 2026-10-30 — Xác nhận callback Google đã khớp

- Người dùng bổ sung ảnh cấu hình Authorized JavaScript origins/redirect URIs. Đã thử lại nút Google từ EverLang trong phiên trình duyệt mới.
- Kết quả: Google đã chuyển đến trang đăng nhập với nhãn ứng dụng EverLang; không còn lỗi `redirect_uri_mismatch`. Không lưu URL OAuth chứa state vào tài liệu.
- Giới hạn: chưa đăng nhập tài khoản Google/đồng ý quyền nên chưa xác minh token exchange và session cuối cùng. Không thay mã hay credential trong lượt này.


### 2026-10-30 — Cấu hình Google OAuth từ thông tin người dùng cung cấp

- Lưu `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào `.env` cục bộ (gitignored), recreate app/worker/migrate bằng image hiện tại. Không ghi giá trị credential vào source/tài liệu/log.
- Xác minh: `GET /api/config` trả HTTP 200 với `google: true`; tải lại trang đăng nhập đã hiển thị và bật nút Google. Bấm nút chuyển sang accounts.google.com thành công nhưng Google trả HTTP OAuth error 400 `redirect_uri_mismatch`.
- Callback app gửi: `http://localhost:3000/api/auth/callback/google`. Cần thêm chính xác URL này vào Authorized redirect URIs của OAuth client trong Google Cloud; không sửa callback chuẩn của app để đoán URL đã đăng ký.
- Chưa kiểm thử được token exchange/tạo session Google. Google Cloud Console trong trình duyệt của phiên hiện tại yêu cầu đăng nhập nên chưa thể chỉnh cấu hình tài khoản bên ngoài. OAuth consent screen trong ảnh còn Testing; cần Production để dùng mọi tài khoản Google.
- File liên quan: `.env` cục bộ; `HANDOFF.md`, `FEATURE_AUDIT.md`. Không thay mã ứng dụng trong lượt này.


### 2026-10-30 — Mở đăng ký/đăng nhập cho mọi email

- Bỏ hoàn toàn kiểm tra danh sách mời ở Better Auth và API cá nhân; loại `BETA_ALLOWED_EMAILS` khỏi Compose, cấu hình mẫu và môi trường cục bộ. Giữ xác minh email, session, quyền sở hữu và phân quyền admin qua `ADMIN_EMAILS`.
- Giao diện đăng nhập không còn thông báo email được mời; nút Google luôn hiển thị và chỉ bật khi có cấu hình OAuth. Config API trả no-store để phản ánh cấu hình hiện tại.
- File: `lib/auth.ts`, `lib/api.ts`, `app/sign-in/page.tsx`, `app/api/config/route.ts`, `docker-compose.yml`, `.env.example`, `README.md`, `tests/e2e/beta.spec.ts`.
- Kiểm tra đạt: lint/typecheck, 10 unit tests, production Docker build/recreate và 2 scenario Playwright. Hai email QA đăng ký/xác minh/đăng nhập thành công khi không còn cấu hình mời; kiểm tra nháp, SRS, quyền sở hữu và reset mật khẩu vẫn đạt. Đã dọn hai tài khoản QA sau kiểm thử. Google chưa kiểm thử thật do thiếu credential.
- Google: môi trường cục bộ chưa có `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; đã yêu cầu người dùng điền credential mới vào `.env`, không gửi secret qua chat. Chưa thể xác nhận đăng nhập Google thật.


### 2026-10-29 — Triển khai và audit EverLang beta

- Đổi thương hiệu/theme; tách module practice và thêm dashboard, tài khoản, kho từ/SRS, quản trị, nghe–đọc–nói, trợ giảng và engine bài luyện thi.
- Stack: Better Auth + PostgreSQL/Drizzle cho dữ liệu cá nhân; MongoDB cho học liệu; Redis/BullMQ cho cache/hàng đợi; tích hợp S3, Google Speech và pgvector qua cấu hình môi trường.
- File chính: `app/`, `components/`, `lib/sql/`, `lib/learning/`, `scripts/`, `migrations/`, Docker/Compose, `FEATURE_AUDIT.md`.
- Sao lưu MongoDB trong `.local/backups/` (gitignored); đã phục hồi thử vào database riêng: 100 học liệu, 5 bài chấm, 0 lỗi. Không sửa dữ liệu gốc khi nhập lịch sử.
- Xác minh: 10 unit tests, lint/typecheck, Docker production build và 2 scenario Playwright đạt; có kiểm thử AI thật, email verify/reset, admin lifecycle, mini exam, quyền sở hữu và cạnh tranh SRS. PostgreSQL dump/restore đã xác minh ở database riêng; CLI import fixture lần đầu 1/lặp lại 0. Google OAuth/STT/S3/Tutor chưa kiểm thử dịch vụ thật.
- Bảo mật: chỉ cấu hình tên biến trong tài liệu; OAuth secret trong ảnh phải thay, không đưa vào source/handoff. Email quản trị được cấu hình trong môi trường cục bộ.
- Việc còn lại: credential Google mới, chủ tài khoản đăng ký/xác minh và xác nhận UUID legacy; dịch vụ speech/storage/Tutor, kiểm định nội dung và rollout VPS. Bằng chứng/giới hạn chi tiết trong `FEATURE_AUDIT.md`.


### 2026-10-29 — Bỏ qua dấu câu khi chấm bản dịch

- Yêu cầu: không quan trọng bài làm có dấu câu hay không.
- File: `lib/ai.ts` — bổ sung prompt bỏ qua việc có/thiếu/khác dấu câu khi tính điểm và nhận xét; không tạo lỗi ngữ pháp, gợi ý từ vựng hoặc giải thích chỉ để sửa dấu câu. Thêm ví dụ `해방시키는 것이다` tương đương `해방시키는 것이다.`; vẫn kiểm tra đuôi câu tiếng Hàn như ngữ pháp.
- Kiểm tra: ESLint cho `lib/ai.ts` và TypeScript `npx tsc --noEmit` thành công. Chưa gọi AI thật để xác minh phản hồi và chưa rebuild Docker trong lượt này.
- Áp dụng: kết quả đã lưu giữ nguyên; sau khi triển khai bản mới, bấm **Chấm lại bằng AI** để chấm bài cũ theo prompt mới.


### Nền tảng và dữ liệu

- Dựng ứng dụng Next.js App Router + TypeScript + Tailwind; chuyển 100 câu từ HTML tham khảo vào JSON seed; xây API danh sách/lọc/phân trang, sinh bài, chấm và thống kê.
- Tạo model Mongoose cho bài tập, bài chấm và trạng thái bài tập theo người dùng ẩn danh.
- Thêm Dockerfile, Compose, MongoDB 8, volume, healthcheck, cấu hình môi trường và hướng dẫn log production.

### Trải nghiệm học và từ điển

- Bổ sung xem đánh giá đã lưu để tránh gọi AI lại không cần thiết; chấm lại có chủ đích.
- Bổ sung lịch sử bài đã chấm và yêu thích; thống kê tính theo số bài riêng, không theo số lượt chấm.
- Bổ sung gợi ý từ vựng vừa phải theo câu nguồn.
- Bổ sung chọn từ/cụm từ, popup từ điển có thể cuộn/tương tác, đánh dấu từ, phát âm; hỗ trợ KRdict và mở từ điển ngoài khi không tìm thấy mục phù hợp.

### OpenRouter và độ ổn định chấm

- Loại Gemini khỏi luồng AI; nhà cung cấp hiện tại là OpenRouter.
- Đã xử lý các tình huống model free trả rỗng, JSON sai/cắt cụt, reasoning chiếm hết token, model slug không còn miễn phí và lỗi upstream; có log phục vụ chẩn đoán.
- Model đang đặt là `qwen/qwen3.8-flash` (model trả phí theo mức sử dụng). `lib/ai.ts` tắt reasoning cho model này, yêu cầu JSON mode và giới hạn cấu trúc bằng schema.
- Prompt chấm nhấn mạnh chỉ đánh giá bản tiếng Hàn người học nhập; lọc đầu ra để lỗi ngữ pháp/từ vựng phải trích nguyên văn tiếng Hàn từ bài làm, không được phê bình câu nguồn tiếng Việt. Xếp loại được tính nhất quán từ điểm số.
- Phiên trước đã chạy ESLint, kiểm tra TypeScript, thử một request OpenRouter tối thiểu và build/recreate Docker. Ở bước tổng kết hiện tại xác nhận container đang chạy và trang trả HTTP 200.

## File đã thay đổi hoặc tạo

### Ứng dụng và API

- `app/page.tsx` — giao diện luyện tập, trạng thái, lịch sử/yêu thích, popup tra cứu và kết quả chấm.
- `app/globals.css`, `app/layout.tsx` — giao diện responsive và metadata/layout.
- `app/api/sentences/route.ts` — danh sách/lọc/phân trang và nạp seed.
- `app/api/sentences/generate/route.ts` — sinh bài qua AI.
- `app/api/submissions/grade/route.ts` — xác thực đầu vào, dùng báo cáo đã lưu hoặc chấm/lưu mới.
- `app/api/submissions/route.ts` — lịch sử bài đã chấm.
- `app/api/user/stats/route.ts`, `app/api/user/favorites/route.ts` — thống kê và yêu thích.
- `app/api/dictionary/route.ts` — tra KRdict.

### Dữ liệu và thư viện

- `data/seed-sentences.json` — 100 bài nhập từ HTML tham khảo.
- `lib/ai.ts` — tích hợp OpenRouter, schema, prompt chấm/sinh bài, phục hồi JSON và ánh xạ lỗi.
- `lib/db.ts`, `lib/logger.ts`, `lib/user-id.ts`, `lib/types.ts` — kết nối MongoDB, log có cấu trúc, định danh người dùng và kiểu/chủ đề/cấp độ.
- `lib/models/Sentence.ts`, `lib/models/Submission.ts`, `lib/models/UserSentenceState.ts` — schema MongoDB.
- `scripts/extract-seed.py` — trích dữ liệu seed từ HTML.
- `scripts/start-standalone.mjs` — khởi chạy Next standalone trong container.

### Build, cấu hình, tài liệu

- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `dockerRebuild.ps1` — Docker/build/rebuild.
- `.env.example` — tên biến và cấu hình mẫu; file `.env` thực tế không được ghi vào handoff.
- `package.json`, `package-lock.json`, `next.config.ts` — dependencies và cấu hình Next.
- `README.md` — hướng dẫn chạy, API, log, KRdict; đã đồng bộ model mặc định với Qwen trong lần cập nhật handoff.
- `AGENTS.md` — quy tắc Next.js hiện hữu và quy tắc cập nhật handoff sau mọi thay đổi.
- `Project_IDEA.md` — ý tưởng/định hướng dự án ban đầu.

## Cấu hình và lưu ý kỹ thuật

- Cần các biến: `MONGODB_URI`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `KRDICT_API_KEY`, `LOG_LEVEL`. Chỉ `OPENROUTER_API_KEY` bắt buộc cho sinh/chấm AI; MongoDB cần cho dữ liệu bài học và trạng thái.
- `.env` chứa thông tin nhạy cảm và không được commit/hiển thị. Một API key từng được dán vào cuộc trò chuyện; nên thu hồi/rotate các key đã chia sẻ công khai và chỉ dùng key mới trong `.env`. Tuyệt đối không đưa giá trị key vào handoff/log.
- Compose mặc định dùng `mongodb://mongo:27017/korean_practice`; URI `localhost` trong container sẽ không trỏ tới Mongo container.
- Khi thay đổi biến môi trường/Docker hoặc dependency, cần recreate/build lại container để cấu hình được áp dụng. Lệnh thông dụng: `docker compose up --build -d`.
- Log: `docker compose logs -f --tail=100 app`; mỗi response API có `x-request-id`. Không log request body/bản dịch/key.
- Nếu model đổi, kiểm tra slug, quyền truy cập, response format và reasoning behavior của model; không giả định model free có sẵn mãi. Cache đánh giá cũ không tự được thay bằng kết quả model mới; dùng nút chấm lại để tạo báo cáo mới.
- Quy tắc Next.js được generate trong block đánh dấu ở `AGENTS.md`; không sửa/xóa block này nếu không cần. Quy tắc handoff được thêm bên ngoài block.

## Bước tiếp theo

1. Nếu muốn xác nhận đầu cuối model mới, thử chấm một bài dịch thực tế và kiểm tra cả chất lượng, báo cáo lưu MongoDB, nút xem lại/chấm lại. Chưa xác minh end-to-end bài chấm Qwen mới trong phiên gần nhất.
2. Cập nhật/rotate các khóa đã từng chia sẻ, kiểm tra `.env` cục bộ (không in giá trị ra log/chat) và xác nhận OpenRouter còn quota/tài khoản hoạt động.
3. Khi phát triển feature hoặc sửa lỗi tiếp theo, cập nhật nhật ký ở đầu `HANDOFF.md` theo quy tắc trong `AGENTS.md`, bao gồm file, xác minh và việc còn lại.

## Nhật ký thay đổi

### 2026-10-29 — Qwen 3.8 Flash và handoff

- Chuyển mặc định OpenRouter sang `qwen/qwen3.8-flash`; tắt reasoning cho model này.
- Siết prompt và lọc phản hồi chấm để không coi câu tiếng Việt nguồn là bài làm/lỗi tiếng Hàn.
- Đồng bộ hướng dẫn model trong README; bổ sung quy tắc ghi handoff sau mỗi thay đổi.
- Xác minh trong lượt này: seed có 100 câu, Docker app/Mongo đang chạy, trang chủ trả HTTP 200. Build, lint/typecheck và request OpenRouter tối thiểu đã chạy ở phần trước của phiên.
- Việc còn lại: kiểm thử thủ công một bài dịch đầy đủ với model mới.
