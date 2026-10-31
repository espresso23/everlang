> Generated view — chỉnh work-items.json rồi chạy npm run plan:sync

# Task board

| Task | PB / Sprint | Task | Owner / role | Status | Readiness | Depends | Verification / evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PB-001-T01 | PB-001 / S1 | Đặc tả taxonomy, version, API và UI; tạo bộ5 docs feature trước code | Chủ dự án / Dev/PO | Done | Done | — | Pass: documentation/features/knowledge-library/README.md, documentation/features/knowledge-library/system-design.md, documentation/features/knowledge-library/ui.md |
| PB-001-T02 | PB-001 / S1 | Schema/admin/learner search và detail; tận dụng workflow draft-review-published | Chủ dự án / Dev | Done | Done | PB-001-T01 | Pass: documentation/features/knowledge-library/functions.md, documentation/features/knowledge-library/assets/verification.md, tests/e2e/knowledge.spec.ts |
| PB-001-T03 | PB-001 / S1 | Kiểm learner/admin, tìm theo nghĩa/cấu trúc, empty/error; audit và handoff | Chủ dự án / QA/Dev | In progress | Ready | PB-001-T02 | Not run: documentation/features/knowledge-library/audit.md, documentation/audits/self-study-library-integration.md |
| PB-002-T01 | PB-002 / S1 | Biên soạn5 cấu trúc và ví dụ tự viết/nguồn được phép dùng | Chủ dự án / Content | Todo | Waiting dependencies | PB-001-T03 | Not run: chưa có |
| PB-002-T02 | PB-002 / S1 | Duyệt sắc thái, đáp án chấp nhận và tính nhất quán; lưu nhận xét | Chủ dự án / Reviewer | Todo | Waiting dependencies | PB-002-T01 | Not run: chưa có |
| PB-002-T03 | PB-002 / S1 | Xuất bản đúng version và kiểm hiển thị từ tài khoản learner | Chủ dự án / Content/Dev | Todo | Waiting dependencies | PB-002-T02 | Not run: chưa có |
| PB-003-T01 | PB-003 / S1 | Đặc tả5 docs, schema exercise/attempt/accepted answers và cơ chế reveal | Chủ dự án / Dev/PO | Todo | Waiting dependencies | PB-001-T03, PB-002-T03 | Not run: chưa có |
| PB-003-T02 | PB-003 / S1 | Dựng exercise renderer, deterministic grading và lưu attempt theo session | Chủ dự án / Dev | Todo | Waiting dependencies | PB-003-T01 | Not run: chưa có |
| PB-003-T03 | PB-003 / S1 | E2E học bài→làm→giải thích; kiểm tamper/ownership/retry và handoff | Chủ dự án / QA/Dev | Todo | Waiting dependencies | PB-003-T02 | Not run: chưa có |
| PB-004-T01 | PB-004 / S1 | Duyệt20 cặp input/expected và ngưỡng chấp nhận; không lấy output AI làm ground truth | Chủ dự án / Reviewer/PO | Todo | Needs refinement | — | Not run: chưa có |
| PB-004-T02 | PB-004 / S1 | Runner regression có version, phân loại failure và không lưu điểm giả khi provider lỗi | Chủ dự án / Dev | Todo | Waiting dependencies | PB-004-T01 | Not run: chưa có |
| PB-004-T03 | PB-004 / S1 | Chạy baseline thật, lập report và xử lý lỗi P0; audit/handoff | Chủ dự án / QA/PO | Todo | Waiting dependencies | PB-004-T02 | Not run: chưa có |
| PB-005-T01 | PB-005 / S2 | Đặc tả search/filter và3 nhóm so sánh, cập nhật UI/functions | Chủ dự án / Dev/Content | Todo | Waiting dependencies | PB-001-T03, PB-002-T03 | Not run: chưa có |
| PB-005-T02 | PB-005 / S2 | Tìm kiếm và trang đối chiếu có link bài liên quan; loading/error/empty | Chủ dự án / Dev | Todo | Waiting dependencies | PB-005-T01 | Not run: chưa có |
| PB-005-T03 | PB-005 / S2 | Kiểm kết quả tìm và sắc thái; responsive/accessibility, docs/audit | Chủ dự án / QA/Reviewer | Todo | Waiting dependencies | PB-005-T02 | Not run: chưa có |
| PB-006-T01 | PB-006 / S2 | Biên soạn10 bài bổ sung theo danh mục đã chốt | Chủ dự án / Content | Todo | Waiting dependencies | PB-002-T03 | Not run: chưa có |
| PB-006-T02 | PB-006 / S2 | Duyệt bài/ví dụ/cặp dễ nhầm và từ chối bài chưa đạt | Chủ dự án / Reviewer | Todo | Waiting dependencies | PB-006-T01 | Not run: chưa có |
| PB-006-T03 | PB-006 / S2 | Publish kiểm đủ15 bài, search/index đúng và evidence nội dung | Chủ dự án / Content/QA | Todo | Waiting dependencies | PB-006-T02 | Not run: chưa có |
| PB-007-T01 | PB-007 / S2 | Cập nhật spec/context mapping lesson-report-card; giữ card algorithm version | Chủ dự án / Dev | Todo | Waiting dependencies | PB-003-T03 | Not run: chưa có |
| PB-007-T02 | PB-007 / S2 | Nút lưu từ lesson/report, chống trùng và mở đúng bài nguồn | Chủ dự án / Dev | Todo | Waiting dependencies | PB-007-T01 | Not run: chưa có |
| PB-007-T03 | PB-007 / S2 | E2E lesson→card→review→lịch ngày; duplicate/concurrency và handoff | Chủ dự án / QA | Todo | Waiting dependencies | PB-007-T02 | Not run: chưa có |
| PB-008-T01 | PB-008 / S2 | Chốt mastery rules và5 docs; phép tính phải giải thích được cho learner | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-003-T03, PB-007-T03 | Not run: chưa có |
| PB-008-T02 | PB-008 / S2 | Aggregate attempt/review theo grammar ID/version, hiển thị knowledge map | Chủ dự án / Dev | Todo | Waiting dependencies | PB-008-T01 | Not run: chưa có |
| PB-008-T03 | PB-008 / S2 | Kiểm retry/multi-device không đếm trùng, recalculation và giải thích kết quả | Chủ dự án / QA | Todo | Waiting dependencies | PB-008-T02 | Not run: chưa có |
| PB-009-T01 | PB-009 / S3 | Đặc tả onboarding/skip/resume và cách phân biệt self-report với kết quả gợi ý | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-008-T03 | Not run: chưa có |
| PB-009-T02 | PB-009 / S3 | UI/API lưu preferences vào profile hiện có; không thêm invitation gate | Chủ dự án / Dev | Todo | Waiting dependencies | PB-009-T01 | Not run: chưa có |
| PB-009-T03 | PB-009 / S3 | Kiểm tài khoản mới/cũ, skip/resume/reset lựa chọn, focus và handoff | Chủ dự án / QA | Todo | Waiting dependencies | PB-009-T02 | Not run: chưa có |
| PB-010-T01 | PB-010 / S3 | Chốt2 học phần và quan hệ prerequisite không chu trình;5 docs | Chủ dự án / Content/Dev | Todo | Waiting dependencies | PB-006-T03, PB-008-T03 | Not run: chưa có |
| PB-010-T02 | PB-010 / S3 | Map grammar/lesson/exercise thành path, unlock/continue/progress theo account | Chủ dự án / Dev | Todo | Waiting dependencies | PB-010-T01 | Not run: chưa có |
| PB-010-T03 | PB-010 / S3 | Kiểm prerequisite/skip/đổi level, nội dung và progress giữa2 trình duyệt | Chủ dự án / QA/Reviewer | Todo | Waiting dependencies | PB-010-T02 | Not run: chưa có |
| PB-011-T01 | PB-011 / S3 | Cập nhật mapping knowledge/path vào planning rule, không phá lịch đã tạo | Chủ dự án / Dev | Todo | Waiting dependencies | PB-008-T03, PB-009-T03, PB-010-T03 | Not run: chưa có |
| PB-011-T02 | PB-011 / S3 | Tasks có nguồn/lý do và continue đúng lesson/path | Chủ dự án / Dev | Todo | Waiting dependencies | PB-011-T01 | Not run: chưa có |
| PB-011-T03 | PB-011 / S3 | E2E vòng học, refresh/midnight/timezone/overload và audit liên kết | Chủ dự án / QA | Todo | Waiting dependencies | PB-011-T02 | Not run: chưa có |
| PB-012-T01 | PB-012 / S3 | Đặc tả trạng thái feedback, quyền và5 docs/cập nhật docs chuẩn | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-004-T03 | Not run: chưa có |
| PB-012-T02 | PB-012 / S3 | Report issue→admin review→resolution lưu version/evidence | Chủ dự án / Dev | Todo | Waiting dependencies | PB-012-T01 | Not run: chưa có |
| PB-012-T03 | PB-012 / S3 | Kiểm ownership, duplicate, privacy và đưa ca đã duyệt vào regression set | Chủ dự án / QA/Reviewer | Todo | Waiting dependencies | PB-012-T02 | Not run: chưa có |
| PB-013-T01 | PB-013 / S4 | Biên soạn5 bài đọc/3 đoạn nghe, xác định nguồn và quyền sử dụng | Chủ dự án / Content | Todo | Waiting dependencies | PB-010-T03 | Not run: chưa có |
| PB-013-T02 | PB-013 / S4 | Duyệt level, từ/cấu trúc mục tiêu và sự khớp audio-transcript | Chủ dự án / Reviewer | Todo | Waiting dependencies | PB-013-T01 | Not run: chưa có |
| PB-013-T03 | PB-013 / S4 | Publish theo version; kiểm media lỗi và fallback learner | Chủ dự án / Content/QA | Todo | Waiting dependencies | PB-013-T02 | Not run: chưa có |
| PB-014-T01 | PB-014 / S4 | Đặc tả segment/time offsets, controls/keyboard và cập nhật5 docs | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-013-T03 | Not run: chưa có |
| PB-014-T02 | PB-014 / S4 | Audio/reader segment controls và contextual vocabulary save | Chủ dự án / Dev | Todo | Waiting dependencies | PB-014-T01 | Not run: chưa có |
| PB-014-T03 | PB-014 / S4 | Kiểm audio lỗi, seek/repeat/speed, transcript/privacy và responsive | Chủ dự án / QA | Todo | Waiting dependencies | PB-014-T02 | Not run: chưa có |
| PB-015-T01 | PB-015 / S4 | Chốt bộ câu hỏi/đáp án cho pilot, schema reuse exercise engine | Chủ dự án / Content/Dev | Todo | Waiting dependencies | PB-003-T03, PB-014-T03 | Not run: chưa có |
| PB-015-T02 | PB-015 / S4 | Comprehension/dictation renderer, attempt và feedback theo ngữ cảnh | Chủ dự án / Dev | Todo | Waiting dependencies | PB-015-T01 | Not run: chưa có |
| PB-015-T03 | PB-015 / S4 | Kiểm đáp án đa dạng, reveal, retries và liên kết lesson/mastery/SRS | Chủ dự án / QA/Reviewer | Todo | Waiting dependencies | PB-015-T02 | Not run: chưa có |
| PB-016-T01 | PB-016 / S4 | Tạo30 ca trợ từ/chia động-tính từ/cụm/ambiguity và expected | Chủ dự án / Reviewer/Dev | Todo | Needs refinement | — | Not run: chưa có |
| PB-016-T02 | PB-016 / S4 | Thử2 phương án trong môi trường Docker; đo latency và failure modes | Chủ dự án / Dev | Todo | Waiting dependencies | PB-016-T01 | Not run: chưa có |
| PB-016-T03 | PB-016 / S4 | ADR chọn phương án, giới hạn/fallback và refined backlog implementation | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-016-T02 | Not run: chưa có |
| PB-017-T01 | PB-017 / S5 | Đặc tả contract/context/confidence và migration/cache rollback nếu cần | Chủ dự án / Dev | Todo | Waiting dependencies | PB-016-T03 | Not run: chưa có |
| PB-017-T02 | PB-017 / S5 | Tích hợp phương án từ spike, lookup variants/cụm và source trace | Chủ dự án / Dev | Todo | Waiting dependencies | PB-017-T01 | Not run: chưa có |
| PB-017-T03 | PB-017 / S5 | Chạy bộ morphology, timeout/cache/error và nối save vocabulary | Chủ dự án / QA | Todo | Waiting dependencies | PB-017-T02 | Not run: chưa có |
| PB-018-T01 | PB-018 / S5 | Chốt card presentation và accepted answers; không reset lịch cũ | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-007-T03, PB-014-T03 | Not run: chưa có |
| PB-018-T02 | PB-018 / S5 | Context/card variants, source navigation và audio fallback | Chủ dự án / Dev | Todo | Waiting dependencies | PB-018-T01 | Not run: chưa có |
| PB-018-T03 | PB-018 / S5 | Kiểm migration compatible nếu có, review concurrency và dữ liệu cũ | Chủ dự án / QA | Todo | Waiting dependencies | PB-018-T02 | Not run: chưa có |
| PB-019-T01 | PB-019 / S5 | Đặc tả input limits/privacy/ownership/delete và5 docs | Chủ dự án / PO/Dev | Todo | Waiting dependencies | PB-014-T03, PB-017-T03 | Not run: chưa có |
| PB-019-T02 | PB-019 / S5 | Private text ingestion/reader/progress; không đưa vào thư viện chung mặc định | Chủ dự án / Dev | Todo | Waiting dependencies | PB-019-T01 | Not run: chưa có |
| PB-019-T03 | PB-019 / S5 | Kiểm2 account, payload lớn/XSS/content lỗi và xoá dữ liệu cá nhân | Chủ dự án / QA | Todo | Waiting dependencies | PB-019-T02 | Not run: chưa có |
| PB-020-T01 | PB-020 / S5 | Rà contract/storage/consent/retention và cấu hình bằng env, không lưu secret trong docs | Chủ dự án / Dev | Todo | Waiting dependencies | PB-014-T03 | Not run: chưa có |
| PB-020-T02 | PB-020 / S5 | Hoàn tất recorder/STT/S3/replay và lỗi microphone/provider | Chủ dự án / Dev | Todo | Waiting dependencies | PB-020-T01 | Not run: chưa có |
| PB-020-T03 | PB-020 / S5 | Kiểm thiết bị thật/signed URL/account isolation/delete và audio feedback | Chủ dự án / QA/PO | Todo | Waiting dependencies | PB-020-T02 | Not run: chưa có |
| PB-021-T01 | PB-021 / S6 | Chốt bộ acceptance end-to-end và bộ gold có version | Chủ dự án / QA/PO | Todo | Waiting dependencies | PB-004-T03, PB-007-T03, PB-008-T03, PB-011-T03 | Not run: chưa có |
| PB-021-T02 | PB-021 / S6 | Chạy integration/Playwright + provider smoke phù hợp; triage lỗi theo mức độ | Chủ dự án / QA/Dev | Todo | Waiting dependencies | PB-021-T01 | Not run: chưa có |
| PB-021-T03 | PB-021 / S6 | Duyệt kết quả giáo dục, không dùng build pass thay teacher review | Chủ dự án / Reviewer/PO | Todo | Waiting dependencies | PB-021-T02 | Not run: chưa có |
| PB-022-T01 | PB-022 / S6 | Chốt domain/SMTP/Google audience và callback; secrets chỉ trong env | Chủ dự án / Dev/PO | Todo | Needs refinement | — | Not run: chưa có |
| PB-022-T02 | PB-022 / S6 | Cấu hình môi trường và kiểm đường dẫn verify/reset/linking | Chủ dự án / Dev | Todo | Waiting dependencies | PB-022-T01 | Not run: chưa có |
| PB-022-T03 | PB-022 / S6 | Kiểm2 account và session/revoke/logout/CSRF trên HTTPS thật | Chủ dự án / QA | Todo | Waiting dependencies | PB-022-T02 | Not run: chưa có |
| PB-023-T01 | PB-023 / S6 | Runbook deploy/backup/restore/rollback và threat boundaries, không secrets | Chủ dự án / Dev/Ops | Todo | Waiting dependencies | PB-022-T03 | Not run: chưa có |
| PB-023-T02 | PB-023 / S6 | Deploy staging, restore vào môi trường riêng, health/error monitoring | Chủ dự án / Ops | Todo | Waiting dependencies | PB-023-T01 | Not run: chưa có |
| PB-023-T03 | PB-023 / S6 | Diễn tập rollback/recovery, data count/isolation và lưu evidence đã redacted | Chủ dự án / QA/PO | Todo | Waiting dependencies | PB-023-T02 | Not run: chưa có |
| PB-024-T01 | PB-024 / S6 | Sync5 docs mỗi feature + code-map/HANDOFF, lint/typecheck/build/container | Chủ dự án / Dev | Todo | Waiting dependencies | PB-021-T03, PB-022-T03, PB-023-T03 | Not run: chưa có |
| PB-024-T02 | PB-024 / S6 | Audit tách lượt spec→code→test→UI, xác nhận không còn release blocker | Chủ dự án / QA | Todo | Waiting dependencies | PB-024-T01 | Not run: chưa có |
| PB-024-T03 | PB-024 / S6 | Go/no-go và release notes; approval phát hành cụ thể ở bước cuối | Chủ dự án / PO | Todo | Waiting dependencies | PB-024-T02 | Not run: chưa có |
| PB-034-T01 | PB-034 / null | Đặc tả loại tài liệu và hợp đồng đọc lại/ghi chú/ôn tập | Chủ dự án / Dev/PO | Done | Done | — | Pass: documentation/features/knowledge-library/README.md |
| PB-034-T02 | PB-034 / null | Triển khai idiom/tục ngữ/tài liệu và state đọc theo tài khoản | Chủ dự án / Dev/PO | Done | Done | PB-034-T01 | Pass: documentation/features/knowledge-library/functions.md, documentation/features/knowledge-library/assets/verification.md, tests/e2e/knowledge.spec.ts |
| PB-034-T03 | PB-034 / null | Audit reader, isolation, concurrency, nội dung và bàn giao | Chủ dự án / QA/Reviewer | In progress | Ready | PB-034-T02 | Not run: documentation/features/knowledge-library/audit.md, documentation/audits/self-study-library-integration.md |
| PB-038-T01 | PB-038 / null | Đặc tả ADR local storage, queue, runtime/model và UI trước code | Chủ dự án / Dev/PO | Done | Done | — | Pass: documentation/features/self-hosted-speech/README.md, documentation/features/self-hosted-speech/system-design.md |
| PB-038-T02 | PB-038 / null | Triển khai private audio/API/worker/UI, Gemini free-tier adapter và local fallback | Chủ dự án / Dev/PO | Done | Done | PB-038-T01 | Pass: documentation/features/self-hosted-speech/functions.md, documentation/features/self-hosted-speech/assets/verification.md |
| PB-038-T03 | PB-038 / null | Audit real engine/resource,ownership,UI,backup/restore và handoff | Chủ dự án / QA/Reviewer | In progress | External: EXT-SPEECH | PB-038-T02 | Not run: documentation/features/self-hosted-speech/audit.md, documentation/features/self-hosted-speech/assets/verification.md |
