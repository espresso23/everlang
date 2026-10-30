# Audit tích hợp baseline — trước feature profile

Ngày 2026-10-30. Source baseline `1d0fbad`; xem [bằng chứng](../shared/baseline-evidence.md). Đây là kiểm kê source và đối chiếu bằng chứng cũ, không tuyên bố chạy lại mọi tính năng.

| Kết nối | Kết luận | Việc còn lại |
|---|---|---|
| Auth → API cá nhân → PostgreSQL | Có session/verification guard, E2E cũ kiểm cách ly | Chạy lại sau sửa profile |
| Google → callback → session → header | **Lỗi đã tìm thấy**: invalid_client; header chưa có image | Secret đã cập nhật; kiểm callback thật, bổ sung avatar/pending/error |
| Profile → auth_user + profiles → dashboard | Source có kết nối; update hiện hai thao tác tách | Sửa tính nguyên tử và refresh session trong feature profile |
| Luyện dịch → queue → worker → report | E2E/AI thật cũ đã qua | Bộ rubric chuẩn có người duyệt chưa đầy đủ |
| Báo cáo → từ → SRS → lịch ngày | Source + test logic/concurrency trước baseline | Kiểm tiếp trên nhiều thiết bị thật |
| Admin → published content → người học | API phân quyền/version có code | Quyền nội dung thực tế cần kiểm theo từng nguồn |
| Audio → STT → S3 | **Chưa kiểm chứng** dịch vụ ngoài | Cấu hình và thử record/playback riêng tư |
| Published → embedding → Tutor | **Chưa kiểm chứng** đầu cuối | Index và đánh giá grounded answers |
| Exam → autosave → submit/result | Mini exam đã có code/test | Đề TOPIK đầy đủ, format/rubric và audit nội dung còn thiếu |
| Docs → file/symbol → UI/test | Có canonical ownership/hash/link checker | Hash chỉ phát hiện drift, cần review ngữ nghĩa mỗi thay đổi |

Chi tiết 14 feature: [mục lục](../README.md). Chưa đánh dấu toàn bộ roadmap hoàn tất. Các giới hạn trên là tồn đọng cụ thể, không chặn đồng bộ tài liệu hiện trạng.
