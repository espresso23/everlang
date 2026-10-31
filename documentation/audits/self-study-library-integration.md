# Integration audit — self-study library

2026-10-31, branch `feature/self-study-library`. Canonical audit: [knowledge-library](../features/knowledge-library/audit.md). Mục tiêu tự học rộng hơn còn active.

| Kết nối | Kết quả và evidence |
|---|---|
| Identity → learner/admin API | PASS hai account thật; non-admin403, anonymous401; không dùng x-user-id. |
| Authoring → Mongo → published projection | PASS draft/review/publish/fork/revise, CAS và immutable; không lộ answers trước submit. |
| Reader → SQL state → thiết bị/tab khác | PASS version409 không mất local note, confirm reload và refresh; metadata bookmark chỉ theo user. |
| Exercise → Mongo revision → SQL attempt → UI | PASS snapshot/server grade/idempotency/replay mismatch; kết quả hiện sau submit. |
| Reader → vocabulary API → FSRS data | PASS save/duplicate; không reset lịch. Full review/dashboard regression không được suy từ save-card test; baseline review tests riêng. |
| Library/admin cũ → route mới | PASS link source + route build/smoke; hai route cũ chỉ thêm entry link, không thay tab hoặc workflow Sentence. |
| Content approval → khả năng học thực | NOT VERIFIED;13 drafts chờ owner. Không dùng QA fixture làm corpus chính thức. |
| Audio/TTS → khả năng nghe thực | NOT VERIFIED thiết bị; chưa đánh giá phát âm, Whisper/self-host còn research. |

Lệnh và giới hạn trong [verification record](../features/knowledge-library/assets/verification.md). Content/source validation, accessibility gate và scope ngoài thư viện tiếp tục trong [delivery matrix](../planning/SELF_STUDY_DELIVERY.md).
