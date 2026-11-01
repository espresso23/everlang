# Audit skill EverLang UX/UI — 2026-11-01

Scope: tooling/docs, branch `chore/everlang-ux-ui-skill`, [issue #10](https://github.com/espresso23/everlang/issues/10). Không đổi runtime, UI, dữ liệu hoặc sprint. Tree sạch trước khi tạo branch; giữ branch admin và công việc trước đó.

## Acceptance và self-review riêng

| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| Skill discoverable, có metadata và đúng design authority | PASS | [SKILL.md](../../.agents/skills/everlang-ux-ui/SKILL.md), [openai.yaml](../../.agents/skills/everlang-ux-ui/agents/openai.yaml); không tắt implicit invocation; routing trong AGENTS/workflow |
| Audit component và hành trình học | PASS | Các mục Review experience and components / Gather evidence: roles, task transitions, state, responsive, keyboard, Vietnamese/Hangul |
| Phản biện và đề xuất bố trí có căn cứ | PASS | Critique and propose: severity, impact, evidence/hypothesis, placement/order, mobile, reuse/removal, tối đa hai phương án mỗi quyết định |
| Không tự đổi scope hoặc bịa kinh nghiệm/kết quả | PASS | Establish context / Deliver: review khác implementation, layout cần request, không giả user research hay credentials, tôn trọng QA gates |
| Validator cấu trúc | PASS | Python312 chạy `quick_validate.py .agents/skills/everlang-ux-ui` — `Skill is valid!` |
| Runtime/UI audit thật bằng skill mới | NOT VERIFIED | Lượt này tạo skill; chưa được giao màn hình cụ thể để audit. Không tuyên bố frontend đã đạt hoặc skill đã được forward-test độc lập |
| Lint/typecheck/build, behavioral TDD | N/A | Chỉ Markdown/YAML và routing skill; không thay code chạy. Kiểm docs, diff và metadata thay thế |

Self-review: đối chiếu lại yêu cầu owner với từng mục skill sau khi viết; liên kết tới docs/design và dependency skill đã tồn tại. Không sao chép token để tránh nguồn chuẩn thứ hai. Đề xuất component phải có mục đích/chi phí và dependency dữ liệu; không tự thêm component để làm đẹp. Không cần subagent cho skill hướng dẫn đơn, không có script hoặc mutation tự động.

Validation bổ sung PASS: `npm run docs:check` (20 features, 240 source/config files, 2007 local links), `npm run plan:check` (42 PBI, 90 task, 6 Proposed sprints), `git diff --check`. Kiểm lại metadata: prompt gọi đúng `$everlang-ux-ui`, không có scaffold TODO; tên và description phân biệt review UX/UI với backend-only. Không sửa work-items.json vì đây là tooling task, không thêm PBI/sprint sản phẩm; issue được map tại audit này. Chưa cài bản cá nhân ngoài repo. Bước tiếp: sử dụng skill cho một màn hình/luồng được owner giao và tinh chỉnh theo quan sát thực tế.
