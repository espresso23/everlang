# Hướng dẫn agent ở phiên mới

1. Đọc AGENTS.md; kiểm `git branch --show-current`, `git status --short`, diff của file thuộc scope. Giữ nguyên thay đổi sẵn có. Không switch/stash/reset công việc chưa commit. Nếu branch không phù hợp và tree bẩn, làm rõ ngoại lệ hoặc tách worktree; không tự chuyển thay đổi.
2. Đọc HANDOFF phần mới nhất và context packet của issue được giao. Dùng project-status làm bản đồ; không nạp toàn lịch sử HANDOFF khi chưa cần. Kiểm lại facts với repo.
3. Đọc PRD README + system-design/functions/UI/audit feature; nếu có planning thì đọc guide và đúng PBI/task trong JSON. Frontend đọc design guide; Next code đọc docs đúng phiên bản trong node_modules trước sửa.
4. Xác định một công việc cụ thể, scope, quyền tự chủ và các quyết định đã chốt. Nếu chưa có issue, dùng everlang-prd rồi prd-to-issue. Không mặc định thực thi backlog còn lại.
5. Dùng skill thích hợp tại `.agents/skills/`. Đọc riêng skill cần thiết, không nạp tất cả. Nếu grill-me chưa có trong môi trường, nói rõ và phỏng vấn theo một quyết định mỗi lượt; không tuyên bố đã dùng skill không tồn tại.
6. Thực hiện issue đã Ready bằng issue-afk; checkpoint trước chuyển scope/reset. Chạy self-review, lưu audit/HANDOFF, đưa Review để chủ dự án QA. Không tự push/merge/deploy hoặc đóng issue.

## Prompt khởi động có thể sao chép

```text
Làm việc trong repo EverLang này. Đọc AGENTS.md và documentation/workflow/NEW_SESSION.md.
Nhiệm vụ được giao: [đường dẫn issue hoặc URL GitHub cụ thể].
Context packet nếu có: [đường dẫn].
Kiểm lại branch/status/diff, giữ nguyên thay đổi có sẵn; đọc PRD và dependency liên quan.
Nếu issue chưa Ready, chỉ refine phần thiếu; nếu Ready, tự triển khai và kiểm tra trong scope.
Ghi self-review, audit, HANDOFF và giới hạn kiểm chứng; đưa Review để tôi QA.
Tôi quyết định Done/merge/deploy. Không tự mở rộng backlog.
```

Thay phần trong ngoặc trước dùng. Repo/context packet là nguồn tiếp nối; không yêu cầu người dùng nhớ lại toàn bộ chat.
