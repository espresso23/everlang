## 2026-11-01 — Native Nest migration regression audit

## 2026-11-01 — ORM regression

Branch refactor/typeorm-data-access. HTTP→PG→BullMQ→WorkerHost→failed/409 retry trace PASS;429/cooldown containment unit/runtime PASS. Live AI inference NOT VERIFIED. Global78unit/29E2E final candidate PASS. [Canonical ORM audit](../postgresql-orm-migration/audit.md) ghi commands, preservation/locks/error paths và external limits; [integration audit](../../audits/postgresql-orm-migration.md). Không đánh feature product Done hoặc giả xác minh provider live.

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: HTTP→SQL→BullMQ→native WorkerHost, 3 attempts/no key failure, cached409; unit429 cooldown và recovery.
- NOT VERIFIED: live OpenRouter quota/provider recovery/quality trên Nest; không gọi provider trả phí.
- Evidence/checks: nest-auth.spec.ts, grading-retry.spec.ts; grading-worker/runtime-errors unit; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — ai-grading

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/unit/grading.test.ts](../../../tests/unit/grading.test.ts) · [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Đã có smoke OpenRouter thật trong audit trước, không thay bộ chuẩn do người chấm. Cần kiểm định sư phạm và drift model; provider 401/429/5xx không được giả thành điểm hợp lệ. |

## Audit kết nối

Luồng phải kiểm: **POST grade → SQL queued → BullMQ → worker → OpenRouter → validate JSON → SQL completed/failed → GET jobs → GradeModal**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Đã có smoke OpenRouter thật trong audit trước, không thay bộ chuẩn do người chấm. Cần kiểm định sư phạm và drift model; provider 401/429/5xx không được giả thành điểm hợp lệ.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

## 2026-10-31 — Kho hệ thống và xử lý exception worker

Branch `bugfix/sample-audio-player`, HEAD13d432b + working changes. PASS theo phạm vi ghi nhận:70unit, Redis cooldown/PG idle reconnect/fatal child probes,2real library E2E34.4s và UI scoped. Xem [audit tích hợp](../../audits/system-library-worker-errors.md) cho yêu cầu/code/steps/evidence/cleanup và final build/deploy. NOT VERIFIED với live provider recovery, speech hardware, chất lượng nội dung/điểm phát âm và các gate legacy ngoài phạm vi. Không coi toàn feature Done.

## 2026-10-31 — Cached grading failure và retry action

Branch bugfix/retry-failed-grading.74unitPASS; failed duplicate đổi502→409/machinecode và retry explicit trong alert, giữ draft/dedup/history. [Audit/bằng chứng/final gates](../../audits/grading-retry.md). Chưa xác minh provider thật hồi phục, không chạy cloud hoặc tự tạo report/score.

## 2026-11-01 — Runtime fix verification

See [dictionary/grading/SMTP/cleanup audit](../../audits/runtime-grading-compose-fix.md):85unit,29candidate E2E,2deployed smoke PASS. Relative native dictionary URL corrected; fresh ordinary grading click retries older failure using requestId idempotency; Mailpit removed from application runtime and unconfigured SMTP gives503 EMAIL_UNAVAILABLE. Scope/limits and no-provider-call evidence are explicit there; existing human/provider quality gates retained.
