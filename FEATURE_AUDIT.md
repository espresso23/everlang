# EverLang — feature audit

Cập nhật 2026-10-30: Google login thật đã được xác nhận; profile/avatar/session UI đã sửa, 23 unit + 7 Playwright đạt. Tài liệu chuẩn hiện tại ở [documentation](documentation/README.md), [audit profile/auth](documentation/audits/profile-auth-integration.md). Bảng dưới giữ bằng chứng lịch sử.

Ngày: 2026-10-29. Audit sau triển khai trên Docker local. Không coi việc có mã nguồn là bằng chứng dịch vụ ngoài đã hoạt động.

| Wave | Chức năng đã triển khai | Trạng thái xác minh |
|---|---|---|
| 0 | EverLang, theme xanh/vàng, layout responsive, module luyện dịch | Đạt: production build Docker, Playwright desktop 1440px/mobile 390px, không tràn ngang |
| 0 | Sao lưu/khôi phục MongoDB | Đạt: 100 học liệu, 5 bài chấm, 0 lỗi phục hồi vào database riêng |
| 1 | Better Auth Google/email, verify/reset/change password, explicit linking, session | Email đạt: đăng ký/xác minh/login/logout/reset mật khẩu qua Mailpit; Google/linking chưa xác minh, cần credential mới và test user |
| 1 | PostgreSQL ownership, profile, cloud drafts/version conflict, favorites/history | Đạt: 2 tài khoản cách ly, nháp cloud và xung đột version; stats/history qua AI thật |
| 1 | CLI nhập lịch sử cũ có xác nhận, không sửa Mongo gốc | Đạt với fixture QA: nhập lần đầu 1, chạy lại 0; bản Mongo gốc được giữ. Lịch sử thật chưa gắn tài khoản vì cần xác nhận UUID chủ sở hữu |
| 2 | Worker chấm nền, cache theo model/prompt/content, chống trùng, retry | Đạt: OpenRouter thật → worker → PostgreSQL → báo cáo; bản chỉ khác dấu câu dùng chung cache |
| 2 | Sổ lỗi, lưu mẫu từ/ngữ pháp, quản trị draft/review/publish | Đạt: admin tạo nháp, chặn publish trước duyệt, duyệt/xuất bản thành công; sổ lỗi/lưu thẻ có UI |
| 3 | FSRS-7, kho từ, review log, optimistic locking | Đạt: JSON roundtrip FSRS, 4 mức ôn; 2 request cùng version trả 200/409, tài khoản khác không ôn được thẻ |
| 3 | Lịch ngày, ngân sách phút, ưu tiên, bỏ/đổi bài, streak | Đạt unit: ngân sách, thứ tự ưu tiên, múi giờ/nửa đêm/streak; integration: lịch không nhân khi refresh, chặn version cũ |
| 4 | Đọc, TTS trình duyệt, dictation, ghi âm/nghe lại cục bộ | Build đạt; có UI đọc/dictation, recorder cục bộ. Chưa kiểm thử microphone/TTS thiết bị thật; chưa có audio người bản ngữ |
| 4 | S3 riêng tư, Google STT, góp ý transcript | Có implementation; chưa có credential, chưa xác minh dịch vụ thật |
| 4 | pgvector + OpenRouter embeddings + Tutor gợi ý trước | Có implementation; cần tạo chỉ mục và xác minh chất lượng |
| 5 | Engine bài thi tính giờ, autosave, đáp án ẩn, chấm khách quan, AI viết | Đạt: mini có timer/autosave version, đáp án ẩn trước nộp, chặn tài khoản khác; nộp chấm Đọc 2/2, worker hoàn thành Viết rỗng 0 điểm. Chưa chuẩn hóa rubric Viết bằng người chấm |
| 5 | Kho đề TOPIK II PBT đầy đủ được phép sử dụng | Chưa có; beta chỉ có bài luyện mini tự biên soạn, không giả làm đề chính thức |
| Sau beta | TOPIK Speaking/IBT, IELTS/HSK/JLPT | Chưa triển khai; chỉ mở sau audit tiếng Hàn |

## Giới hạn phát hành

- Từ 2026-10-30, đăng ký mở cho mọi email; vẫn cần xác minh email. Không có thanh toán/quota kinh doanh.
- AI cần đánh giá chất lượng bằng bộ bài được người có chuyên môn duyệt; unit/integration không chứng minh độ chính xác sư phạm.
- Không có điểm phát âm hay quy đổi điểm luyện tập thành chứng chỉ.
- Domain/HTTPS, SMTP thật, credential OAuth mới, S3 và Google Speech phải được cấu hình trước khi kiểm thử các dịch vụ tương ứng.

## Bằng chứng kiểm thử cuối lượt

- `npm test`: 10 ca đạt (2 file); `npm run lint`, `npx tsc --noEmit`: đạt.
- Production image app/worker/migrate build thành công; không cần đưa secret vào image để build.
- Playwright: 2 scenario đạt, bao gồm SMTP verify/reset, quyền sở hữu, SRS cạnh tranh, lịch học, admin lifecycle, mini exam và một request AI thật.
- OpenRouter chấm đáp án tham khảo: 98/100 trong lượt QA cuối; đây là smoke test tích hợp, không thay thế bộ bài chuẩn có người chấm.
- `npm audit --omit=dev --audit-level=moderate`: 0 lỗ hổng tại thời điểm kiểm tra, không phải chứng nhận security audit toàn hệ thống.
- MongoDB restore kiểm tra: 100 bài/5 báo cáo, 0 lỗi; PostgreSQL dump/restore vào DB riêng: 2 tài khoản QA/1 thẻ/1 báo cáo khôi phục đúng tại thời điểm snapshot.
- Screenshot QA: `.local/everlang-dashboard-desktop.png`, `.local/everlang-dashboard-mobile.png` (gitignored).
- Tài khoản/quyền QA và học liệu fixture được dọn sau test. Bộ 100 câu và 5 bài chấm MongoDB ban đầu được giữ.

## Việc còn lại trước phát hành rộng

1. Thay Google OAuth secret đã lộ, cấu hình callback/test users; thử Google login và explicit linking.
2. Chủ tài khoản đăng ký/xác minh email; đối chiếu UUID trình duyệt cũ trước khi nhập 5 báo cáo thật.
3. Cấu hình/test S3 private + Google Speech; tạo chỉ mục và đánh giá Tutor bằng học liệu được duyệt.
4. Kiểm thử microphone/audio thật; bộ bài chuẩn có người chấm cho AI và nguồn/quyền sử dụng học liệu.
5. Hoàn thiện mô phỏng chia phiên PBT, kho đề đầy đủ có quyền sử dụng; TOPIK Speaking/IBT và các ngôn ngữ khác thuộc roadmap sau beta.
6. Domain/HTTPS/SMTP production và kiểm thử backup/rollback ở môi trường VPS mục tiêu.

## 2026-10-30 — Thay đổi chính sách đăng nhập

- Bỏ yêu cầu mời email ở cả bước tạo tài khoản và sử dụng API cá nhân.
- Giữ quyền admin riêng và cách ly dữ liệu theo session.
- Google chưa có credential trong môi trường cục bộ; nút đăng nhập hiển thị trạng thái chưa sẵn sàng khi chưa cấu hình.
- Đã build/recreate Docker; lint/typecheck/10 unit tests/2 scenario Playwright đạt. Đăng ký email không mời, xác minh, đăng nhập, reset và quyền sở hữu đã thử thật qua Mailpit. Google vẫn chưa xác minh do thiếu credential.

## 2026-10-30 — Kiểm tra Google OAuth thực tế

- Credential đã lưu trong `.env` cục bộ và áp dụng bằng recreate container; config API xác nhận Google enabled.
- Nút Google hiển thị/bật, request OAuth chuyển tới Google.
- **Chưa đạt end-to-end:** Google báo `redirect_uri_mismatch`. Cần đăng ký `http://localhost:3000/api/auth/callback/google` trong Authorized redirect URIs của client trên Google Cloud.
- Console hiện yêu cầu chủ tài khoản đăng nhập; chưa sửa cấu hình Google bên ngoài. Chưa chứng minh client secret/token exchange/session Google thành công.
- Nếu muốn mọi tài khoản Google đăng nhập, chuyển OAuth audience từ Testing sang Production. Không có app-level email invitation restriction.

## 2026-10-30 — Kiểm tra lại sau cập nhật redirect URI

- OAuth đã tới trang đăng nhập Google cho EverLang; lỗi `redirect_uri_mismatch` được khắc phục.
- Chưa hoàn tất đăng nhập tài khoản Google nên chưa xác minh token exchange và tạo session. Không đổi mã nguồn/credential trong lượt kiểm tra này.

## 2026-10-30 — Giao diện hiện đại, tối giản

- Bỏ kiểu viền đen/bóng lệch cứng và minh họa nghiêng của Neo-brutalism.
- Thay bằng thẻ trắng, viền mảnh, bóng mềm, nền xanh nhạt và logo sách gọn; thống nhất dashboard/auth/form/nav.
- Đạt: lint/typecheck, production Docker build/recreate app, 2 scenario Playwright hiện có. Đã kiểm tra ảnh desktop 1440px/mobile 390px và trang đăng nhập; không tràn ngang. Tài khoản QA được dọn sau test.

## 2026-10-30 — Tinh chỉnh nhận diện logo

- Theo phản hồi người dùng: khôi phục chữ e trắng nghiêng và ngôi sao nhỏ, giữ nền xanh; giảm viền xuống 1px xanh và dùng bóng mềm.
- Đồng bộ logo header và favicon SVG; phần giao diện hiện đại còn lại giữ nguyên.

## 2026-10-30 — Màu phẳng theo ảnh tham khảo

- Xanh cobalt/vàng chanh/trắng; không gradient, bóng trang trí hay nền kính mờ. Không dùng viền đen dày, bóng lệch cứng hoặc phong cách Neo-brutalism.
- Giữ logo chữ e và cấu trúc tính năng. Lint/typecheck, Docker build/recreate và 2 scenario Playwright đạt; đã kiểm tra ảnh dashboard desktop/mobile và trang đăng nhập. Tài khoản QA đã được dọn.
