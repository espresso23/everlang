## 2026-11-01 — Pre-merge due-clock regression

FAIL before: first full27E2E run hid a freshly saved card when browser clock lagged PostgreSQL. PASS after: native GET /api/vocabulary includes serverNow; UI uses server timestamp. Catalogue integration intentionally runs browser -5minutes then +365days; due recall/reveal passes, future reviewed card stays unavailable. Full27E2E rerun PASS2.1m, unit77PASS/lint/typecheck/build. No persisted card/due/rating/FSRS/layout change. [Shared SRS contract](../vocabulary-srs/system-design.md), [test](../../../tests/e2e/vocabulary-catalog.spec.ts), [migration audit](../backend-nestjs-migration/audit.md). External/content gates below remain unchanged.

## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: native author/publish/sense identity/quota/CAS/legacy attach/same FSRS/integrated UI.
- Failure override/old bridge options không chạy; owner content coverage còn mở.
- Evidence/checks: vocabulary-catalog.spec.ts; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — vocabulary-catalog

2026-10-31 · branch feature/topic-vocabulary-catalog · PB-035. Implementation checkpoint; chưa đóng toàn bộ feature/corpus. Đối chiếu độc lập yêu cầu → code → actual API/database/browser sau triển khai; chi tiết tại [bằng chứng](assets/verification.md), [audit kết nối](../../audits/vocabulary-catalog-integration.md).

| Phạm vi | Kết quả | Bằng chứng / giới hạn |
|---|---|---|
| VC-01 taxonomy/search/filter/pagination | PASS kỹ thuật |22 topic nodes, latest published trước filter, search pinned term/meaning,31 synthetic sets cho30+1 pagination;0 kết quả. Chưa là corpus đầy đủ/tần suất đã kiểm chứng. |
| VC-02 schema/sense | PASS kỹ thuật | Strict schema,2 nghĩa 배 riêng, nguồn/quyền/examples;59 unit và actual API. Chất lượng tiếng Hàn thật NOT VERIFIED chờ owner. |
| VC-03/07 authoring/publication/roles | PASS |2 account thật,401/403/400, CAS409, review explicit, refs phải published, published immutable, pinned revision; không lộ draft/reviewer tới learner. |
| VC-04 TTS/link speech | PASS hợp đồng, NOT VERIFIED thiết bị | Shared coordinator, voice lookup/cancel/no-event/timeout unit, browser UI/error entry. Không nghe xác nhận giọng Korean trên thiết bị, không có curated audio/điểm phát âm. |
| VC-05 FSRS/save/legacy | PASS | Actual FSRS review + PG: duplicate/cross-set giữ id/card/due/log/version; khác sense thẻ riêng; manual attach đúng owner/version giữ lịch/notes. Context Việt ẩn trước reveal. |
| VC-06 preferences/concurrency | PASS | Concurrent cap1 có1 thành công/1 quota429, preferences200/409, stale progress409 và browser reload/retry; quota0 không chặn đọc/self-report. Timezone/DST boundary unit; chưa long-running physical2-device midnight test. |
| VC-08 migration/backup/bridge | PASS phạm vi | Restore PG/Mongo DB tạm đối chiếu hash/count; pre-reviewed synthetic card giữ lịch qua007; bridge POST/duplicate/GET thật sau007. Không dùng image pre-bridge rollback. |
| External failure/form retention | PASS | Mongo outage candidate thật:500, không SQL mutation, admin giữ input, không fake save; ảnh service-error. |
| Learner/admin desktop/mobile/keyboard | PASS phần đã kiểm | Learner320, admin key→level focus, desktop/reference labels; text-spacing320 PASS sau fix font-only; scoped UI test8.8s. Screenreader và browser-back SPA guard toàn app NOT VERIFIED. |
| Release content/curated audio | NOT VERIFIED |30 senses/23 sets draft,13 knowledge drafts chưa owner review; PB-036 và pronunciation assessment riêng chưa hoàn thành. |

Phát hiện đã sửa: pool GET không giữ thêm client khi đã checkout; admin ref projection thiếu kind; sidebar quá dài; SRS context lộ dịch Việt; lifecycle TTS có thể để timer cũ hủy lần phát mới; text-spacing header tràn8px đã sửa và rerun PASS. Không đổi trạng thái Done chỉ dựa build/synthetic QA. Cần owner duyệt nội dung trong ứng dụng, corpus coverage, kiểm giọng/audio thật và các gate trợ năng còn mở.

## 2026-10-31 — Kho hệ thống và xử lý exception worker

Branch `bugfix/sample-audio-player`, HEAD13d432b + working changes. PASS theo phạm vi ghi nhận:70unit, Redis cooldown/PG idle reconnect/fatal child probes,2real library E2E34.4s và UI scoped. Xem [audit tích hợp](../../audits/system-library-worker-errors.md) cho yêu cầu/code/steps/evidence/cleanup và final build/deploy. NOT VERIFIED với live provider recovery, speech hardware, chất lượng nội dung/điểm phát âm và các gate legacy ngoài phạm vi. Không coi toàn feature Done.
