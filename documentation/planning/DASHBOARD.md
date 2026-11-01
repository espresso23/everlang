> Generated view — chỉnh work-items.json rồi chạy npm run plan:sync

# Tracking EverLang — 2026-11-01

Baseline 4eb249c: 14 feature/domain hiện có, tách khỏi backlog mới. Không tính % hoàn thành toàn bộ dự án.

Phần bổ sung: 43 PBIs; 9/91 tasks (10% count-based). 19 PBIs chưa xếp sprint. Task count không phải effort/burndown.

| Sprint | Trạng thái | Start | End | Core dev SP* | Stretch dev SP* | Done dev SP* | Tiến độ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 / Ngữ pháp pilot + quality baseline | Proposed | TBD | TBD | 13 | 0 | 0 | 2/12 tasks (17% count-based) |
| S2 / Tra cứu, mở rộng pilot và ôn lại | Proposed | TBD | TBD | 13 | 0 | 0 | 0/12 tasks (0% count-based) |
| S3 / Onboarding và lộ trình tự học | Proposed | TBD | TBD | 11 | 3 | 0 | 0/12 tasks (0% count-based) |
| S4 / Nghe đọc trong ngữ cảnh | Proposed | TBD | TBD | 8 | 5 | 0 | 0/12 tasks (0% count-based) |
| S5 / Context SRS và đầu vào cá nhân | Proposed | TBD | TBD | 13 | 5 | 0 | 0/12 tasks (0% count-based) |
| S6 / Audit và release gate | Proposed | TBD | TBD | 16 | 0 | 0 | 0/12 tasks (0% count-based) |

*SP sơ bộ, không phải giờ/ngày. Content/review capacity tính riêng; tất cả sprint còn Proposed, cần chốt giờ/tuần và refinement.

## Release gates

| Mốc | Forecast | Kết quả | Gate |
| --- | --- | --- | --- |
| M1: Grammar pilot có kiểm chứng | S2 | Not reached | 15 bài reviewed + search/compare/exercise + SRS; benchmark được reviewer chấp nhận |
| M2: Beta tự học local | S3 | Not reached | Onboarding/path→practice→feedback→save→SRS→daily plan đủ evidence, không còn lỗi P0 |
| M3: Context learning pilot | S5 | Not reached | Pilot5 bài đọc/3 đoạn nghe, reader và morphology/context SRS verified; import riêng/STT là Stretch, chưa kiểm thì không bật release |
| M4: Sẵn sàng phát hành beta | S6 | Not reached | Các story release gate Done, credentials/services thực tế kiểm, PO quyết định phát hành |
| M5: Full self-study theo discovery | Unscheduled | Not reached | Từ vựng/chủ đề/audio, knowledge, practice/SRS/path và speaking có kiểm chứng; không thay pronunciation bằng STT |

## Đầu vào còn cần chốt

| ID | Đầu vào | Owner | Trạng thái |
| --- | --- | --- | --- |
| EXT-CONTENT | Người đủ năng lực duyệt nội dung/ground truth tiếng Hàn và thời gian duyệt | Chủ dự án | Available; review time TBD |
| EXT-AUDIO | Audio phù hợp và quyền dùng/nguồn thu âm, người kiểm transcript | Chủ dự án | Unconfirmed |
| EXT-SPEECH | S3/Google Speech cấu hình và quota, thiết bị/microphone kiểm thật | Chủ dự án | Unconfirmed |
| EXT-INFRA | Domain/VPS/SMTP/Google OAuth production và người vận hành | Chủ dự án | Unconfirmed |

[Nguồn dữ liệu](work-items.json) · [Hướng dẫn](README.md) · [Task board](TASK_BOARD.md) · [Sprint plan](SPRINT_PLAN.md).
