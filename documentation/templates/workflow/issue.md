# <task-id hiện có> — <kết quả quan sát được của một slice>

Template; lưu tại `features/<feature-id>/issues/<task-id>.md`. Trạng thái lấy từ work-items.json; không tạo trạng thái local cạnh tranh.

- Feature/PRD + REQ IDs:
- PBI/task ID hiện có; nếu chưa có, refine tracking trước giao implementation:
- GitHub URL: chưa đăng; điền URL thật sau khi tạo nếu được yêu cầu.
- Marker chống trùng ổn định: `everlang-task:<task-id>`.
- Được giao bởi / phạm vi tự chủ:
- Dependencies (task IDs, contract, evidence):
- File/module dự kiến sửa; vùng tránh xung đột:

## Outcome và phạm vi

<Một hành vi chạy xuyên các lớp cần thiết, non-goals rõ. Không chỉ “tạo API” nếu chưa có cách kiểm đầu cuối.>

## Acceptance

| AC / PRD REQ | Given / When / Then | Bằng chứng cần |
|---|---|---|
| <AC-01/REQ-01> | <success> | <test/smoke có kết quả quan sát được> |
| <AC-02/REQ-02> | <lỗi/quyền/retry có ý nghĩa> | <evidence> |

## Luồng và hợp đồng

<UI/CLI → auth → API/service → worker nếu cần → storage → phản hồi. Payload/schema/lỗi/ownership; tham chiếu docs chuẩn. N/A cần lý do.>

## Kế hoạch kiểm tra

- Test hành vi cần red → green → refactor hoặc lý do TDD N/A:
- Lệnh unit/integration/E2E và setup cô lập; không dùng dữ liệu thật:
- Lint/typecheck/build/backend/docs/planning theo mức ảnh hưởng:
- Migration/restore/responsive/accessibility/provider: áp dụng hoặc N/A có lý do.

## Ready, dừng và bàn giao

- PRD/quyết định đã rõ, dependencies đạt, môi trường và quyền cần thiết:
- Stop condition và cách khôi phục/checkpoint:
- Evidence bền vững ở feature, audit và HANDOFF cần cập nhật:
- Agent self-review rồi đưa Review; chủ dự án human QA/Done/merge/deploy.
