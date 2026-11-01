## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: native draft CAS, history owner guards, favorites/stats routes và isolation.
- Import archived owner mapping không chạy lại trên dữ liệu thật.
- Evidence/checks: beta.spec.ts, nest-auth.spec.ts; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — learning-records

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Import lịch sử thật chưa thực hiện vì phải đối chiếu UUID và tài khoản đã xác minh. Fixture từng kiểm tra import lần đầu 1, lần lặp 0. |

## Audit kết nối

Luồng phải kiểm: **Practice/Profile → API cá nhân → SQL ownership/version → history/stats/UI; CLI riêng đọc legacy Mongo → SQL**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Import lịch sử thật chưa thực hiện vì phải đối chiếu UUID và tài khoản đã xác minh. Fixture từng kiểm tra import lần đầu 1, lần lặp 0.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.
