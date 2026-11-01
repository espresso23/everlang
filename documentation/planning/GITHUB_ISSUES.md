# GitHub delivery issues — 2026-11-01

Đợt hiện tại: 8 issue, 20 task hiện có; ưu tiên đã chốt học liệu duyệt → luyện → SRS → tiến độ, SMTP thật và PostgreSQL acceptance. Không phải toàn bộ 41 PBI/89 task đã được đăng hoặc giao chạy trong sprint.

| Issue | Kết quả | Task mapping |
|---|---|---|
| [1](https://github.com/espresso23/everlang/issues/1) | [PB-001] Nghiệm thu tracer bullet: admin xuất bản → learner tìm và học | PB-001-T03 |
| [2](https://github.com/espresso23/everlang/issues/2) | [PB-002] Xuất bản pilot 5 bài ngữ pháp được duyệt | PB-002-T01, PB-002-T02, PB-002-T03 |
| [3](https://github.com/espresso23/everlang/issues/3) | [PB-003] Học bài → làm MCQ/cloze → nhận giải thích và lưu kết quả | PB-003-T01, PB-003-T02, PB-003-T03 |
| [4](https://github.com/espresso23/everlang/issues/4) | [PB-007] Bài học/lỗi sai → lưu thẻ → ôn FSRS → lịch ngày | PB-007-T01, PB-007-T02, PB-007-T03 |
| [5](https://github.com/espresso23/everlang/issues/5) | [PB-008] Hiển thị tiến độ kiến thức từ attempt và lần ôn | PB-008-T01, PB-008-T02, PB-008-T03 |
| [6](https://github.com/espresso23/everlang/issues/6) | [PB-035] Duyệt kho 30 nghĩa/23 bộ từ và kiểm học → lưu → ôn | PB-035-T04 |
| [7](https://github.com/espresso23/everlang/issues/7) | [PB-022] Verify/reset qua SMTP thật và nghiệm thu OAuth/HTTPS | PB-022-T01, PB-022-T02, PB-022-T03 |
| [8](https://github.com/espresso23/everlang/issues/8) | [PB-041] Nghiệm thu PostgreSQL-only sau merge và quyết định phát hành | PB-041-T01, PB-041-T02, PB-041-T03 |

Thứ tự: #1 → #2 → #3 → #4 → #5; #6/#7 có đầu vào content/infra riêng; #8 giữ acceptance/release gate sau main merge. Các task trong cùng issue giữ thứ tự dependencies ở work-items.json. #3 và #5 cần hoàn thiện canonical PRD trước code; chưa được coi Ready chỉ vì issue đã tồn tại.

Chỉ `work-items.json` giữ trạng thái task, trường `githubIssue` ánh xạ issue thật. GitHub checklist thể hiện acceptance: đạt và self-review có bằng chứng mới đóng completed, cập nhật JSON/plan views/HANDOFF và báo cáo DONE–DOING–NEXT. Không đóng cả issue khi mới xong một task con. Nội dung người duyệt/production go-no-go vẫn cần xác nhận tương ứng.

Tất cả 8 issue đang mở vì còn acceptance chưa đạt; không tính việc tạo issue là hoàn thành sản phẩm. Roadmap ngoài đợt này cần issue trước khi bắt đầu thực thi, không tự lấy vào sprint. [Audit publication](../audits/github-issue-publication-2026-11-01.md).
