# TypeORM re-audit và phản biện kiến trúc/phạm vi

2026-11-01 (+07:00), branch `refactor/typeorm-data-access`, HEAD `25b96d3`, review working tree chưa commit. Theo yêu cầu owner: kiểm handoff, tiến độ ORM, khả năng merge và system design/scope; không sửa runtime, commit, merge hoặc deploy.

## Kết luận merge

**Conditional GO về kỹ thuật; chưa merge ngay.** Không phát hiện lỗi mới chặn merge trong phạm vi đọc và kiểm lại dưới đây. PB-040-T01/T02 vẫn Review, chờ human QA. Đây không phải chứng nhận toàn sản phẩm hoặc mọi nhánh lỗi đã đúng.

- HEAD chỉ hơn local `main` một commit sơ đồ; toàn bộ implementation ORM còn trong working tree, có file mới untracked bắt buộc như `orm.ts`, `entities.ts`, `orm-migrations.ts`, `database.module.ts` và tests. Merge branch ở trạng thái hiện tại sẽ chưa đưa các file đó vào main.
- Tree còn chứa thay đổi workflow/skills đã được owner cho phép trước đó. Chuẩn bị commit có phạm vi rõ, kiểm đủ file mới và diff được stage; tránh đưa nhầm các file private/QA. Không cần reset/stash/chuyển branch để làm việc này.
- Trước merge: owner QA login/refresh/logout, profile, draft conflict giữa hai tab, save/review SRS và graded-job failure/retry trên candidate; đối chiếu bản commit cuối với evidence. Nếu executable code thay đổi sau audit thì chạy lại checks liên quan. Không dùng smoke anonymous dưới đây thay QA các luồng này.
- Google live/link, provider AI/ASR/KRdict, production SMTP/HTTPS và chất lượng học liệu còn NOT VERIFIED theo feature. Chúng không tự trở thành lỗi hồi quy ORM; tiếp tục là gate trước khi phát hành/bật chức năng tương ứng.

## Phạm vi đọc và kết quả hiện tại

Đối chiếu [handoff](../../HANDOFF.md), [PRD ORM](../features/postgresql-orm-migration/README.md), [audit trước](../features/postgresql-orm-migration/audit.md), [evidence trước](../features/postgresql-orm-migration/assets/verification.md), shared architecture và planning. Đọc hạ tầng DataSource/migrations/entities/rate limit/queue/lifecycle; rà các điểm transaction, upsert, auth refresh, drafts, review, profile, catalogue, grading/speech workers và CLI theo diff/tìm kiếm. Không tuyên bố review từng dòng của toàn repo.

| Kiểm tra chạy lại trong lượt này | Kết quả |
|---|---|
| `npm test` | PASS 78/78, 15 files |
| `npm run typecheck`, `npm run lint` | PASS |
| `npm run build` | PASS contracts/backend/API/worker/Next web |
| `npm run backend:check` | PASS; không còn SQL facade/direct pg runtime trong applications |
| `npm run docs:check`, `npm run plan:check` trước ghi audit | PASS 19 features/232 source-config/1835 links; 40 PBI/86 tasks/6 Proposed |
| `npx tsx tests/integration/orm-preservation.ts` với DATABASE_URL trỏ PG mới tách biệt | PASS fresh: 25 mappings, 9 migrations, rerun 0, JSONB/vector, conflict, rollback, corrupt history rejection, quota 24 attempts/7 allowed |
| `npx playwright test tests/e2e/beta.spec.ts tests/e2e/nest-auth.spec.ts --grep 'EverLang sign-in\|every private native domain'` | PASS 2/2, 6.8s; localhost3000 đang deploy, responsive sign-in/anonymous guard |
| GET `/api/health/ready`; Compose status | PASS ready/queueAvailable true; API/web/worker running, PG/Mongo/Redis healthy |
| Restore/adoption 24-table preservation, Redis outage/recovery, full 29 E2E, Docker build | NOT RE-RUN trong lượt này; chỉ có evidence của lượt migration trước |
| Provider live, pronunciation quality, human QA | NOT VERIFIED |

Fresh probe dùng container riêng `everlang-orm-reaudit-20261101`, port55439, không mount volume người dùng; đã xóa container sau kiểm. Không chạy migration/fault injection trên DB/Redis hiện hành. Build từ source hiện tại; smoke kiểm bản deploy hiện hành, không suy ra chúng là cùng một immutable artifact.

## Phản biện system design

1. **Topology hiện tại hợp lý để giữ, chưa có bằng chứng cần thêm service.** Web/API/worker tách trách nhiệm; PostgreSQL authoritative, Mongo học liệu versioned, Redis queue/cache. Tuy nhiên hai DB tăng việc backup/restore và đối chiếu snapshot. Giữ cấu trúc hiện có cho mốc gần nhất; chỉ xem xét gom DB khi có số đo chi phí vận hành, không mở một migration lớn khác chỉ để đơn giản sơ đồ. Căn cứ: [architecture](../shared/architecture.md), [catalog learning](../../packages/backend/src/catalog-learning.ts) đọc Mongo trước khi lưu snapshot/tiến độ PG.
2. **Đã đổi công cụ truy cập dữ liệu, chưa chứng minh thiết kế nghiệp vụ đã sâu hơn.** Nhiều service vẫn lắp chuỗi QueryBuilder, raw projection/`getRawMany()` và quản lý transaction trực tiếp; typing EntitySchema không kiểm được toàn bộ SQL expression/raw result. `ProfileService.put` và `AuthService.refresh` là ví dụ. Giữ merge ORM tập trung vào parity; khi sửa từng slice sau này, đưa invariant/CAS/transaction vào interface nghiệp vụ nhỏ, kiểm qua hành vi. Không thêm repository wrapper chỉ chuyển tiếp.
3. **Resilience đổi rủi ro từ Redis sang tải PG, cần đo.** [rateLimit](../../packages/backend/src/rate-limit.ts) dùng transaction insert+update cho mỗi lần gọi, giữ connection khi cleanup best effort; pool mỗi process max10 ở [databaseOptions](../../packages/backend/src/orm.ts). Probe 24 calls chứng minh tính nguyên tử, chưa chứng minh latency/throughput. Cần benchmark login/save khi limiter và workers cùng tải trước public rollout; hiện chưa có số đo để kết luận nghẽn hay mở rộng pool.
4. **Durable recovery có, chi phí recovery chưa bị giới hạn theo batch.** [recover](../../apps/worker/src/grading.processor.ts) quét tất cả queued/active submissions và queued writing mỗi30s, rồi hỏi Redis từng job. Đây là rủi ro tăng theo backlog, không phải lỗi mới được xác nhận do ORM. Khi có backlog thực, thêm batch/index/query-plan và tuổi job lâu nhất; tránh coi polling là khả năng vận hành đã đủ.
5. **Readiness degraded cần hợp đồng vận hành rõ.** [HealthController.ready](../../apps/api/src/health.controller.ts) chủ ý trả200 khi Redis down để giữ auth/read/save. Dashboard/probe phải đọc `queueAvailable` và theo dõi tuổi pending job; chỉ theo HTTP200 sẽ không thấy queue gián đoạn. Chưa có benchmark SLA/RTO hoặc monitoring production được xác minh trong audit này.

## Phản biện scope và quyết định owner

- Theo [planning](../planning/README.md), dự án solo, hours/week chưa chốt và cả6 sprint còn Proposed. Mục tiêu gồm học liệu/ngữ pháp, SRS, đọc-nghe, viết/dịch, tutor, speech, hội thoại, diagnostic/path. Không có căn cứ đổi task count thành phần trăm hoàn thành hoặc hứa ngày hoàn tất.
- Nút thắt hiện tại là nội dung reviewed, audio thật và bằng chứng chất lượng học/AI, trong khi hạ tầng đã có nhiều lớp. Tiếp tục thêm module dễ tăng bề rộng mà chưa chứng minh một vòng học có giá trị.
- Tài liệu tiến độ có drift: planning README vẫn ghi38 PBI/82tasks trong khi checker đọc40/86; project-status còn ghi74unit “mới nhất” dưới cập nhật78; completion matrix nói “sense chưa có” trong khi catalogue sense-aware đã implement. `plan:check`/`docs:check` không bắt các mâu thuẫn ngữ nghĩa này. Dùng JSON và audit theo feature để quyết định tiến độ; cần đồng bộ các đoạn tổng hợp trước lập scope tiếp theo.
- Hai phương án đã đưa ra: (1) vòng học khép kín có học liệu được duyệt → luyện → SRS → tiến độ (khuyến nghị); (2) audio/phát âm benchmark trước, chấp nhận phụ thuộc provider. **Owner chọn (1) trong chat này.** Giữ nguyên mục tiêu toàn bộ tự học, không tự đổi thành pilot cuối cùng hoặc bỏ backlog.
- Đề xuất cho bước refine tiếp theo, chưa phải scope/AC đã duyệt: một bộ học liệu owner duyệt, luyện và lưu đúng sense vào SRS, ôn không reset lịch, tiến độ nhất quán trên hai thiết bị; đo học được gì và điểm nào còn gây bế tắc. Giới hạn lô nghiệm thu cần được chốt trong PRD canonical, không tạo PRD cạnh tranh ở audit này. Chưa giao triển khai task mới, không tự đổi sprint/status.

## Còn lại

Chuẩn bị artifact commit đầy đủ + human QA trước merge; đồng bộ các summary bị drift khi refine mốc vòng học. Giữ PB-040 ở Review. Không sửa executable code để giải quyết các đề xuất kiến trúc ngoài phạm vi review.
