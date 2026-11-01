# EverLang — checkpoint chuẩn bị sprint tiếp theo

## Cập nhật hiện hành — 2026-11-01

Backend hiện chạy native NestJS/JWT sau cutover008 trên localhost:3000: web/API/worker riêng, access RAM/Bearer, rotating HttpOnly refresh, global exception/filter và log requestId xuyên BullMQ. 20 bảng bảo toàn và Mongo6collections/172docs đã restore/hash-check; backup PG/Mongo/Redis/media/env giữ riêng ngoài Git. Old sessions invalidated, đăng nhập lại. Không Better Auth/Next backend runtime, old endpoints404; checkpoint offline trước migration giữ để rollback qua full restore.

77unit và các native auth/business/worker/private-audio/UI gates đã qua. Google live trên Nest, cloud AI/ASR/KRdict/Tutor/SMTPproduction vẫn NOT VERIFIED theo phạm vi; không tái sử dụng kết quả backend cũ như chứng nhận mới. PB-039 ở Review, sprint vẫn Proposed, không full feature Done. Đọc [migration audit](features/backend-nestjs-migration/audit.md) và [verification](features/backend-nestjs-migration/assets/verification.md) trước phát triển tiếp.

Phần snapshot2026-10-31 bên dưới là inventory nền/lịch sử; các mô tả framework/auth cũ đã được thay bởi hợp đồng Nest hiện hành trong documentation/shared và feature docs.


Snapshot mới nhất: **2026-10-31**. Bản nén ngữ cảnh bên dưới thay phần baseline lịch sử về trạng thái hiện tại. Chi tiết và lịch sử giữ ở [HANDOFF](../HANDOFF.md); nguồn trạng thái task là [work-items.json](planning/work-items.json). Đây là checkpoint kỹ thuật local, chưa hoàn tất toàn bộ mục tiêu tự học hoặc đủ điều kiện phát hành.

## Đọc khi tiếp tục

Đọc [AGENTS](../AGENTS.md) → tài liệu này → [completion matrix](planning/SELF_STUDY_DELIVERY.md) → [Dashboard](planning/DASHBOARD.md)/[planning guide](planning/README.md) → đủ5docs của feature sắp sửa. Frontend theo [Editorial](design/README.md); trước code Next đọc guide tương ứng trong node_modules/next/dist/docs. Kiểm branch/status và tạo branch đúng scope từ main đã tích hợp.

## Inventory17feature/domain hiện có

| Feature chuẩn | Đã có | Giới hạn chính |
|---|---|---|
| [identity-auth](features/identity-auth/README.md) | Email/password, verify/reset, Google login, session/role/ownership | Google owner login/local email đã kiểm; public OAuth/linking/SMTPproduction còn gate. |
| [user-profile](features/user-profile/README.md) | Learning Passport view/edit, avatar, mục tiêu/trình độ/phút/múi giờ; cancel/error/refetch | Provider security flows/thiết bị thật còn giới hạn trong audit. |
| [translation-practice](features/translation-practice/README.md) |100bài gốc, list/card, lọc/tìm, input/gợi ý/đáp án, player mẫu/reference | Cần duyệt chất lượng/quyền corpus; TTS không có seek/totalduration thật. |
| [learning-records](features/learning-records/README.md) | Nháp local/cloud versioned, history/favorites, thống kê/sổ lỗi theo user | Legacy import explicit; không tự gán dữ liệu cũ. |
| [ai-grading](features/ai-grading/README.md) | SQL→BullMQ→OpenRouter→Zod; dedup/cache/version, bỏ lỗi chỉ dấu câu;429cooldown/retry3/recovery | Chưa xác minh quota upstream hồi phục hoặc benchmark được người chấm duyệt. |
| [vocabulary-srs](features/vocabulary-srs/README.md) | Kho cá nhân, FSRS-7/due/review log, sense-aware save/cross-set/attach giữ lịch | Không tạo SRS thứ hai hoặc coi pronunciation là lịch ôn. |
| [daily-dashboard](features/daily-dashboard/README.md) | Ôn→bài dở→điểm yếu→bài mới, minutes/day/timezone/task/version | Diagnostic/lộ trình thích nghi chưa hoàn thiện. |
| [dictionary](features/dictionary/README.md) | Chọn/nhấp từ, popup KRdict, phát âm/link ngoài | Provider cần KRDICT_API_KEY; full morphology/context learning còn thiếu. |
| [content-authoring](features/content-authoring/README.md) | Admin draft→reviewed→published, source/rights/revision, AI nháp | Published immutable; AI/seed không tự được duyệt hoặc xuất bản. |
| [immersive-learning](features/immersive-learning/README.md) |2bài đọc, transcript/dictation/shadowing/local recording; icon player cho read/listen/speak |1player active, reset đúng khi đổi câu/bài/tab; corpus/audio mở rộng và giọng thiết bị thật chưa đủ. |
| [ai-tutor](features/ai-tutor/README.md) | RAG/pgvector/hints/reveal/sources | Provider/index/quality thật chưa audit đủ; embedding là action admin có chi phí. |
| [exam-practice](features/exam-practice/README.md) | Mini TOPIKII PBT, timer/autosave/objective grading/AIWriting | Chưa đủ full corpus/rights/PBT; Speaking/IBT chưa hoàn thiện. |
| [design-system](features/design-system/README.md) | Logoe, Inter tự host, paper/ink/Cobalt, surfaces sáng, responsive/focus | Scoped audit có; chưa chứng nhận fullWCAG/native zoom/screenreader. |
| [platform-operations](features/platform-operations/README.md) | Node24/Next16.4.3, PG/Mongo/Redis/BullMQ/Docker, migrations001–007, docs/planning checks | API requestId/logging có sẵn; thêm pg idle-error listener, worker fatal/guarded recovery/shutdown. Production/restore môi trường đích còn gate. |
| [knowledge-library](features/knowledge-library/README.md) | Reader/search grammar/idiom/proverb/hanja/collocation/phonetics/article, bookmark/note/resume/read, MCQ/cloze, SRS, admin revisions | Kho hệ thống languageko, state riêng user, unsupportedlanguage400.13draft theo checkpoint; comparison/mastery và ownerreview chưa xong. |
| [self-hosted-speech](features/self-hosted-speech/README.md) | Thu/import từ/câu20s, preview/consent/private history/play/delete/outbox; WhisperCPU option/Gemini adapter20calls/day | Runtime disabled: thu/nghe local. Cloud key thử vẫn timeout; chưa scoring pronunciation/physicalquality. STT/embedding không là điểm phát âm. |
| [vocabulary-catalog](features/vocabulary-catalog/README.md) | Taxonomy/senses/sets pinrevision, ví dụ/TTS, quota/CAS/self-report, save/legacy attach vào FSRS | Kho hệ thống ko; published dùng chung, lưu riêng. Final53draft=30sense+23set/0published; full corpus/audio curated chưa có. |

Routes: `/`, `/sign-in`, `/practice`, `/vocabulary`, `/word-sets`, `/knowledge`, `/library`, `/speech`, `/exams`, `/profile`, `/admin`, `/admin/knowledge`, `/admin/word-sets`. Có route không đồng nghĩa provider/chất lượng đã nghiệm thu.

## Tích hợp và bằng chứng mới nhất

- Knowledge/private speech/catalog cùng migrations004–007 và backup/restore/bridge đã có evidence. Các sửa trong chat bổ sung kho hệ thống ko, worker PG crash/global boundaries/AI429 và player Library/Practice. Không đổi model/key/billing hoặc tự publish seed.
-74/74unit mới nhất; [retry failed grading](audits/grading-retry.md) bổ sung409/code và retry explicit cạnh lỗi, giữ draft/history. Checkpoint trước đạt lint/typecheck/Docker production42routes. Full lint có1warning sẵn trong .local không tracked; targeted lint sạch.
- [Audio UX](audits/sentence-audio-controls.md):3Playwright deployed3000/16.7s, lifecycle/read/listen/speak/reference/timeout/unsupported,1440/390/320+spacing. Speech/API fixtures, không là acoustic validation.
- [Worker/kho hệ thống](audits/system-library-worker-errors.md):2real auth/Mongo/PGE2E34.4s, isolation/CAS/quota/language; Redis cooldown/PG reconnect/fatal child probes,0cloudcalls. QA đã dọn.
- [Knowledge](audits/self-study-library-integration.md), [speech](audits/self-study-speech-integration.md), [catalog](audits/vocabulary-catalog-integration.md): các gate đã/chưa kiểm theo feature. [Audit checkpoint](audits/sprint-checkpoint-2026-10-31.md) ghi kiểm pre-merge của lượt tổng hợp.
- Docs17features/154source-config; planning38PBI/82tasks/6Proposed.8/82tasksDone theo tracking không có nghĩa10% hoàn thành toàn dự án.

## Runtime và Git

Source `D:/Project/langz`; tích hợp từ bugfix/sample-audio-player vào main bằng fast-forward, không squash/rewrite lịch sử. Lượt checkpoint chỉ docs/Git/checks, không deploy/call cloud hoặc push remote. App [localhost3000](http://localhost:3000), Mailpit [8025](http://localhost:8025); app/worker running và PG/Mongo/Redis/Mailpit healthy trong lần kiểm gần nhất.

Sau migration007 chỉ rollback bridge/newer, không dùng app trước bridge: xem [operations](shared/operations.md). UI rollback gần nhất everlang-before-sentence-controls:local; giữ volumes/backup. SPEECH_PROVIDER=disabled; không tự bật speech profile, billing, embedding hoặc xuất bản seed.

## Hai ưu tiên tiếp nối

1. **Nội dung và vòng tự học:** ownerreview13knowledge +30sense/23set; corpus/source/rights/audio chuẩn, grammar comparison/mastery và kết nối SRS/đọc–nghe. Refine acceptance/dependencies/capacity trước chọn scope.
2. **Âm thanh và gate tích hợp:** xác minh ASR cấu hình thấp/miễn phí với audio thật, benchmark pronunciation riêng; diagnostic/path/hội thoại theo completion matrix và audit hai thiết bị. Không dùng STTmatch/embedding chưa kiểm làm điểm phát âm.

Các sprint vẫn **Proposed**, giờ/tuần/capacity/start/endTBD. Merge không tự start sprint hoặc đánh dấu taskDone. Luyện thi đầy đủ, đa ngôn ngữ, billing/public hosting theo backlog đã thống nhất.

## Baseline lịch sử2026-10-30

Kế hoạch triển khai tiếp theo đã phân rã tại [WBS/backlog/sprints](planning/README.md), snapshot2026-10-31; phần dưới giữ tổng kết baseline2026-10-30.

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
