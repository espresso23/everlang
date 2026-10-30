# EverLang — hiện trạng và hai hướng tiếp theo

Ngày tổng kết: 2026-10-30. Tổng hợp từ source và audit đã có; không thay thế đặc tả từng feature. Lượt này chỉ commit/push và đồng bộ tài liệu, không chạy lại toàn bộ kiểm thử hoặc triển khai feature mới.

## Đã có và đã được kiểm tra trong các lượt trước

| Nhóm | Kết quả |
|---|---|
| Nhận diện/UI | EverLang, logo e, Inter Variable tự host, editorial paper/ink/Cobalt; shared surfaces sáng, responsive desktop/mobile |
| Tài khoản | Email/password, verify/reset, Google login thật, cookie session, quyền learner/admin và cách ly dữ liệu; email local qua Mailpit |
| Hồ sơ | Learning Passport view/edit, avatar/fallback, mục tiêu/trình độ/phút/múi giờ; Cancel, giữ draft khi lỗi, lưu/refetch tên lên header |
| Luyện dịch | 100 bài tiếng Hàn, lọc/tìm/danh sách/thẻ; autosave nháp, đáp án/ngữ pháp/TTS; history/favorites và thống kê theo tài khoản |
| Chấm AI | OpenRouter + worker/queue, schema đầu ra, chống trùng/retry/cache, version prompt/model/rubric; bỏ qua dấu câu; đã chấm thật trong audit trước |
| Từ và lỗi sai | Tra từ, lưu từ/cụm/ngữ pháp từ báo cáo, sổ tay lỗi; các mảng nền đen đã chuyển sáng và kiểm empty/filled |
| SRS | ts-fsrs6.0.0 / FSRS-7, Again/Hard/Good/Easy, due/card/review log; kiểm concurrency/ownership |
| Dashboard | Ưu tiên ôn → bài dở → điểm yếu → bài mới, ngân sách phút/ngày, task/streak theo timezone, chống nhân lịch/version conflict |
| Học liệu/admin | Draft → reviewed → published, source/rights/version, AI nháp phải duyệt; quyền xuất bản ở server |
| Hạ tầng/dữ liệu | Next.js module + worker, PG/Drizzle, MongoDB, Redis/BullMQ, Docker; migration001–003; bản dữ liệu Mongo gốc giữ nguyên và CLI import legacy có đối chiếu |
| Tài liệu/quy trình | 14 feature/domain,8 màn hình; spec/system design/functions/UI/audit, code-map và docs checker; branch prefix và design policy trong AGENTS |

8 màn hình: /, /sign-in, /practice, /vocabulary, /library, /exams, /profile, /admin. Có màn hình không đồng nghĩa mọi dịch vụ phía sau đã được kiểm chứng.

## Có nền tảng nhưng chưa chốt chất lượng/phát hành

- Nghe/đọc/chép chính tả/thu âm: có UI/code; microphone/TTS cần thêm kiểm thiết bị thật và học liệu audio phù hợp.
- S3 riêng tư, Google Speech-to-Text và AI Tutor/pgvector: có tích hợp; chưa audit toàn bộ dịch vụ thật và chất lượng đầu ra.
- TOPIK: mini exam/timer/autosave/objective grading và nền AI Writing; chưa có kho đề đầy đủ chuẩn hóa/quyền sử dụng. Speaking/IBT là format riêng, chưa triển khai đầy đủ.
- Benchmark chữa bài AI bằng bộ bài được người có chuyên môn duyệt vẫn cần làm; một kết quả smoke test tốt không chứng minh chất lượng sư phạm tổng quát.
- Production: domain/HTTPS, SMTP gửi email thật, cấu hình OAuth công khai và vận hành/restore ở môi trường đích chưa chốt. Google login chủ tài khoản đã thành công; explicit linking và Google-only tạo password cần kiểm thật riêng.
- IELTS/HSK/JLPT, thanh toán và mở rộng đa ngôn ngữ chưa triển khai. Ảnh mô phỏng giấy Writing trong project-idea chỉ là ý tưởng, chưa là feature.

## Bằng chứng kiểm tra

- [Profile layout](audits/profile-layout-integration.md):23 unit +13 Playwright, lint/typecheck/production build trong lượt profile; real email/session/API/DB và UI mocks được phân biệt.
- [Làm nhẹ shared surfaces](audits/light-editorial-surfaces.md): lượt thay đổi UI mới nhất chạy6 Playwright có empty/filled notebook, structural1440/390/320, font/focus; lint/typecheck/Docker build đạt. Không chạy lại backend/provider cho thay đổi màu.
- Lượt bàn giao này: kiểm staged diff, quét pattern credential/private paths và docs:check; không gom .env, cache hoặc log vào Git.

## Hai hướng tiếp theo

1. **Hoàn thiện beta tự học tiếng Hàn — khuyến nghị.** Làm onboarding và lộ trình theo trình độ/chủ đề từ học liệu hiện có, mục tiêu học rõ và nội dung được duyệt; gắn chặt luyện dịch → chữa → lưu từ/lỗi → SRS → lịch ngày. Kèm benchmark chữa bài AI (lỗi thật/gợi ý, đáp án đa dạng, dấu câu) và kiểm vòng học trên hai thiết bị trước mở rộng kỹ năng.
2. **Đưa beta lên môi trường dùng thật.** Chốt domain/HTTPS/SMTP, cấu hình Google OAuth phù hợp phạm vi truy cập, deploy VPS, backup/restore và theo dõi lỗi; kiểm auth/reset/session/ownership thực tế. Phù hợp khi muốn dùng ngoài localhost hoặc mời người thử; làm sau khi chất lượng vòng tự học đủ ổn định.

Giữ luyện thi đầy đủ, mô phỏng giấy TOPIK và đa ngôn ngữ ở backlog cho đến khi vòng tự học ổn định, theo định hướng đã chọn.

[Mục lục feature](README.md) · [Quy chuẩn UI](design/README.md) · [Tech stack](shared/tech-stack.md) · [Ý tưởng/backlog](../project-idea/Project_IDEA.md).
