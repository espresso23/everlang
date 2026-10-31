# WBS, backlog và sprint tracking — EverLang

Ngày lập: **2026-10-31**. Phạm vi: beta tự học tiếng Hàn trung–cao cấp, luyện thi/đa ngôn ngữ triển khai sau. Người dùng xác nhận **solo và có khả năng duyệt nội dung tiếng Hàn**; giờ mỗi tuần chưa được chốt.

## Mở tài liệu nào?

| Cần xem | Tài liệu |
|---|---|
| Tiến độ và release gates | [DASHBOARD](DASHBOARD.md) |
| Phân rã deliverable → feature → task | [WBS](WBS.md) |
| Xếp hạng tính năng, acceptance, dependencies | [Product backlog](PRODUCT_BACKLOG.md) |
| Goal, Core/Stretch, forecast từng sprint | [Sprint plan](SPRINT_PLAN.md) |
| Task cụ thể, owner, trạng thái, readiness | [Task board](TASK_BOARD.md) |
| Mở/lọc bằng Excel | [Tasks CSV](tasks.csv), [Backlog CSV](product-backlog.csv) — bản sinh tự động, UTF-8 |
| Dữ liệu tracking chuẩn để sửa | [work-items.json](work-items.json) |

**14 nhóm baseline đã có được tách khỏi backlog bổ sung.** Ngày2026-10-31 owner yêu cầu triển khai toàn bộ tự học: hiện37 PBI,75 leaf task;4 PBI mới về thư viện/bộ từ/audio/hội thoại chưa xếp sprint, không coi là deferred chỉ vì chưa schedule. Task đặc tả/implementation PB-001 và PB-034 đã Done có evidence; audit cuối còn In progress; xem dashboard sinh từ JSON cho trạng thái mới nhất. Không dùng0% backlog mới để nói dự án hiện tại chưa làm gì, và không dùng số màn hình/code sẵn để coi toàn bộ roadmap đã hoàn tất.

## Cách cập nhật tiến độ

1. Chỉ chỉnh **work-items.json**. Không sửa trạng thái trong các Markdown/CSV được sinh tự động.
2. Giữ PB/task/WBS ID ổn định. PB là ID nội bộ, không phải ticket Jira/GitHub được tự tạo. Owner hiện là Chủ dự án; role phân biệt Dev/PO/Reviewer/QA, không giả có nhiều người làm song song.
3. Trước sprint: refine acceptance, chọn Core, chốt giờ/tuần và thời gian dành cho content/review, rồi mới nhập capacity/date. S1-S2 refine trước, S3-S6 là forecast. SP dev sơ bộ không quy đổi sang ngày; nội dung có points=null là **chưa tính capacity**, không phải0 công.
4. Trước code feature mới: hoàn tất task đặc tả và5 docs chuẩn; feature có sẵn cập nhật canonical docs. Trước build, upstream phải Done; các task design/refinement không thay thế quyền duyệt sản phẩm.
5. Cập nhật model.asOf và task status/verification/evidence/blocker/updated. Lưu evidence bằng đường dẫn tương đối từ repo hoặc URL, không ghi secret. Done cần verification=Pass và evidence tồn tại; bản thân đường dẫn đúng chưa chứng minh nội dung evidence đúng — vẫn phải audit ngữ nghĩa.
6. Chạy **npm run plan:sync**, **npm run plan:check**, **npm run docs:check**. Commit JSON và các views cùng nhau, cập nhật HANDOFF trong lượt thực hiện feature.

Trạng thái task: **Todo → In progress → Review → Done**; Blocked cần lý do cụ thể. Readiness được tính riêng: Needs refinement / Waiting dependencies / External / Ready. Review task chưa phải Done; không đánh dấu feature hoàn tất khi task kiểm thử/audit còn mở. Chuyển task ngược trạng thái phải xem tác động các task downstream.

Dashboard có Done dev SP theo các PBI hoàn tất để hỗ trợ nhìn lại velocity sau sprint; chưa có sprint Closed nên chưa có velocity thực tế. Không cộng SP của parent vào từng task hoặc đếm lại nội dung chưa estimate thành0 công. Checker chấp nhận LF/CRLF để checkout trên Windows không gây drift giả.

## Definition of Ready

- Có vấn đề/mục tiêu, acceptance kiểm được, phạm vi Core/Stretch và dependency rõ.
- Nội dung mẫu/nguồn và reviewer đã xác định; đường đi qua auth/API/DB/UI đã dự kiến.
- Có owner và capacity thực tế. Khi chốt scope, tính thời gian review do cùng một người làm; giữ khoảng25% dự phòng bug/QA/audit/handoff.
- Feature mới có kế hoạch tạo5 docs; migration/rollback, provider và ảnh hưởng lên UI có task tương ứng. Refine feature.refinement thành Ready trước implementation; các task đầu có thể dùng để thiết kế/refine.

## Definition of Done

- Acceptance của PBI đạt, mọi child task Done có evidence và Pass.
- Nội dung tiếng Hàn được người dùng duyệt; AI không tự duyệt ground truth của mình. Audit thực hiện ở lượt riêng sau implementation, dù cùng một owner.
- UI tuân thủ [design guide](../design/README.md); API/schema/ownership/idempotency và regression có kiểm phù hợp.
- Lint/typecheck/build/tests theo mức thay đổi; kiểm container/browser nếu đổi runtime. Migration/restore kiểm khi có data/schema change.
- Spec/system design/functions/UI/audit, code-map và HANDOFF khớp code. Dịch vụ ngoài chưa kiểm ghi NOT VERIFIED; feature chưa sẵn sàng không được bật trong release.

## Sprint và release

Mỗi sprint đề xuất2 tuần; **không có ngày bắt đầu/kết thúc hoặc cam kết12 tuần**. Script không tự start sprint. Chỉ chuyển Proposed sang Committed/Active khi có ngày/capacity/giờ mỗi tuần; checker chặn Core dev SP vượt75% capacity đã nhập. Capacity này phải được owner ước lượng sau khi dành thời gian content/review, không tự suy ra từ giờ.

Core không phụ thuộc Stretch. Nếu phụ thuộc chưa xong, ưu tiên carry-over hoặc đổi phạm vi, không bỏ gate. Stretch chưa làm thì giữ backlog và không bật tính năng thiếu kiểm chứng. M1→M2 là grammar pilot→beta tự học local; M3 là context learning; M4 là release readiness và cần PO go/no-go riêng.

Sprint1 nên bắt đầu bằng PB-001-T01 (spec ngữ pháp) và PB-004-T01 (duyệt gold cases), sau đó theo dependencies vào content5 bài và exercise. Kế hoạch này chưa đánh dấu các task đó In progress.

## Giới hạn công cụ

[planning.mjs](../../scripts/planning.mjs) kiểm reference, cycle, states, evidence, dependency và drift; không kiểm năng lực giáo viên, không tự gọi AI, không sửa app/DB, không liên kết Jira/Linear và không tạo thông báo lịch tự động. CSV là view chỉ để đọc/lọc; đổi JSON rồi sinh lại để tránh nhiều nguồn trạng thái.

Căn cứ: [hiện trạng](../project-status.md), [audit hiện có](../audits/baseline-integration.md), [ý tưởng](../../project-idea/Project_IDEA.md). Nghiên cứu tham khảo đã dùng cho hướng product: [Hàn Quốc Lý Thú](https://hanquoclythu.com/2023/02/ngu-phap-tieng-han-topik-ii/), [Tiếng Hàn Thú Vị](https://www.tienghanthuvi.edu.vn/2026/08/tram-ngu-phap-tieng-han.html), [Online Sejong](https://www.iksi.or.kr/lms/main/curriculum.do), [LingQ](https://www.lingq.com/en/learn-korean-online/). Đây là đầu vào lập kế hoạch, không là yêu cầu sao chép học liệu hoặc chứng nhận chất lượng.
