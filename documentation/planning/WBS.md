> Generated view — chỉnh work-items.json rồi chạy npm run plan:sync

# WBS — cấu trúc công việc

WBS chia theo deliverable; sprint là cách xếp lịch, không thay phân rã phạm vi. PB là ID nội bộ.

## WBS-0 / Baseline đã có

| Feature | Mức kiểm chứng | Nguồn |
| --- | --- | --- |
| identity-auth | Implemented / verified core; Google linking và SMTP production chưa đóng | [Spec](../features/identity-auth/README.md) / [audit](../features/identity-auth/audit.md) |
| user-profile | Verified scoped view/edit/avatar/save trên local | [Spec](../features/user-profile/README.md) / [audit](../features/user-profile/audit.md) |
| translation-practice | Implemented / verified scoped translation flow; chưa là curriculum | [Spec](../features/translation-practice/README.md) / [audit](../features/translation-practice/audit.md) |
| learning-records | Implemented / verified scoped ownership/drafts/history | [Spec](../features/learning-records/README.md) / [audit](../features/learning-records/audit.md) |
| ai-grading | Provider smoke verified; benchmark sư phạm chưa hoàn tất | [Spec](../features/ai-grading/README.md) / [audit](../features/ai-grading/audit.md) |
| vocabulary-srs | Verified scoped FSRS/concurrency; mastery/context cần mở rộng | [Spec](../features/vocabulary-srs/README.md) / [audit](../features/vocabulary-srs/audit.md) |
| daily-dashboard | Verified scoped rule/timezone/version; chưa có learning path | [Spec](../features/daily-dashboard/README.md) / [audit](../features/daily-dashboard/audit.md) |
| dictionary | Implemented KRdict + particle fallback; morphology còn thiếu | [Spec](../features/dictionary/README.md) / [audit](../features/dictionary/audit.md) |
| content-authoring | Implemented reviewed workflow; quality/rights từng nội dung phải duyệt | [Spec](../features/content-authoring/README.md) / [audit](../features/content-authoring/audit.md) |
| immersive-learning | Partial: 2 bài mẫu, audio/STT/S3/device cần xác minh thật | [Spec](../features/immersive-learning/README.md) / [audit](../features/immersive-learning/audit.md) |
| ai-tutor | Partial: implementation có, grounded benchmark/index cần xác minh | [Spec](../features/ai-tutor/README.md) / [audit](../features/ai-tutor/audit.md) |
| exam-practice | Partial: mini exam, chưa có bộ đề đầy đủ | [Spec](../features/exam-practice/README.md) / [audit](../features/exam-practice/audit.md) |
| design-system | Verified scoped UI; không chứng nhận full WCAG | [Spec](../features/design-system/README.md) / [audit](../features/design-system/audit.md) |
| platform-operations | Local Docker verified scoped; production/restore đích còn đầu vào | [Spec](../features/platform-operations/README.md) / [audit](../features/platform-operations/audit.md) |

## WBS-1 / Chất lượng và kiến thức ngữ pháp

Nội dung và chữa bài đủ tin cậy để tự học

- **WBS-1.01 / PB-001 — Trạm ngữ pháp: lát cắt đầu tiên** (P0, Core, S1).
  - PB-001-T01 — Đặc tả taxonomy, version, API và UI; tạo bộ5 docs feature trước code
  - PB-001-T02 — Schema/admin/learner search và detail; tận dụng workflow draft-review-published
  - PB-001-T03 — Kiểm learner/admin, tìm theo nghĩa/cấu trúc, empty/error; audit và handoff
- **WBS-1.02 / PB-002 — Bộ5 ngữ pháp mẫu đã duyệt** (P0, Core, S1).
  - PB-002-T01 — Biên soạn5 cấu trúc và ví dụ tự viết/nguồn được phép dùng
  - PB-002-T02 — Duyệt sắc thái, đáp án chấp nhận và tính nhất quán; lưu nhận xét
  - PB-002-T03 — Xuất bản đúng version và kiểm hiển thị từ tài khoản learner
- **WBS-1.04 / PB-004 — Benchmark chữa bài AI ban đầu** (P0, Core, S1).
  - PB-004-T01 — Duyệt20 cặp input/expected và ngưỡng chấp nhận; không lấy output AI làm ground truth
  - PB-004-T02 — Runner regression có version, phân loại failure và không lưu điểm giả khi provider lỗi
  - PB-004-T03 — Chạy baseline thật, lập report và xử lý lỗi P0; audit/handoff
- **WBS-1.05 / PB-005 — Tra cứu và so sánh ngữ pháp** (P0, Core, S2).
  - PB-005-T01 — Đặc tả search/filter và3 nhóm so sánh, cập nhật UI/functions
  - PB-005-T02 — Tìm kiếm và trang đối chiếu có link bài liên quan; loading/error/empty
  - PB-005-T03 — Kiểm kết quả tìm và sắc thái; responsive/accessibility, docs/audit
- **WBS-1.06 / PB-006 — Mở rộng pilot lên15 bài đã duyệt** (P0, Core, S2).
  - PB-006-T01 — Biên soạn10 bài bổ sung theo danh mục đã chốt
  - PB-006-T02 — Duyệt bài/ví dụ/cặp dễ nhầm và từ chối bài chưa đạt
  - PB-006-T03 — Publish kiểm đủ15 bài, search/index đúng và evidence nội dung
- **WBS-1.12 / PB-012 — Phản hồi chữa AI chưa đúng** (P0, Stretch, S3).
  - PB-012-T01 — Đặc tả trạng thái feedback, quyền và5 docs/cập nhật docs chuẩn
  - PB-012-T02 — Report issue→admin review→resolution lưu version/evidence
  - PB-012-T03 — Kiểm ownership, duplicate, privacy và đưa ca đã duyệt vào regression set
- **WBS-1.34 / PB-034 — Thư viện tra cứu: idiom, tục ngữ, tài liệu và đọc lại** (P0, Core, Unscheduled).
  - PB-034-T01 — Đặc tả loại tài liệu và hợp đồng đọc lại/ghi chú/ôn tập
  - PB-034-T02 — Triển khai idiom/tục ngữ/tài liệu và state đọc theo tài khoản
  - PB-034-T03 — Audit reader, isolation, concurrency, nội dung và bàn giao


## WBS-2 / Bài tập, SRS và năng lực

Học, dùng lại và ghi nhận mức nắm kiến thức

- **WBS-2.03 / PB-003 — Bài tập nhận biết và điền khuyết** (P0, Core, S1).
  - PB-003-T01 — Đặc tả5 docs, schema exercise/attempt/accepted answers và cơ chế reveal
  - PB-003-T02 — Dựng exercise renderer, deterministic grading và lưu attempt theo session
  - PB-003-T03 — E2E học bài→làm→giải thích; kiểm tamper/ownership/retry và handoff
- **WBS-2.07 / PB-007 — Nối ngữ pháp và lỗi sai vào SRS** (P0, Core, S2).
  - PB-007-T01 — Cập nhật spec/context mapping lesson-report-card; giữ card algorithm version
  - PB-007-T02 — Nút lưu từ lesson/report, chống trùng và mở đúng bài nguồn
  - PB-007-T03 — E2E lesson→card→review→lịch ngày; duplicate/concurrency và handoff
- **WBS-2.08 / PB-008 — Tiến độ theo cấu trúc kiến thức** (P0, Core, S2).
  - PB-008-T01 — Chốt mastery rules và5 docs; phép tính phải giải thích được cho learner
  - PB-008-T02 — Aggregate attempt/review theo grammar ID/version, hiển thị knowledge map
  - PB-008-T03 — Kiểm retry/multi-device không đếm trùng, recalculation và giải thích kết quả
- **WBS-2.18 / PB-018 — Thẻ ôn theo ngữ cảnh đa dạng** (P1, Core, S5).
  - PB-018-T01 — Chốt card presentation và accepted answers; không reset lịch cũ
  - PB-018-T02 — Context/card variants, source navigation và audio fallback
  - PB-018-T03 — Kiểm migration compatible nếu có, review concurrency và dữ liệu cũ
- **WBS-2.35 / PB-035 — Bộ từ vựng đời sống và chuyên ngành có ví dụ** (P0, Core, Unscheduled).
  - PB-035-T01 — Đặc tả sense/version/taxonomy/UI/migration bridge trước code
  - PB-035-T02 — Triển khai catalog/admin/learn và sense-aware FSRS
  - PB-035-T03 — Audit actual services,rollback,quota,ownership và browser
  - PB-035-T04 — Biên soạn coverage và owner duyệt nội dung/audio liên quan


## WBS-3 / Lộ trình và cá nhân hóa

Biết nên học gì tiếp theo

- **WBS-3.09 / PB-009 — Onboarding cho người học trung-cao cấp** (P0, Core, S3).
  - PB-009-T01 — Đặc tả onboarding/skip/resume và cách phân biệt self-report với kết quả gợi ý
  - PB-009-T02 — UI/API lưu preferences vào profile hiện có; không thêm invitation gate
  - PB-009-T03 — Kiểm tài khoản mới/cũ, skip/resume/reset lựa chọn, focus và handoff
- **WBS-3.10 / PB-010 — Lộ trình học và học phần** (P0, Core, S3).
  - PB-010-T01 — Chốt2 học phần và quan hệ prerequisite không chu trình;5 docs
  - PB-010-T02 — Map grammar/lesson/exercise thành path, unlock/continue/progress theo account
  - PB-010-T03 — Kiểm prerequisite/skip/đổi level, nội dung và progress giữa2 trình duyệt
- **WBS-3.11 / PB-011 — Dashboard theo lộ trình và điểm yếu** (P0, Core, S3).
  - PB-011-T01 — Cập nhật mapping knowledge/path vào planning rule, không phá lịch đã tạo
  - PB-011-T02 — Tasks có nguồn/lý do và continue đúng lesson/path
  - PB-011-T03 — E2E vòng học, refresh/midnight/timezone/overload và audit liên kết


## WBS-4 / Nghe đọc và tra cứu trong ngữ cảnh

Mở rộng đầu vào ngôn ngữ

- **WBS-4.13 / PB-013 — Pilot5 bài đọc và3 đoạn nghe** (P1, Core, S4).
  - PB-013-T01 — Biên soạn5 bài đọc/3 đoạn nghe, xác định nguồn và quyền sử dụng
  - PB-013-T02 — Duyệt level, từ/cấu trúc mục tiêu và sự khớp audio-transcript
  - PB-013-T03 — Publish theo version; kiểm media lỗi và fallback learner
- **WBS-4.14 / PB-014 — Reader và audio theo đoạn** (P1, Core, S4).
  - PB-014-T01 — Đặc tả segment/time offsets, controls/keyboard và cập nhật5 docs
  - PB-014-T02 — Audio/reader segment controls và contextual vocabulary save
  - PB-014-T03 — Kiểm audio lỗi, seek/repeat/speed, transcript/privacy và responsive
- **WBS-4.15 / PB-015 — Hiểu bài và chép chính tả theo đoạn** (P1, Stretch, S4).
  - PB-015-T01 — Chốt bộ câu hỏi/đáp án cho pilot, schema reuse exercise engine
  - PB-015-T02 — Comprehension/dictation renderer, attempt và feedback theo ngữ cảnh
  - PB-015-T03 — Kiểm đáp án đa dạng, reveal, retries và liên kết lesson/mastery/SRS
- **WBS-4.16 / PB-016 — Spike xử lý dạng từ tiếng Hàn** (P1, Core, S4).
  - PB-016-T01 — Tạo30 ca trợ từ/chia động-tính từ/cụm/ambiguity và expected
  - PB-016-T02 — Thử2 phương án trong môi trường Docker; đo latency và failure modes
  - PB-016-T03 — ADR chọn phương án, giới hạn/fallback và refined backlog implementation
- **WBS-4.17 / PB-017 — Tra nguyên mẫu và cụm theo ngữ cảnh** (P1, Core, S5).
  - PB-017-T01 — Đặc tả contract/context/confidence và migration/cache rollback nếu cần
  - PB-017-T02 — Tích hợp phương án từ spike, lookup variants/cụm và source trace
  - PB-017-T03 — Chạy bộ morphology, timeout/cache/error và nối save vocabulary
- **WBS-4.19 / PB-019 — Nhập văn bản cá nhân để học** (P1, Stretch, S5).
  - PB-019-T01 — Đặc tả input limits/privacy/ownership/delete và5 docs
  - PB-019-T02 — Private text ingestion/reader/progress; không đưa vào thư viện chung mặc định
  - PB-019-T03 — Kiểm2 account, payload lớn/XSS/content lỗi và xoá dữ liệu cá nhân
- **WBS-4.20 / PB-020 — Hoàn thiện shadowing/thu âm riêng tư** (P1, Core, S5).
  - PB-020-T01 — Rà contract/storage/consent/retention và cấu hình bằng env, không lưu secret trong docs
  - PB-020-T02 — Hoàn tất recorder/STT/S3/replay và lỗi microphone/provider
  - PB-020-T03 — Kiểm thiết bị thật/signed URL/account isolation/delete và audio feedback
- **WBS-4.36 / PB-036 — Audio từ/câu có phiên bản và nguồn** (P1, Core, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-4.37 / PB-037 — Hội thoại theo tình huống và luyện dùng từ** (P1, Core, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-4.38 / PB-038 — Thu âm riêng tư, ASR API free tier và lựa chọn local CPU** (P0, Core, Unscheduled).
  - PB-038-T01 — Đặc tả ADR local storage, queue, runtime/model và UI trước code
  - PB-038-T02 — Triển khai private audio/API/worker/UI, Gemini free-tier adapter và local fallback
  - PB-038-T03 — Audit real engine/resource,ownership,UI,backup/restore và handoff
- **WBS-4.39 / PB-039 — Migrate backend NestJS/JWT va structured tracing** (P0, Core, Unscheduled).
  - PB-039-T01 — Migration implementation and auth/logging parity
  - PB-039-T02 — Independent audit, restore and cutover


## WBS-5 / Phát hành và vận hành beta

Dùng thật ngoài localhost với kiểm chứng đầy đủ

- **WBS-5.21 / PB-021 — Audit vòng tự học và chất lượng cuối** (P0, Core, S6).
  - PB-021-T01 — Chốt bộ acceptance end-to-end và bộ gold có version
  - PB-021-T02 — Chạy integration/Playwright + provider smoke phù hợp; triage lỗi theo mức độ
  - PB-021-T03 — Duyệt kết quả giáo dục, không dùng build pass thay teacher review
- **WBS-5.22 / PB-022 — Email/OAuth trên môi trường thật** (P0, Core, S6).
  - PB-022-T01 — Chốt domain/SMTP/Google audience và callback; secrets chỉ trong env
  - PB-022-T02 — Cấu hình môi trường và kiểm đường dẫn verify/reset/linking
  - PB-022-T03 — Kiểm2 account và session/revoke/logout/CSRF trên HTTPS thật
- **WBS-5.23 / PB-023 — Triển khai/backup/restore/quan sát lỗi** (P0, Core, S6).
  - PB-023-T01 — Runbook deploy/backup/restore/rollback và threat boundaries, không secrets
  - PB-023-T02 — Deploy staging, restore vào môi trường riêng, health/error monitoring
  - PB-023-T03 — Diễn tập rollback/recovery, data count/isolation và lưu evidence đã redacted
- **WBS-5.24 / PB-024 — Gate phát hành beta và bàn giao** (P0, Core, S6).
  - PB-024-T01 — Sync5 docs mỗi feature + code-map/HANDOFF, lint/typecheck/build/container
  - PB-024-T02 — Audit tách lượt spec→code→test→UI, xác nhận không còn release blocker
  - PB-024-T03 — Go/no-go và release notes; approval phát hành cụ thể ở bước cuối
- **WBS-5.40 / PB-040 — Migrate PostgreSQL access to TypeORM; preserve Mongoose ODM** (P0, Core, Unscheduled).
  - PB-040-T01 — Entity mapping and runtime ORM migration
  - PB-040-T02 — Independent audit, migration adoption and integration verification
- **WBS-5.41 / PB-041 — Replace MongoDB with PostgreSQL primary business storage** (P0, Core, Unscheduled).
  - PB-041-T01 — PostgreSQL-only migration increment: learning/admin, preservation and runnable demo
  - PB-041-T02 — Owner QA PostgreSQL-only learning and authoring increment
  - PB-041-T03 — Owner post-merge production release decision after QA
- **WBS-5.42 / PB-042 — Không gian quản trị và role-aware login** (P0, Core, Unscheduled).
  - PB-042-T01 — Admin login → workspace → editor → học tập; role gates và browser audit


## WBS-6 / Mở rộng sau beta

Giữ trong backlog, chưa cam kết sprint

- **WBS-6.25 / PB-025 — AI Tutor truy xuất đã đánh giá chất lượng** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.26 / PB-026 — Đánh giá phát âm chuyên biệt** (P1, Core, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.27 / PB-027 — TOPIK II PBT đầy đủ** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.28 / PB-028 — Giấy viết TOPIK mô phỏng** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.29 / PB-029 — TOPIK Speaking và IBT riêng** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.30 / PB-030 — IELTS/HSK/JLPT từng ngôn ngữ** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.31 / PB-031 — Thanh toán và gói dịch vụ** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.32 / PB-032 — Gamification/cộng đồng** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
- **WBS-6.33 / PB-033 — Lộ trình nhập môn Hangul/sơ cấp** (P2, Deferred, Unscheduled).
  - Cần refine/split/estimate trước khi lên sprint; không giả task đã có.
