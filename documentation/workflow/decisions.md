# Quyết định thiết lập workflow — 2026-11-01

Nguồn: trao đổi trực tiếp với chủ dự án trong lượt thiết lập workflow.

| Quyết định | Đã thống nhất | Tác động |
|---|---|---|
| Quyền tự chủ AFK | Chủ dự án chọn: tự triển khai và kiểm tra; chủ dự án QA, quyết định merge/deploy | Agent kết thúc Review; không tự kéo backlog/merge/deploy |
| Branch có thay đổi ORM | Chủ dự án cho phép bổ sung ngay trên branch hiện tại | Giữ `refactor/typeorm-data-access`, không chuyển/reset/stash thay đổi có sẵn |
| Skills và phiên mới | Chủ dự án yêu cầu thêm skill như PRD → GitHub issue và bộ hướng dẫn phiên mới | Thêm bốn skills, templates, NEW_SESSION và routing AGENTS |

Các lựa chọn triển khai dùng theo base repo: README feature làm PRD duy nhất; JSON giữ trạng thái task; issue files chứa hợp đồng. Đây là quyết định triển khai tài liệu dựa trên quy tắc sẵn có, không ghi như lời xác nhận riêng của chủ dự án.

Không có yêu cầu đăng danh sách issue sản phẩm cụ thể trong lượt này. Khi được giao PRD/feature và yêu cầu đăng GitHub, skill thực hiện trong scope đó; không coi việc tạo skill là quyền đăng issue hoặc gửi thông báo.
