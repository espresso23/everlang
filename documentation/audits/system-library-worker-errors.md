# Audit — Kho hệ thống và worker exceptions

Ngày2026-10-31; branch `bugfix/sample-audio-player`, HEAD13d432b + working changes. Giữ branch và các sửa audio có sẵn vì tree đang dirty; không stash/reset/chuyển công việc sang branch khác. Phạm vi user: học liệu thuộc hệ thống theo ngôn ngữ, người học xem/lưu riêng; sửa PG worker crash và AI429, tuân thủ handler chung.

## Review độc lập sau triển khai

- Root cause đối chiếu code→runtime: log worker cũ có `Unhandled 'error' event` và `Connection terminated unexpectedly`; Pool thiếu error listener, async failed callback không catch. Không đưa raw pg client/log có connection metadata vào bằng chứng.
- API đã có `api`→`withApiLogging`; tái sử dụng `log`/`logError`, không thay global lifecycle của Next. Standalone workers thêm fatal boundary với exit1, không nuốt exception rồi chạy tiếp. [Contract chuẩn](../shared/error-handling.md).
-429 upstream giữ status/Retry-After dù body không phải JSON; shared Redis cooldown, concurrency1, retry hữu hạn; không đổi model hoặc gọi fallback trả phí. SQL mutation không retry tự động. Failed-event persistence lỗi được reconcile từ Redis failed job, không gọi AI lại.
- Kho nội dung Mongo là hệ thống và chỉ published; GET không lọc tác giả, metadata language=ko/ownership=system, language chưa hỗ trợ400. Các bảng state/SRS/attempt tiếp tục theo user. UI mô tả rõ học liệu chung và bản lưu cá nhân, giữ bố cục.

## Kết quả

| Gate | Kết quả | Cách kiểm/bằng chứng |
|---|---|---|
| Unit regression | PASS70/70,11files | `npm test`; [runtime errors](../../tests/unit/runtime-errors.test.ts), [worker fault injection](../../tests/unit/grading-worker.test.ts). Bao gồm429HTML/status/header, parser date/cap, log nested/cycle/redaction, Pool event, fatal exit, guarded listener, API requestId/500, startup recovery, terminal reconciliation. |
| Real Redis cooldown + PG reconnect | PASS | `docker compose run --rm --no-deps --volume D:/Project/langz/tests/integration:/app/tests/integration:ro worker node --import tsx tests/integration/worker-runtime.ts`. [Probe](../../tests/integration/worker-runtime.ts) dùng queue UUID riêng,2attempts cách1222ms theo cooldown1200ms; ngắt chỉ PG backend của probe, pool emit structured event/reconnect SELECT1. Queue QA được obliterate trong finally.0provider calls. |
| Fatal child processes | PASS | Cùng probe spawn2Node children: uncaught exception và rejected promise đều structured log, exit1; không default dump attached client. |
| Kho chung và lưu riêng | PASS2E2E/34.4s | `E2E_BASE_URL=http://localhost:3001 E2E_KNOWLEDGE=1 E2E_CATALOG=1 npx playwright test tests/e2e/knowledge.spec.ts tests/e2e/vocabulary-catalog.spec.ts`; actual auth/verified/admin/Mongo/PG, metadata language/ownership, unsupported language400, draft404, cùng published detail, bookmark/note/attempt/SRS isolation, CAS/quota/pins/legacy. Lượt này không chạy optional bridge/outage endpoint flags. |
| UI scoped | PASS | Ảnh [knowledge mobile](../features/knowledge-library/assets/reader-mobile.png), [catalog desktop](../features/vocabulary-catalog/assets/learner-desktop.png), [catalog mobile320](../features/vocabulary-catalog/assets/learner-mobile.png), [SRS recall](../features/vocabulary-catalog/assets/srs-recall.png). Review ảnh mobile không tràn; screenshot là dữ liệu QA tự tạo. Chỉ sửa nội dung mô tả, không đổi layout. |
| Cleanup | PASS | Xóa37synthetic catalog revisions,4synthetic knowledge revisions và4reserved QA accounts có name/email khớp test; candidate `langz-runtime-qa` removed. Không auto-publish seed thật, không xóa người dùng/học liệu thật. |
| Final lint/typecheck/build/deploy | PASS | Targeted ESLint0errors/warnings, tsc exit0, Docker production42routes; app+worker recreate và worker ready. Chi tiết bên dưới. |
| Live provider recovery và speech hardware | NOT VERIFIED | Không gọi OpenRouter/Gemini thật trong lượt sửa, chưa xác minh quota upstream đã hồi phục; không có scoring pronunciation/audio quality hay full speech runtime regression. |

Audit từng feature: [platform](../features/platform-operations/audit.md), [AI grading](../features/ai-grading/audit.md), [speech](../features/self-hosted-speech/audit.md), [knowledge](../features/knowledge-library/audit.md), [catalog](../features/vocabulary-catalog/audit.md). Không đóng toàn bộ feature/backlog vì chỉ kiểm phạm vi sửa này.

## Final deployed verification

- `docker compose build app worker` PASS42routes; TypeScript build và host `npx tsc --noEmit` đều exit0. Targeted lint sạch; full npm lint0errors,1warning có sẵn trong .local/catalog-final-counts.ts (không đổi file đó).
- `docker compose up -d --no-deps app worker` PASS; app/worker running, PG/Mongo/Redis/Mailpit healthy; worker log mới có `EverLang grading worker ready`. Không có fatal event trong phần log mới được kiểm ở thời điểm handoff.
- Probe trên final worker image (không bind source): `docker compose run --rm --no-deps worker node --import tsx tests/integration/worker-runtime.ts` PASS:2attempts,1212ms cooldown; idle PG reconnect,2fatal child cases;0provider calls. Không ngắt socket của app/worker thật, không dừng DB/Redis.
- Playwright smoke final3000 với API fixtures cho UI/empty state tại1440/390/320 đạt, không horizontal overflow/pageerror; ảnh [knowledge390](../features/knowledge-library/assets/system-library-390.png), [catalog390](../features/vocabulary-catalog/assets/system-library-390.png). Không dùng fixture làm bằng chứng auth/data; các luồng auth/data thật đã kiểm riêng trên candidate ở bảng trên.
- Final cleanup query: catalog53draft/0published,0synthetic catalog,0reserved catalog QA accounts. Knowledge cleanup4revisions và2reserved accounts đã thực hiện; không tự xuất bản nội dung thật.
- Rollback images được giữ trước deploy: `everlang-before-worker-errors:local` (app), `everlang-worker-before-errors:local` (worker). Schema/data thật không đổi; giữ volumes, không down-v/drop/migration. Speech worker source đã sửa boundary, nhưng profile disabled không rebuild/activate image speech-native/API hay kiểm inference trong lượt này.
- `docs:sync`/`docs:check`17features/152source-config, `plan:check`38PBI/82tasks/6Proposed và diff whitespace check PASS; không sửa trạng thái planning vì đây là bugfix/hợp đồng kho đang có.
