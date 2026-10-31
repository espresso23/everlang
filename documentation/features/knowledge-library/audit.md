# Audit — knowledge-library

2026-10-31, `feature/self-study-library`. Review riêng sau triển khai: đối chiếu KL-01–06 → source/contract → unit → container/API/browser. **Technical integration PASS trong phạm vi dưới; chưa hoàn tất feature toàn bộ** vì seed chưa được owner duyệt, audio thiết bị thật và một số UI gates còn NOT VERIFIED.

| Requirement / phạm vi | Kết quả | Bằng chứng |
|---|---|---|
| KL-01 published-only, filter, regex escape, grammar/idiom | PASS | [E2E](../../../tests/e2e/knowledge.spec.ts), create draft→learner404→review→publish→GET; q/loại, q=.* không thành wildcard; idiom alias. |
| KL-02 đọc section/ví dụ/song ngữ, mobile | PASS trong phạm vi | [desktop](assets/reader-desktop.png), [320px](assets/reader-mobile.png), inspection trực quan; nâng heading size sau review rồi rebuild/retest. |
| KL-02 TTS âm thanh và giọng máy thật | NOT VERIFIED | Browser fallback có code nhưng chưa kiểm nghe thực tế Windows/Android/iOS; không tuyên bố audio curated/native. |
| KL-03 session→SQL→reader, private notes, CAS | PASS | Hai tài khoản email verified thật trên candidate; user khác không thấy note. PUT version cũ409; browser giữ note local, confirm reload tải bản mới, refresh có dữ liệu SQL. |
| KL-04 answer secrecy, grading, retry/snapshot | PASS | [unit](../../../tests/unit/knowledge.test.ts), public projection không có answers/explanation; submit UI/API nhận feedback, replay cùng id không trùng, khác payload409, snapshot lưu SQL. |
| KL-05 nối SRS | PASS trong phạm vi | UI save hai lần → duplicate notice, lịch cũ giữ; route/SRS legacy không sửa. Đa nghĩa/sense chưa thuộc phase này. |
| KL-06 role/workflow/revision | PASS | Learner admin403, publish draft400, stale edit409, published edit400, fork+review+revise; bản nháp mới không thay revision published của learner. |
| Source/rights và 13 draft seed | PASS kỹ thuật / NOT VERIFIED nội dung | Seed tạo13 draft; chạy lại0 insert và không sửa cũ. Owner đã nhận link review, chưa xác nhận duyệt; QA publication chỉ fixture tạm, đã xóa. |
| Lint/typecheck/unit/production/container | PASS | [verification record](assets/verification.md):37 unit, production build, Docker build,2 scoped Playwright executions đạt. |
| Backup và schema additive | PASS | PG và Mongo backup/restore database tạm; migration004 apply; record lệnh ở evidence. Không đưa backup chứa auth/private data vào Git. |
| Related links, keyboard và text spacing | PASS trong phạm vi test | API publish chặn related missing/self; learner nhận relatedItems key/title; keyboard mục lục→section→ghi nhớ→save; text-spacing override trên390px không overflow. |
| Render tương đương scale200% | PASS layout tương đương / giới hạn | [720CSSpx/DPR2](assets/reader-scale2.png), không overflow; không thay kiểm zoom trình duyệt/assistive tech thật hoặc tuyên bố toàn app đạt WCAG. |

## Semantic review

API ownership luôn từ session, Zod strict không nhận user_id. PostgreSQL CAS atomic chống lost update; requestId namespace theo user; duplicate insert chờ commit rồi trả result gốc. Mongo published immutable bảo toàn snapshot attempt; không có transaction xuyên hai DB. State revision cũ hiện warning, section mất fallback đầu bài; không reset read_revision tự động. Seed không tự xuất bản hoặc tự review AI.

Phát hiện đã sửa: heading h1 quá nhỏ do reset CSS; bổ sung size riêng và chụp lại. Test planning trước đây giả định live data luôn Todo; chuyển sang fixture reset + test riêng canonical progress, không bỏ integrity checks. Reviewed cần sửa có revise về draft và bỏ reviewer. Related publication thêm validation published/self và resolve title; sổ đọc/editor không dùng slug nội bộ làm nhãn tài liệu. Seed export dùng kiểu domain tường minh để không suy related thành never[]. Còn mở: TTS cần voices/device verification, corpus lớn, assistive tech/zoom thật và guard điều hướng SPA toàn app khi note chưa lưu.

## Bước tiếp

Hoàn thành UI/accessibility/related-link gate, owner review content, mở rộng corpus/compare grammar; sau đó cập nhật audit. Xem [completion matrix toàn mục tiêu](../../planning/SELF_STUDY_DELIVERY.md); không đóng goal chỉ vì luồng thư viện đã chạy.
