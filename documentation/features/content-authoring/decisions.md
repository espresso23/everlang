# Admin workspace decisions — 2026-11-01

- Owner báo admin vẫn thấy UI learner; yêu cầu plan rồi chọn mặc định **Quản trị** sau login.
- Đã chốt: login admin → /admin/overview; có chuyển Học tập/Quản trị. /admin cũ giữ editor bài luyện để không phá deep links/tests. Overview là route mới, không bịa thống kê.
- Chỉ thay navigation/layout và role landing; không thêm user management, API/schema hay nâng quyền theo client.
- Issue riêng #9 / PB-042-T01, không tự hoàn tất content approval #1. Prototype/QA fixture không được coi là bài đã owner duyệt. Google callback landing test không chứng nhận upstream OAuth live.
