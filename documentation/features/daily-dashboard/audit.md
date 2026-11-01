## 2026-11-01 — Native Nest migration regression audit

## 2026-11-01 — ORM regression

Branch refactor/typeorm-data-access. Daily plan/study day/SRS state trong extended beta PASS. Global78unit/29E2E final candidate PASS. [Canonical ORM audit](../postgresql-orm-migration/audit.md) ghi commands, preservation/locks/error paths và external limits; [integration audit](../../audits/postgresql-orm-migration.md). Không đánh feature product Done hoặc giả xác minh provider live.

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: daily snapshot/version/streak/task update và isolation trên native API.
- Adaptive roadmap/product backlog chưa thuộc migration.
- Evidence/checks: beta.spec.ts; learning unit; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit cập nhật — nền sáng và sổ tay

2026-10-30, bugfix/lighten-editorial-surfaces, baseline50197f5. PASS trong phạm vi presentation: lint/typecheck/production Docker build,6 Playwright UI tests. Rà empty/filled notebook và màu kế thừa, link ôn, typography/focus, desktop/mobile và structural baseline. Không thay API/DB/auth, không chứng nhận lại dịch vụ ngoài hoặc toàn bộ WCAG.

[Audit tích hợp và ảnh](../../audits/light-editorial-surfaces.md). UI regression fixture chỉ chứng minh render/state, không giả làm dữ liệu người dùng.

## Lịch sử audit trước thay đổi nền

# Audit — daily-dashboard

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/unit/learning.test.ts](../../../tests/unit/learning.test.ts) · [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Chưa có AI lập lịch, notification hoặc cron bắt buộc. Rule-based tạo khi mở dashboard. |

## Audit kết nối

Luồng phải kiểm: **Dashboard → GET profile/stats/due/drafts → makePlan → daily_plans → PATCH task → study_days → streak/UI**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Chưa có AI lập lịch, notification hoặc cron bắt buộc. Rule-based tạo khi mở dashboard.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.
