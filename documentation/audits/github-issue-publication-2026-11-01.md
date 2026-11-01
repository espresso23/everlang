# GitHub issue publication audit

2026-11-01; docs/github-delivery-issues từ main da15d5f. Scope docs/tracking và GitHub issues, không runtime implementation.

- PASS: đọc session/workflow/planning/PRD; owner cho phép publication và close completed khi đạt AC. GitHub repo identity/permissions xác minh; plugin create bị403, gh fallback tạo thật, plugin fetch8/8 xác minh.
- PASS: trước publication list toàn repo cả open/closed bằng gh trả0; connector search cũng trả0. Tìm stable marker từng issue trước create.8 issue/20 task, không trùng, URL persisted ngay từng lần thành công.
- PASS: review riêng REQ → existing PB/task → issue → AC/evidence. Gộp các bước spec/implementation/audit thành outcome xuyên lớp. Giữ task ID và dependencies nội bộ. #3 cần #1/#2; #5 cần #3/#4, không cycle; #6/#7/#8 có external/owner gates rõ.
- PASS: planned interactive-exercises/knowledge-mastery dùng backlog làm đầu vào refinement; chưa bịa PRD đã duyệt hoặc Ready. Issue chỉ trỏ docs có thật trên main; local draft của hai feature planned chưa là implementation.
- PASS: giữ trạng thái task và Proposed sprint; không đóng issue còn QA/content/infra. Chỉ tạo8issue trong scope ưu tiên, không tuyên bố đã đăng toàn89task.
- Verification commands: npm run plan:sync; npm run plan:check; npm run docs:check; git diff --check; remote/local marker/body/mapping assertions.
- N/A: unit/lint/typecheck/build/runtime suites cho thay đổi chỉ docs/tracking; kết quả86unit/29E2E ở audit runtime trước không được coi là chạy mới.
- NOT VERIFIED: content language approval, SMTP thật/OAuth/physical devices/production release; các issue liên quan giữ mở.

Final verification PASS: plan:sync/check (41PBI/89tasks/6Proposed), docs:check (20features/237source/2003links), diff whitespace. Remote8/8 body equals local,20/20 unique markers/githubIssue mappings, task status/verification and sprint objects unchanged against HEAD. Không issue nào được đóng vì chưa đủ AC.
