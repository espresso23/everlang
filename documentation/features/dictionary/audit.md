## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: native route guard và build/typecheck; source service giữ query/cache/validation.
- NOT VERIFIED: KRdict provider lookup thật trên Nest.
- Evidence/checks: nest-auth.spec.ts; source review DictionaryService.get; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — dictionary

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Chưa xác minh chất lượng mọi dạng chia động từ; fallback không phải Mecab/KoNLPy. TTS dùng trình duyệt, không đảm bảo có giọng ko-KR. |

## Audit kết nối

Luồng phải kiểm: **Bấm/chọn tiếng Hàn → DictionarySelectionLookup → /api/dictionary → Redis/KRdict → popup + TTS/link**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Chưa xác minh chất lượng mọi dạng chia động từ; fallback không phải Mecab/KoNLPy. TTS dùng trình duyệt, không đảm bảo có giọng ko-KR.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

## 2026-11-01 — Runtime fix verification

See [dictionary/grading/SMTP/cleanup audit](../../audits/runtime-grading-compose-fix.md):85unit,29candidate E2E,2deployed smoke PASS. Relative native dictionary URL corrected; fresh ordinary grading click retries older failure using requestId idempotency; Mailpit removed from application runtime and unconfigured SMTP gives503 EMAIL_UNAVAILABLE. Scope/limits and no-provider-call evidence are explicit there; existing human/provider quality gates retained.
