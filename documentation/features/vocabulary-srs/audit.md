## 2026-11-01 — Pre-merge due-clock regression

FAIL before: first full27E2E run hid a freshly saved card when browser clock lagged PostgreSQL. PASS after: native GET /api/vocabulary includes serverNow; UI uses server timestamp. Catalogue integration intentionally runs browser -5minutes then +365days; due recall/reveal passes, future reviewed card stays unavailable. Full27E2E rerun PASS2.1m, unit77PASS/lint/typecheck/build. No persisted card/due/rating/FSRS/layout change. [Shared SRS contract](../vocabulary-srs/system-design.md), [test](../../../tests/e2e/vocabulary-catalog.spec.ts), [migration audit](../backend-nestjs-migration/audit.md). External/content gates below remain unchanged.

## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: review concurrency/CAS, owner isolation, sense/catalog save giữ lịch và dedup.
- Không thay kết luận chất lượng learning cũ.
- Evidence/checks: beta.spec.ts, vocabulary-catalog.spec.ts; learning unit; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — vocabulary-srs

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/unit/learning.test.ts](../../../tests/unit/learning.test.ts) · [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Chưa có optimizer cá nhân hóa từ lịch sử dài hạn; dùng preset FSRS-7. |

## Audit kết nối

Luồng phải kiểm: **Kho từ/review UI → API → SQL row lock/version → FSRS review → card/review_logs commit → refresh UI/dashboard**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Chưa có optimizer cá nhân hóa từ lịch sử dài hạn; dùng preset FSRS-7.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

## 2026-10-31 — catalog integration regression
PASS actual pipeline: save sense → real FSRS review → cross-set duplicate → unchanged card/due/log/version; manual-card mapping preserves schedule/notes; different senses same term have independent cards. New context saves Korean-only; matching canonical snapshot translations hidden before reveal, personal context retained. TTS cancel/timer lifecycle unit PASS, physical Korean voice NOT VERIFIED. [Integration audit](../../audits/vocabulary-catalog-integration.md), [verification](../vocabulary-catalog/assets/verification.md).
