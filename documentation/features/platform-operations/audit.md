## 2026-11-01 — System design diagram audit

- Branch docs/system-design-diagram; source snapshot686d87c. PASS: topology đối chiếu Gatewayfile/Compose, apiFetch/AuthService/JwtGuard, JobsService/SubmissionsGradeService, Redis/CorrelatedQueue, hai WorkerHost, SpeechService/storage/SpeechAudioService/PrivateAudio và provider modules.
- PASS: phân biệt UI routes/API; không browser→database; PG giữ durable progress/jobs, Mongo system content, Redis cache/queue; worker→PG và optional ASR/AI đúng đầu mút. Shared packages là import, không service. Ba luồng auth/grading/speech và direct API integrations có giải thích tiếng Việt tại shared architecture.
- PASS: ảnh PNG3840×1538 và SVG được render/xem trực quan; DOT source giữ node/edge có thể chỉnh. AI draft ban đầu loại bỏ vì edge dễ hiểu sai; ảnh final dựng vector từ source. Không đổi dependencies/runtime/schema, không gọi provider sản phẩm, không secret trong prompt/diagram.
- Verification: structural docs:check, DOT edge assertions và PNG metadata; không rerun lint/build/E2E vì chỉ thay tài liệu/assets. Existing provider/live/production NOT VERIFIED giữ nguyên. [Ảnh và walkthrough](../../shared/architecture.md#system-design-diagram), [provenance](assets/everlang-system-design.prompt.md).

## 2026-11-01 — Native Nest migration regression audit

Branch `feature/nestjs-jwt-migration`, baseline `0b34a97`; review riêng sau implementation.

- PASS: build/typecheck/lint/native startup, global filter, safe logs/trace, PG/Mongo restore/fresh008; cutover evidence xem migration audit.
- External production infrastructure/SMTP/HTTPS certificate chưa verified.
- Evidence/checks: nest-boundary/runtime-errors unit; native HTTP; restore scripts; [bảng tích hợp và lệnh tái hiện](../../audits/nestjs-jwt-migration.md), [kết quả migration](../backend-nestjs-migration/audit.md).
- Functions/routes hiện tại: [function map](functions.md); auth/error chuẩn trong shared docs. Audit phía dưới trước ngày này là provenance của backend cũ, không chứng nhận runtime Nest. Không đánh dấu toàn feature Done chỉ vì migration build được.

# Audit — platform-operations

## 2026-10-31 — WBS/backlog/sprint tracking nội bộ

PASS phạm vi công cụ/tài liệu:31 unit tổng (8 planning tests), lint/typecheck/build, plan:check/docs:check, thử drift và CRLF. Model:14 baseline domains +33 PBIs/72 task/6 sprint Proposed, user solo/reviewer, giờ/tuần TBD. Không đổi runtime/provider hoặc đánh dấu product task Done. Xem [audit riêng](../../audits/project-planning.md) và [guide](../../planning/README.md).

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/unit/learning.test.ts](../../../tests/unit/learning.test.ts) · [tests/unit/grading.test.ts](../../../tests/unit/grading.test.ts) · [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Local Mailpit không chuyển email tới Gmail. Production cần SMTP/domain/HTTPS thật. Tên ảnh worker vẫn chứa dependencies development; chưa tối ưu kích thước image. docs:check chỉ là kiểm tra cấu trúc. |

## Audit kết nối

Luồng phải kiểm: **Browser → Next → API guard/services → SQL/Mongo/Redis/providers; Docker migrations → app/worker; Caddy → app**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Local Mailpit không chuyển email tới Gmail. Production cần SMTP/domain/HTTPS thật. Tên ảnh worker vẫn chứa dependencies development; chưa tối ưu kích thước image. docs:check chỉ là kiểm tra cấu trúc.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.

### Speech operation extension2026-10-31

App/speech API worker build PASS, source/model native build/checksum PASS; metadata+private volume restore PASS; rollback original tag unavailable so rebuild cc1c776 image and bootstrap3002/sign-in200. Gemini failure pipeline verified; successful inference/Free tier availability NOT VERIFIED. Canonical [speech audit](../self-hosted-speech/audit.md) and [evidence](../self-hosted-speech/assets/verification.md), not a claim of all baseline operations reverified.

### Catalog schema/runtime extension2026-10-31
007 migration backup/restore + reviewed-card probe + bridge legacy API PASS; main rebuilt/deployed after candidate integration, QA accounts/fixtures/containers removed. Main anonymous catalog APIs401, page shells200; Mongo53drafts/0published/0synthetic QA. [Catalog evidence](../vocabulary-catalog/assets/verification.md), [rollback contract](../../shared/operations.md). No claim production Internet SMTP/Google audio/new physical device validated.

## 2026-10-31 — Kho hệ thống và xử lý exception worker

Branch `bugfix/sample-audio-player`, HEAD13d432b + working changes. PASS theo phạm vi ghi nhận:70unit, Redis cooldown/PG idle reconnect/fatal child probes,2real library E2E34.4s và UI scoped. Xem [audit tích hợp](../../audits/system-library-worker-errors.md) cho yêu cầu/code/steps/evidence/cleanup và final build/deploy. NOT VERIFIED với live provider recovery, speech hardware, chất lượng nội dung/điểm phát âm và các gate legacy ngoài phạm vi. Không coi toàn feature Done.
