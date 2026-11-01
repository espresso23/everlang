## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: native admin create/review/publish, deny early publish; learner403.
- AI draft generation/content quality chưa verified.
- Evidence/checks: beta.spec.ts E2E_EXTENDED_TESTS=1; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — content-authoring

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Cần audit nguồn/quyền học liệu trước phát hành rộng. Một trang tạo index có thể gọi provider nhiều lần; chưa có batching UI. |

## Audit kết nối

Luồng phải kiểm: **Admin form/AI draft → api(admin) → Mongo Sentence → review → publish → học viên đọc published**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Cần audit nguồn/quyền học liệu trước phát hành rộng. Một trang tạo index có thể gọi provider nhiều lần; chưa có batching UI.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

## 2026-10-31 — word set authoring integration
New /admin entry links to separately specified vocabulary-catalog editor; existing knowledge authoring contract unchanged. Actual admin-only catalog create → explicit review → publish PASS, mobile/keyboard/dirty-link guard PASS. [Catalog audit](../vocabulary-catalog/audit.md); not a claim all legacy authoring paths rerun.

## PostgreSQL-only re-audit — 2026-11-01

PASS scoped local regression on refactor/postgresql-only: former Mongo persistence now uses the canonical TypeORM content/archive store; existing native API/auth/ownership/admin/learner contracts verified in29candidate E2E and PG import/preservation probes.80unit/2postcutover smoke; runtime works with Mongo stopped. See [canonical audit/evidence](../postgresql-only/audit.md) for exact coverage, startup finding fixed, rate-limit hash caveat and rollback limits. Previous Mongo evidence above is historical; cloud/quality/owner/production limits remain NOT VERIFIED where recorded, not promoted by the DB migration.

## 2026-11-01 — PB-042-T01 / GitHub #9 admin workspace

Branch feature/admin-workspace, base5d84445; owner chọn mặc định Quản trị. Review riêng spec AW-01–04 → source → browser screenshots.

- AW-01: Form/useAuth chọn landing admin /admin/overview, learner /. Google start gửi callback /sign-in; reset-token/OAuth error không tự redirect. Google linking/profile/API callback không đổi.
- AW-02: Shell navigation theo route, có aria-current và mode switch; overview chỉ liên kết 3 editor thật. Existing /admin vẫn bài luyện. Không thêm count giả, API hay schema.
- AW-03: AdminLayout không mount children khi chưa có admin; Shell giữ pending/error trước protected tree. API server role guard không đổi, frontend không phải security boundary.
- AW-04: browser role fixtures kiểm admin email login/Google callback landing/deep links/editor navigation/study reload/back, learner denial không gọi API admin, session pending/error.
- TDD red: baseline callback không điều hướng; green sau Form effect. Review ảnh bắt header320px overflow rồi fixed-height overlap; red bounding-box link bottom90.3 > header69; scoped autoheight fix.
- 86unit/18files, lint, workspace typecheck, full Docker build (API/worker/web) PASS. Browser test5cases dùng HTTP role fixtures, không giả là real OAuth/database integration; sign-in deployed smoke không mock PASS. Không gọi cloud/SMTP/Mongo; không đổi DB.
- NOT VERIFIED: owner live Google login và thao tác trên account thật sau UI update; issue giữ Review/open đến bước này. Không chốt content quality hay #1 Done.
- Evidence: tests/e2e/admin-workspace.spec.ts; assets/admin-workspace-{1440,390,320}.png. Final commands/results được ghi tiếp sau kiểm tra final image.

Final image: full Docker build PASS; deployed web only localhost3000. Final role-browser5/5 PASS11.7s, sign-in deployed smoke1/1 PASS3.7s. Header/menu containment and no horizontal overflow verified1440/390/320; inspected final320 screenshot. Self-review complete; task Review/Pass, issue open for owner Google smoke.

## 2026-11-01 — Editorial workbench EW-01–05

Branch feature/editorial-content-workbench, GitHub #11/PB-043-T01. Separate review against current PRD; [integration audit](../../audits/editorial-workbench-2026-11-01.md) records nativePG/API and browser scopes, PASS/NOT VERIFIED and evidence. Draft/private state/learner answer secrecy/CAS remain; no language quality approval or production go-no-go implied.
