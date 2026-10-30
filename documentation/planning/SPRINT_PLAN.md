> Generated view — chỉnh work-items.json rồi chạy npm run plan:sync

# Sprint plan — solo, proposed

- Mặc định sprint2 tuần/10 ngày làm việc; chưa gán start/end date.
- Solo: chủ dự án xác nhận có thể duyệt tiếng Hàn; giờ/tuần và thời gian review/audio/infra vẫn TBD; sprint Proposed.
- SP chỉ là estimate tương đối của dev, không phải giờ/ngày; content/review tính riêng.
- Dành khoảng25% capacity được xác nhận cho bug, QA, audit và handoff; nếu scope vượt capacity phải tách/cắt story.
- S1-S2 refine trước; S3-S6 là forecast, cần estimate lại sau velocity thực tế.
- PB-* là ID tracking nội bộ, không phải Jira/GitHub ticket.
- Chưa bắt đầu thực hiện các product tasks; baseline code cũ tách khỏi % tiến độ phần bổ sung.
- Mỗi sprint ưu tiên Core; Stretch chỉ kéo khi còn capacity, carry-over phải replan phụ thuộc và gate.

| Sprint | State | Start | End | Core dev SP* | Stretch dev SP* | Done dev SP* | Task progress |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 / Ngữ pháp pilot + quality baseline | Proposed | TBD | TBD | 13 | 0 | 0 | 0/12 tasks (0% count-based) |
| S2 / Tra cứu, mở rộng pilot và ôn lại | Proposed | TBD | TBD | 13 | 0 | 0 | 0/12 tasks (0% count-based) |
| S3 / Onboarding và lộ trình tự học | Proposed | TBD | TBD | 11 | 3 | 0 | 0/12 tasks (0% count-based) |
| S4 / Nghe đọc trong ngữ cảnh | Proposed | TBD | TBD | 8 | 5 | 0 | 0/12 tasks (0% count-based) |
| S5 / Context SRS và đầu vào cá nhân | Proposed | TBD | TBD | 8 | 10 | 0 | 0/12 tasks (0% count-based) |
| S6 / Audit và release gate | Proposed | TBD | TBD | 16 | 0 | 0 | 0/12 tasks (0% count-based) |

## S1 / Ngữ pháp pilot + quality baseline

**Sprint goal:** Một lát cắt5 grammar đã duyệt, MCQ/cloze và chất lượng chữa AI có baseline; chia nhỏ/carry nếu capacity solo chưa đủ, không giảm QA/review.

- Core: PB-001 Trạm ngữ pháp: lát cắt đầu tiên; PB-002 Bộ5 ngữ pháp mẫu đã duyệt; PB-003 Bài tập nhận biết và điền khuyết; PB-004 Benchmark chữa bài AI ban đầu.
- Stretch: Không đề xuất kéo thêm; ưu tiên hoàn thiện review/QA.
- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.
- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.
- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.


## S2 / Tra cứu, mở rộng pilot và ôn lại

**Sprint goal:** 15 bài được duyệt, search/compare, save grammar SRS và mastery có evidence.

- Core: PB-005 Tra cứu và so sánh ngữ pháp; PB-006 Mở rộng pilot lên15 bài đã duyệt; PB-007 Nối ngữ pháp và lỗi sai vào SRS; PB-008 Tiến độ theo cấu trúc kiến thức.
- Stretch: Không đề xuất kéo thêm; ưu tiên hoàn thiện review/QA.
- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.
- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.
- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.


## S3 / Onboarding và lộ trình tự học

**Sprint goal:** Người học có path rõ, next lesson và feedback AI; mốc beta tự học local

- Core: PB-009 Onboarding cho người học trung-cao cấp; PB-010 Lộ trình học và học phần; PB-011 Dashboard theo lộ trình và điểm yếu.
- Stretch: PB-012 Phản hồi chữa AI chưa đúng.
- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.
- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.
- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.


## S4 / Nghe đọc trong ngữ cảnh

**Sprint goal:** Pilot nội dung nghe-đọc và segment player/comprehension; chốt hướng morphology

- Core: PB-013 Pilot5 bài đọc và3 đoạn nghe; PB-014 Reader và audio theo đoạn; PB-016 Spike xử lý dạng từ tiếng Hàn.
- Stretch: PB-015 Hiểu bài và chép chính tả theo đoạn.
- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.
- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.
- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.


## S5 / Context SRS và đầu vào cá nhân

**Sprint goal:** Tra dạng từ/context, học văn bản riêng và kiểm thu âm/STT/S3 thật

- Core: PB-017 Tra nguyên mẫu và cụm theo ngữ cảnh; PB-018 Thẻ ôn theo ngữ cảnh đa dạng.
- Stretch: PB-019 Nhập văn bản cá nhân để học; PB-020 Hoàn thiện shadowing/thu âm riêng tư.
- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.
- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.
- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.


## S6 / Audit và release gate

**Sprint goal:** Kiểm toàn vòng học, auth/infrastructure thật, restore/rollback và PO go/no-go

- Core: PB-021 Audit vòng tự học và chất lượng cuối; PB-022 Email/OAuth trên môi trường thật; PB-023 Triển khai/backup/restore/quan sát lỗi; PB-024 Gate phát hành beta và bàn giao.
- Stretch: Không đề xuất kéo thêm; ưu tiên hoàn thiện review/QA.
- Carry-in: chỉ kéo khi dependencies Done; nếu chưa, ưu tiên hoàn tất upstream và replan, không làm bypass gate.
- Capacity: giờ/tuần TBD; 25% dự phòng bugs/QA/handoff. Content review và code do cùng một người, không được tính như hai nguồn lực song song.
- Exit: Core acceptance đạt, tests/audit/docs/HANDOFF có evidence; Stretch chưa xong trả backlog và ghi rõ feature nào chưa bật.


S1-S2 cần refinement/capacity trước khi Active; S3-S6 forecast, không phải cam kết12 tuần. Sprint không tự bắt đầu bằng việc sinh kế hoạch. Release cần PO go/no-go.

