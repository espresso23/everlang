## 2026-11-01 — Native Nest migration regression audit

## 2026-11-01 — ORM regression

Branch refactor/typeorm-data-access. Extended beta exam snapshots/attempt concurrency/save/submit PASS; live writing inference NOT VERIFIED. Global78unit/29E2E final candidate PASS. [Canonical ORM audit](../postgresql-orm-migration/audit.md) ghi commands, preservation/locks/error paths và external limits; [integration audit](../../audits/postgresql-orm-migration.md). Không đánh feature product Done hoặc giả xác minh provider live.

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: native exam start/read/autosave/version conflict/submit/objective result và isolation.
- NOT VERIFIED: cloud writing grading/full exam corpus.
- Evidence/checks: beta.spec.ts E2E_EXTENDED_TESTS=1; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — exam-practice

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/unit/learning.test.ts](../../../tests/unit/learning.test.ts) · [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Chưa có kho đề đầy đủ có quyền sử dụng, chưa chia phiên PBT hoàn chỉnh, không quy đổi điểm thành chứng chỉ. Không triển khai TOPIK Speaking/IBT/IELTS/HSK/JLPT. |

## Audit kết nối

Luồng phải kiểm: **Exam list → start SQL attempt → autosave → server deadline/submit → scoreExam → writing queue → result UI**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Chưa có kho đề đầy đủ có quyền sử dụng, chưa chia phiên PBT hoàn chỉnh, không quy đổi điểm thành chứng chỉ. Không triển khai TOPIK Speaking/IBT/IELTS/HSK/JLPT.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

## PostgreSQL-only re-audit — 2026-11-01

PASS scoped local regression on refactor/postgresql-only: former Mongo persistence now uses the canonical TypeORM content/archive store; existing native API/auth/ownership/admin/learner contracts verified in29candidate E2E and PG import/preservation probes.80unit/2postcutover smoke; runtime works with Mongo stopped. See [canonical audit/evidence](../postgresql-only/audit.md) for exact coverage, startup finding fixed, rate-limit hash caveat and rollback limits. Previous Mongo evidence above is historical; cloud/quality/owner/production limits remain NOT VERIFIED where recorded, not promoted by the DB migration.


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[Exams](../../../apps/web/app/exams/page.tsx): submit button → `save(true)`. Nộp bài có dialog Nộp bài/Hủy; chỉ true mới gọi save(true), server deadline/autosave không đổi.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md). Static review PASS cho caller; test UI mock/giới hạn thực tế ghi tại audit tích hợp, không suy thành kiểm tra backend/provider hoặc nghiệm thu toàn feature.

Final audit #14: PASS scoped;17mock UI tests trên dev và production standalone,88unit tests (1worker), lint/typecheck/build/docs/plan PASS. Đã sửa lỗi pending dialog khi caller unmount/browser Back bằng AbortController. [Bằng chứng, lệnh và giới hạn](../../audits/confirmation-ui-2026-11-02.md#final-audit-và-quyền-merge-của-owner). Owner ủy quyền self-test/audit rồi merge nếu đạt; không suy thành QA content/live provider.
