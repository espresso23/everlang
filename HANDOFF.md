# HANDOFF — EverLang

Cập nhật gần nhất: 2026-11-01

## Trạng thái hiện tại

### 2026-11-01 — Admin workspace implemented; GitHub #9 Review

- Owner yêu cầu layout admin và chọn mặc định Quản trị sau login. Tạo PB-042-T01/issue #9 trước code, canonical content-authoring AW-01–04; branch feature/admin-workspace từ5d84445. Quyết định/scope nằm content-authoring/decisions.md. Issue #1 giữ scope, chưa owner duyệt content.
- Form đăng nhập dùng user.admin để replace /admin/overview hoặc /; Google login callback /sign-in, linking profile giữ nguyên. Shell có admin nav, aria-current và chuyển Học tập/Quản trị; AdminLayout chặn editor khi pending/error/nonadmin; overview link tới3module thật, /admin editor cũ giữ nguyên. Không API/schema/identity/provider change.
- TDD callback red→green; self-review ảnh bắt overflow/fixed-height overlap320px, thêm bounding-box regression red90.3>69 rồi sửa scoped admin-header autoheight. Final5role-browser PASS11.7s +1deployed smoke PASS3.7s;86unit, lint, workspace typecheck, fullDockerbuild/backend/docs/plan PASS. Role tests dùng HTTP fixtures, không được gọi là live Google/DB integration. Không paid provider calls.
- Web đã cập nhật local localhost3000; ảnh1440/390/320 +audit/evidence tại documentation/features/content-authoring. PB-042-T01 Review/Pass; issue #9 mở chờ owner logout→Google→overview→editor→Học tập→Quản trị. Không giả human OAuth QA, content review hoặc production Done.42PBI/90tasks/6Proposed, không tự chốt sprint hoặc merge/push.


### 2026-11-01 — Cho phép tài khoản Google hiện có quản trị

- Owner yêu cầu admin đăng nhập Google. Bổ sung tài khoản Google hiện có vào ADMIN_EMAILS trong .env local, giữ admin cũ; recreate riêng API bằng docker compose up -d --no-deps api. Không đổi mật khẩu hoặc credential/identity DB.
- Kiểm env runtime xác nhận allowlist admin Google và cấu hình Google có mặt. Live OAuth cần owner đăng nhập lại; chưa tuyên bố callback thành công. Mở /admin/knowledge sau login để duyệt bài cho issue #1. Không ghi mật khẩu/key vào tài liệu.


### 2026-11-01 — GitHub issue bắt buộc, publication và task mapping

- Owner yêu cầu các đầu việc có GitHub issue; hoàn tất thì mark Done, review và báo cáo. Lưu chỉ định trong AGENTS/workflow; review trước close completed, không giả content QA/production approval.
- Branch docs/github-delivery-issues từ main da15d5f sạch. Dùng everlang-session/prd-to-issue, đọc canonical contracts và task tracking. Plugin xác nhận repo espresso23/everlang nhưng create 403 Resource not accessible by integration; dùng gh đã authenticated tạo tuần tự, plugin fetch xác minh 8 issue thật.
- Đã đăng [#1–#8](https://github.com/espresso23/everlang/issues), map 20 task hiện có trong work-items.json/githubIssue và [index](documentation/planning/GITHUB_ISSUES.md). Scope: vòng học khép kín, catalogue content, SMTP/OAuth và PostgreSQL acceptance. Không tuyên bố toàn bộ roadmap đã đăng hoặc triển khai.
- Kiểm trùng cả open/closed, stable markers trước từng create; persist URL ngay sau create. Chuỗi #1→#2→#3→#4→#5; #6/#7 external inputs; #8 post-merge QA/release. Tất cả mở vì còn AC; không đánh Done sản phẩm từ publication. Giữ lịch sử và 41PBI/89tasks/6Proposed.
- [Audit](documentation/audits/github-issue-publication-2026-11-01.md): kiểm remote/local mapping, dependency, plan/docs/diff gates. Docs/tracking-only, không chạy lại runtime suites/provider calls, không triển khai hay push/merge thay đổi docs.


### 2026-11-01 — Sửa dictionary500, retry AI và dọn Docker; owner chỉ định merge/push

- User log6b5500df-bc0b-4898-998a-5f8fa56ac4bf là GET/api/dictionary18:53:25+07:00: newURL(request.url) không nhận URL tương đối Express. Dùng queryParams/originalUrl; red InvalidURL → green200/400 và authenticated native lookup PASS.
- AI trả lỗi cũ từ PostgreSQL dedup, không phải process cache: log18:52:01 trả409 do attempt cũfailed,18:52:06 retry202/workercompleted13.1s. Đổi normal click sau basefailed thành một requestId-keyed attempt mới; giữ failed history, cùngUUID không tạo jobtrùng/retryvôhạn, completedcache200 và force vẫn giữ. Không ghi learner text/report vào docs.
- Bỏ Mailpit khỏi application Compose/default SMTP target; sendAuthEmail quản lý transport/timeout, thiếu/lỗiSMTP trả503 EMAIL_UNAVAILABLE, không bypassverify hoặc fake delivery. Main hiện chưa cấu hình SMTP ngoài; tài khoản đã verified vẫn login. Mailpit chỉ testfixture đã dọn sau QA.
- PASS86unit/18files, lint/workspace+tools typecheck/backend/docs/plan, Dockerbuild,29candidate E2E2.6m và2deployed smoke3.3s; mainready/queueAvailable true sau cập nhậtAPI/worker. Candidate khôngAIkey; không gọi inference trả phí/SMTP ngoài, không chứng nhận providerquality. [Audit](documentation/audits/runtime-grading-compose-fix.md).
- Đã xóa23tagimages cũ củaEverLang/langz +2Mongo/Mailpit tags; chỉ còn6images cầnruntime (API/worker/web/PG/Redis/Caddy). XóaoldstoppedMongo/Mailpit/migratecontainers vàQAresources; KHÔNGvolumeprune/systemprune. PG/Mongo/Redis/media namedvolumes vàprivatebackups giữ nguyên; rollbackimage tags cũ đã xóa theo yêu cầu cleanup, có sourceGit/backups để dựng lại.
- Final self-review: thêm optionalsnapshot.gradingRequestId để replayUUIDgốcfailed không tạo thêmattempt; reportView bỏmarker khỏi report sentence. Nativeprobe PASS original/retryreplayidempotent, newclicknewjob, history2rows, dictionary200/400, missingSMTP503,0providercalls; finalimage đãrebuild/deploy,QAđãdọn.
- Branch bugfix/runtime-grading-and-compose từ987f594; owner yêu cầu rõ mergevàpushmain, bao gồm PostgreSQL-only trước đó. Gitmerge/push thực hiện sauchecks; không suy humanQA/content/sprintDone. PB-041-T03 giữID và đổi thành post-merge productionrelease gate, vẫn chờQA. Ưu tiênNEXT: ownerduyệt họcliệu → luyện →SRS→tiếnđộ; SMTP thực/corpus/audio/providerquality còn mở.


### 2026-11-01 — PostgreSQL-only đã triển khai, demo và local cutover

- TypeORM e0ad32f đã fast-forward local main theo quyết định owner; phần PostgreSQL-only thực hiện trên refactor/postgresql-only, chưa merge/push branch mới. Đầu ra chạy thật: localhost3000 dùng PostgreSQL cho cả người học và học liệu, Redis chỉ queue/cache; không Mongo/Mongoose runtime/env prerequisite, Mongo container cũ đã dừng nhưng volume/backup giữ nguyên.
- Nhập6collections/172documents:100sentences/1exam/13knowledge/53catalogue +5legacy reports/0states; archive nguồn trong PG, giữID/revision/snapshot. Thêm migration10/5tables,30mappings; existing admin review/publish/CAS, latest-before-search và pinned sense/FSRS giữ hợp đồng. Không auto-publish13knowledge/53catalogue draft.
- PASS80unit/16files, lint/workspace+tools typecheck, backend/docs/plan gates, Docker build;29candidate E2E2.6m và2postcutover smoke5.2s. Fresh10/rerun0/quota24→7/JSONB/vector, restored PG import/preservation/atomic conflict/CAS/pinned search/exam bootstrap, explicit legacy1new/0repeat/owner guard đều PASS. Candidate đầu còn config MONGODB_URI đã bắt bằng startup failure, sửa có red/green test rồi rerun29/29.
- Cutover18:40–18:42+07:00: queues0, stopAPI/worker, backup20261101-184025 PG/Redis/media +Mongo archive/finalexport private; restorelatestbackup và probe trước main PASS. Main1migration/rerun0; import172/rerun0;25oldtables/schema/index/constraint bằng nhau trước restart. Sau traffic,24stabletable rows và toàn bộ schema/index/constraint vẫn bằng nhau; rate_limit_buckets đổi expiry bình thường qua auth smoke (ghi rõ trong audit), không nhận là learner data loss hoặc giả PASS25tables sau traffic.
- [PRD/5docs](documentation/features/postgresql-only/README.md), [audit](documentation/features/postgresql-only/audit.md), [evidence/demo desktop-mobile](documentation/features/postgresql-only/assets/verification.md), [integration audit](documentation/audits/postgresql-only-integration.md); diagram DOT/SVG/PNG và shared contracts/source-map cập nhật. Task-ownedQAcontainers/PG/media đã dọn; nguồn Mongo/restore namespace/production volumes và rollback images giữ nguyên.
- Tracking refine thành một increment tích hợp PB-041-T01 Review/Pass (schema/cutover phụ thuộc chặt), T02/T03 giữID làm ownerQA/merge-decision gates. Không tự đánh dấu dependencyDone hoặc sprintDone;41PBI/89tasks/6Proposed. Owner chọn tiếp vòng học khép kín; corpus/audio/provider/production gates chưa được chứng nhận. Không gọi cloud hoặc đổi billing/speech profile.


### 2026-11-01 — PostgreSQL-only implementation checkpoint (đang xác minh)

- Theo yêu cầu owner, TypeORM commit e0ad32f đã fast-forward vào local main; không push. Branch mới refactor/postgresql-only triển khai PB-041, ba lát cắt có phụ thuộc, scope/REQ tại documentation/features/postgresql-only. Không tự chốt ngày/capacity sprint hoặc coi toàn bộ tự học Done.
- Đã chuyển sentence/exam/knowledge/catalogue + explicit legacy archive sang TypeORM/PG; bỏ Mongo/Mongoose runtime, Compose/env prerequisite và model cũ. Giữ ID/API/revision/ownership/FSRS; source/backups riêng được giữ.
- Dry run phục hồi PG vào container tách biệt PASS: nhập172documents/6collections, bảo toàn25bảng nghiệp vụ PG, rerun0, conflict rollback, sentenceCAS, latest-before-search/pinned sense. Fresh10migrations/30mappings/quota24→7 PASS; legacy import1new/0repeat/owner guard PASS;78unit/typecheck/lint/backend gates PASS. Docker build/candidate browser regression đang chạy; chưa cutover live trong checkpoint này.
- Next: xác minh image cuối, full candidate E2E, self-review, backup/export nhất quán/cutover local và demo; cập nhật audit/evidence/tracking Review theo kết quả thực tế. Snapshot/backup ở .local/backups/pgonly-20261101 là private; không ghi dữ liệu/token/URI credentials vào docs.


### 2026-11-01 — Owner yêu cầu merge ORM và triển khai PostgreSQL-only

- Owner chỉ định merge TypeORM vào main rồi tiếp tục bỏ MongoDB; đây là quyết định merge trực tiếp, không tự coi owner đã QA mọi provider hoặc đánh dấu Done.
- Kết quả re-audit ở mục dưới được giữ nguyên. Chuẩn bị commit đầy đủ ORM + workflow đã được cho phép, fast-forward local main; không push remote. Tiếp theo branch riêng chuyển học liệu/legacy records sang PostgreSQL, bảo toàn ID/version/dữ liệu và demo chạy thật; không chỉ viết ý tưởng. Ưu tiên vòng học khép kín vẫn giữ.


### 2026-11-01 — Re-audit TypeORM và phản biện system design/scope

- Theo yêu cầu owner, đối chiếu handoff/spec/code trên `refactor/typeorm-data-access`, HEAD25b96d3. Kết luận: conditional technical GO, chưa merge ngay; implementation ORM vẫn uncommitted/untracked, PB-040 Review chờ human QA. Không phát hiện blocker code mới trong phạm vi đã rà, không chứng nhận toàn repo/provider.
- Chạy lại PASS78unit/15files, lint/typecheck/build toàn workspace, backend/docs/planning gates, fresh PG riêng25mappings/9migrations/rerun0/JSONB/vector/conflict/rollback/history guard/quota24→7,2Playwright deployed smoke6.8s và ready/queueAvailable true. Full29E2E/restore/adoption/Redis outage/Docker build dùng evidence cũ, không chạy lại lượt này. Container PG audit riêng đã xóa; không đổi live DB/runtime/config.
- [Báo cáo re-audit và phản biện](documentation/audits/typeorm-reaudit-2026-11-01.md), [audit ORM](documentation/features/postgresql-orm-migration/audit.md). Ghi rõ giới hạn typing/raw QueryBuilder, chi phí PG limiter, recovery quét toàn backlog, readiness200degraded và drift trong summary tiến độ. Đây là đề xuất theo rủi ro, không tự mở refactor hoặc đổi công nghệ.
- Owner chọn mốc tiếp theo **học liệu duyệt → luyện → SRS → tiến độ**, giữ mục tiêu toàn bộ tự học. Chưa chốt lô/AC hoặc giao triển khai mới; chưa đổi tracking/sprint. Còn lại: gom commit đủ file mới, owner QA trước merge; refine canonical PRD và đồng bộ summary khi lập mốc vòng học. Giữ mọi edits có sẵn, không commit/push/merge/deploy.

### 2026-11-01 — Bắt buộc định tuyến và tuân thủ skill trong AGENTS.md

- Theo yêu cầu chủ dự án, bổ sung bảng công việc → skill → đầu ra vào `AGENTS.md`: session, PRD, grill-me, PRD-to-issue, issue-AFK. Agent phải chủ động chọn skill đúng phạm vi, đọc SKILL.md, thông báo lần đầu dùng và đối chiếu đầu ra; ưu tiên bản repo khi trùng bản cài cá nhân.
- Quy định xử lý skill thiếu, tránh nạp toàn bộ context/ép workflow cho việc nhỏ; giữ quyền tự chủ đã chốt và human QA. Cập nhật liên kết trong [workflow](documentation/workflow/README.md); kết quả kiểm tra tại [audit](documentation/audits/agent-delivery-workflow.md).
- Kiểm tra: self-review routing/đầu ra PASS; `docs:check` PASS (19 features/232 source files/1.835 links), scoped `git diff --check` PASS. Tự động dùng skill trong phiên tương lai chưa xác minh.
- Giữ branch `refactor/typeorm-data-access` theo ngoại lệ đã được cho phép; không thay code, skills, tracking hoặc các thay đổi ORM sẵn có. Lint/typecheck/build/runtime tests N/A cho chỉnh sửa hướng dẫn Markdown này.

### 2026-11-01 — TypeORM migration, Redis resilience và local cutover

- Branch refactor/typeorm-data-access từ25b96d3; PostgreSQL của API/auth/backend learning/catalogue/2worker processors/import CLI dùng25typed EntitySchemas + TypeORM QueryBuilder/repositories. Xóa SQL pool/facade/export/alias; pg chỉ là driver TypeORM. Mongoose ODM giữ nguyên. Đối chiếu AST inventory206calls/26files, chuyển196calls/24files gồm transaction primitives; ước lượng tìm kiếm224 ở mục khởi đầu không phải số CRUD cuối.
- Nest TypeOrmModule quản lý DataSource init/shutdown; QueryRunner giữ row/advisory locks/CAS/idempotency/JSONB/pgvector1536. TypeORM nhận lịch sử001–008 vào orm_migrations, migration9 thêm rate_limit_buckets; fresh/adopt/re-run/history corruption đều kiểm thực tế; synchronize/dropSchema false. Global handlers/QueryFailedError logging không dump SQL/params/client; CLI dùng fatal handlers chung.
- Theo câu trả lời làm những gì tốt nhất về Redis: PostgreSQL authoritative rate limit, hashed minute bucket/counter nguyên tử/expiry cleanup. Redis down: login/profile/draft+CAS tiếp tục, ready200 degraded, queue503/QUEUE_UNAVAILABLE/requestId; reconnect và recovery202 đã kiểm. Redis commandTimeout2s, API khởi động không chờ Redis healthy. Không suy rộng availability sang provider/cache riêng.
- PASS78unit/29E2E(2.8m), lint/workspace+tools typecheck/Docker build/docs/plan/backend gates. Native PG pool reconnect, Redis cooldown1345ms/fatal exit1; import CLI1new/0repeat/owner guard/Mongo original/cleanup. Full29run đầu27PASS/2FAIL đã sửa readiness timeout và trùng QA admin giữa2suite; rerun29/29PASS. Profile/progress upsert và insert count RETURNING được rà soát riêng.
- Local cutover15:50–15:52+07:00: queue wait/active/delayed0, dừng API/worker, backup PG/Mongo/Redis/private media20261101-155035 dưới .local/backups (private). Restore backup PG mới vào QA và kiểm adoption24table hash PASS; local áp dụng1migration, re-run0. Sau recreate API/worker/web/gateway, readiness ready/queueAvailable true;24table row/column/index/constraint hashes giống trước cả trước và sau startup;2post-cutover smoke PASS. Không invalidate JWT/session hoặc thay dữ liệu học hiện hữu.
- Docs: [ORM5docs/audit](documentation/features/postgresql-orm-migration/README.md), [evidence](documentation/features/postgresql-orm-migration/assets/verification.md), [integration audit](documentation/audits/postgresql-orm-migration.md),15feature function/design/audits/shared contracts, project-status/README và diagramDOT/SVG/PNG3840×1516. Source-map19features/232files; lịch sử cũ giữ nguyên, screenshots do test ghi lại được phục hồi.
- PB-040-T01/T02 Review/verification Pass, sprint vẫn Proposed; human QA/Done/merge/push còn phía owner. Google/cloud inference/ASR/KRdict/production gates cũ NOT VERIFIED, không tuyên bố release Done. Không commit/merge/push; giữ nguyên workflow/skills edits đồng thời ở AGENTS/docs/.agents. Images trước ORM giữ offline làm rollback checkpoint. QA-owned resources đã dọn theo danh sách trong evidence; không xóa namespace/backup sẵn có.


### 2026-11-01 — Workflow Context → PRD → issues → AFK và skills

- Chủ dự án xác nhận agent tự triển khai/kiểm tra issue được giao; chủ dự án QA, quyết định Done/merge/deploy. Cho phép bổ sung ngay trên `refactor/typeorm-data-access` đang có thay đổi ORM; giữ nguyên edits sẵn có, không switch/reset/stash/commit/push.
- Cập nhật `AGENTS.md`, mục lục docs, planning guide và templates feature PRD/system-design. Thêm [workflow chuẩn](documentation/workflow/README.md), [quyết định](documentation/workflow/decisions.md), [hướng dẫn phiên mới](documentation/workflow/NEW_SESSION.md), templates interview/vertical issue/context. README feature giữ PRD chuẩn; JSON giữ trạng thái task, không tự thay sprint/backlog.
- Bốn skills có nguồn tại `.agents/skills/`: `everlang-prd`, `prd-to-issue`, `issue-afk`, `everlang-session`; đã cài cùng nội dung vào thư mục skills cá nhân và kiểm hash. PRD → issue có mapping/duplicate guard/partial-failure recovery; AFK dừng Review cho human QA. Không tạo GitHub issues thật hoặc cài background runner trong lượt này.
- Kiểm tra: 4/4 `quick_validate.py` PASS, `plan:check` PASS (40 PBI/86 tasks/6 Proposed), `git diff --check` PASS; 1.786 relative links/157 Markdown files tồn tại (không kiểm anchors). `docs:check` baseline đã FAIL vì ORM source/hash drift; lần kiểm sau còn báo `scripts/import-records.ts`, không refresh hash ngoài phạm vi. Kết quả ghi tại [audit workflow](documentation/audits/agent-delivery-workflow.md).
- Còn lại: xác minh vòng chạy skill trên issue sản phẩm/GitHub thật khi được giao; human QA cho workflow. Không chứng nhận runtime ORM, provider hoặc toàn bộ legacy architecture qua lượt docs này. Lint/typecheck/build/application tests N/A vì không sửa executable code/config.

### 2026-11-01 — Bắt đầu ORM migration

- User yêu cầu migrate ORM toàn backend. Branch refactor/typeorm-data-access từ25b96d3/tree sạch; giữ commit docs diagram. Chọn TypeORM cho PostgreSQL, giữ Mongoose ODM cho MongoDB; không thay DB/data/UI/Redis behavior. Đặc tả trước code tại documentation/features/postgresql-orm-migration.
- Inventory224query calls/26files gồm transaction/refresh row locks/FSRS/quota/vector. Chuyển CRUD sang EntitySchema/repository/QueryBuilder, không bọc nguyên SQL bằng ORM; native SQL chỉ historical migrations và infrastructure advisory/readiness có audit.
- PB-040 unscheduled/Ready, implementation In progress; sprint Proposed giữ nguyên. Chưa thay live runtime/schema/data; audit/restore/parity chưa verified.

### 2026-11-01 — System design diagram và luồng giao tiếp

- User yêu cầu ảnh kiến trúc và lưu trong docs system design. Branch docs/system-design-diagram từ main686d87c/tree sạch. Canonical [architecture](documentation/shared/architecture.md) có PNG và giải thích tiếng Việt browser/gateway/web/API, JWT, PG/Mongo/Redis, hai queue/worker, media, optional providers; thêm entry ở documentation/README và liên kết migration/platform system-design.
- Assets tại documentation/features/platform-operations/assets/everlang-system-design.{png,svg,dot}; PNG3840×1538, SVG để zoom, DOT để sửa. Imagegen built-in dùng cho draft; final dùng vector/Graphviz vì cần chính xác đầu mút/chữ. [Generation notes/prompt](documentation/features/platform-operations/assets/everlang-system-design.prompt.md). Không API key/provider product calls/dependency hoặc runtime changes.
- Audit riêng đối chiếu code+source edges và xem ảnh: [platform audit](documentation/features/platform-operations/audit.md). Kiểm links/docs, DOT endpoints và PNG metadata; không rerun product suites cho docs-only. Các giới hạn Google/cloud/production giữ nguyên, không đánh Done feature hoặc thay sprint/tracking. Không tự merge/push tài liệu trong lượt này.

### 2026-11-01 — Pre-merge recheck theo yêu cầu owner

- Owner cho phép tự kiểm tra, nếu đạt thì merge main và push origin. Baseline6435d04/tree sạch, fetch origin/main4eb249c không có commit phân kỳ; main local đã có8commit chưa push từ các lượt trước.
- Recheck77unit/lint/typecheck/tools/build/docs/plan/backend gates PASS. Full27E2E lần đầu26PASS/1FAIL: clock Docker/PG đi trước browser khoảng1.7s khiến Vocabulary Date.now ẩn thẻ mới dù server dueCount=1. Sửa GET /api/vocabulary trả serverNow ISO từ PG, UI dùng snapshot đó; thêm regression browser -5phút/+365ngày. Không thay card/due/FSRS/schema/layout.
- Kiểm thực tế trên QA database/Mongo/Redis15/media riêng, không sửa dữ liệu người dùng. Rerun27/27E2E PASS2.1m (gồm clock -5phút/+365ngày),77unit PASS, lint0/typecheck/tools/host+Dockerbuild PASS; native fault probe PG reconnect/cooldown1257ms/fatalexit đạt. Push dry-run và pending-history credential-pattern check PASS. External Google/provider gates giữ NOT VERIFIED, PB-039 Review. Lưu checkpoint sửa lỗi rồi fast-forward main/push theo quyền owner; kết quả chỉ xác nhận khi SHA remote khớp. API/web local đã recreate bản sửa, ready200 và2postdeploy smoke PASS4.3s; không migration/data writes. QA clone/Mongo namespace/Redis15/media/container do lượt này tạo đã dọn.

### 2026-11-01 — NestJS/JWT migration và cutover local

- Branch feature/nestjs-jwt-migration, base retry4090b34a97. Tách apps/web NextUI, apps/api Nest native, apps/worker Nest WorkerHost, packages/contracts/backend. Giữ49domain methods/27pairs; xóa Next API/BetterAuth/Drizzle/old worker entrypoints và dependencies. Gateway3000→web3001/API4000; old auth paths404, không active backend fallback.
- Access RS256900s RAM/Bearer; refresh opaque32bytes/DB SHA256/HttpOnly/SameSiteLax/pathauth/SecureHTTPS/30d absolute, transactional rotate/replay revoke. CSRF/Origin, email verify/reset/change/logout/all, Google PKCE/state/nonce/browser binding/explicit link. Giữ userID/passwordhash/Google subject/businessFK; old sessions/verify/reset links invalid, user đăng nhập lại.
- Global filter/parser boundary/interceptor, JSON requestId/method/route/status/duration+redaction, queue/worker requestId/jobId/attempt. HTTP→worker3attempts→failed→409 explicit retry đạt không AI calls. PG reconnect/Redis cooldown1208ms/fatal exit1 và owner Bearer audio/blob/logout cleanup đạt.
- Gates:77unit/15files, lint0errors0warnings, workspace+tools/tests typecheck, full build17web routes/noAPI, backend boundary gate; native auth/2tabs, beta+extended exams/admin, knowledge/catalog, disabledspeech/privateaudio, profile/audio/retry/Editorial PASS scoped. [Verification](documentation/features/backend-nestjs-migration/assets/verification.md).
- Restore:20PGtable digests giữ IDs/hashes/FSRS/due/version/revlogs; fresh001–008; Mongo6collections172docs checksum; RedisRDB19keys; synthetic private media bytes (source audio0files). Backup PG/Mongo/Redis/media20261101-104559 và env snapshot riêng ngoài Git. Cutover00803:46–03:47UTC: sửa stale migration image sang shared explicit worker image,apply008/rerun idempotent; ready200/postcutover2smoke/20digests/8migrations/old auth tables absent. QA resources lượt này tạo đã dọn; dữ liệu có sẵn giữ nguyên.
- Docs18features/source map/audits cập nhật: [migration audit](documentation/features/backend-nestjs-migration/audit.md), [integration audit](documentation/audits/nestjs-jwt-migration.md), [JWT](documentation/shared/auth-and-api.md), [logging](documentation/shared/error-handling.md), [operations/rollback](documentation/shared/operations.md). Giữ provenance audit cũ, không coi là Nest verified. Tracking39PBI84tasks6Proposed; PB-039 Review, không tự start sprint/Done toàn feature.
- Còn lại: owner live Google login/link trên Nest; cloud AI/ASR/KRdict/Tutor/SMTPproduction/HTTPS external NOT VERIFIED theo audit. Chưa public deploy/push/merge migration main. Old images/env backup offline chỉ full restore rollback, không old backend trên schema008. Không ghi bí mật vào repo/docs/log.

### 2026-11-01 — Bắt đầu NestJS/JWT migration

- Checkpoint retry grading0b34a97; branch feature/nestjs-jwt-migration. Đặc tả5docs trước code tại documentation/features/backend-nestjs-migration, giữ data/IDs/passwords/Google, JWT RAM+opaque refreshHttpOnly, một lần cutover và global structured logging/exception filter. Chưa claim verified/cutover; theo audit feature.


### 2026-10-31 — Khắc phục502 khi nộp lại lượt chấm đãfailed

- User log request2129d9fd-cdd1-4251-982a-a86bc3ce50e1 lúc21:05:40Asia/Saigon. Trace app/code xác định request gặp cached failed submission, chưa gọi provider mới; API trước trả502 và hướng dẫn nút chấm lại nhưng nút nằm trong report modal không có khi thất bại.
- Branch bugfix/retry-failed-grading từ main af438bf, tree sạch trước tạo. POSTgrade đổi failed duplicate thành409/code GRADING_PREVIOUS_FAILED/submissionId/retryable, không tự enqueue/update history. Practice hiển thị Chấm lại bằng AI ngay error alert cho cached/worker failure; action explicit forceRegrade/requestId mới, giữ draft/cooldown/rate limit và double-submit guard.
- Code: app/api/submissions/grade/route.ts, components/practice.tsx. Docs5files AI/practice, shared API/error handling, code-map/project-status và [audit](documentation/audits/grading-retry.md) cập nhật.74unit/typecheck đạt; browser/build/deploy cuối ghi audit. Không đổi worker/model/key/billing/schema/dữ liệu hoặc tự retry cloud; chưa xác minh quota OpenRouter hồi phục. Không commit/merge/push trong lượt sửa này.


- Final:74unit/typecheck/targeted lint/Docker42routes đạt; app3000 cập nhật,2Playwright trên deploy16.1s và responsive1440/390/320PASS. docs17features/154source, planning38PBI/82tasks/6Proposed và diff check đạt. Dev3001 dừng; rollback everlang-before-grading-retry:local; không cloud calls/userdata writes hoặc đổi worker. Chưa commit/merge, main vẫnaf438bf.

### 2026-10-31 — Nén ngữ cảnh và tích hợp main trước sprint tiếp theo

- Pre-merge mới:70/70unit, typecheck, lint0errors (1warning .local có sẵn), docs17features/152source/1531links, planning38PBI/82tasks/6Proposed và working/staged diff checks PASS.85file được rà trước commit, không đưa private/generated paths hoặc credential vào Git; source map/hash và các audit khớp code. Kết quả branch/hash sau fast-forward được báo ở lượt bàn giao, dùng git log main để lấy checkpoint chính xác.
- User yêu cầu tổng hợp mọi công việc/feature và merge hết vào main. [Project status](documentation/project-status.md) nén17feature/domain, route/runtime/data, bằng chứng, giới hạn và2ưu tiên sprint. Lịch sử bên dưới giữ nguyên; [audit checkpoint](documentation/audits/sprint-checkpoint-2026-10-31.md).
- Gộp source/docs/ảnh/tests audio, kho hệ thống và worker errors trong chat; knowledge/speech/catalog/research đã có commit cùng lịch sử. Mọi local branch là ancestor của currentHEAD; worktree user-profile sạch. Commit bugfix/sample-audio-player rồi fast-forward main, không squash/rewrite/reset/stash hoặc push remote.
- Baseline70unit,3audioE2E16.7s,2real libraryE2E34.4s,PG/Redis/fatal probes và Docker42routes đã đạt; kiểm pre-merge mới ghi trong audit checkpoint. Lượt này chỉ docs/Git/checks, không rebuild/redeploy/call cloud hoặc sửa dữ liệu.
- Sprint tiếp: đọc AGENTS→project-status→completion matrix→work-items→docsfeature, tạo branch đúng scope từ main.38PBI/82tasks/6sprint vẫnProposed; giờ/capacity/dateTBD, chưa start sprint/thay taskstatus. Contentreview/audio/pronunciation/provider/path/mastery/comparison/conversation/production gates còn mở; merge không có nghĩa fullselfstudyDone.

### 2026-10-31 — Sửa Nghe câu còn sót và thống nhất trải nghiệm audio

- User gửi ảnh Library/read vẫn text Nghe câu: bản sửa đầu mới cover speak/AnswerInput. Follow-up đổi đủ từng câu read, câu đầu listen và Practice AnswerDetails sang play/pause+progress+elapsed; giữ links lưu/tra từ và wireframe.
- Player compact210px, button44px, label/tooltip theo từng câu, loading spinner/aria-busy/live status và reduced motion. Quản lý1active utterance, đổi player reset UI cũ ngay cả không có canceled event; detach callbacks trước cancel và cleanup chỉ hủy session của chính component. Đổi bài/tab reset; tab/lesson có aria-pressed/current. Bỏ speak/onSpeak mẫu cũ trong Library/Practice, dictionary workflow giữ nguyên.
- Code: app/library/page.tsx, components/practice.tsx, components/sample-audio-player.tsx/.css, tests/e2e/sample-audio.spec.ts. Canonical docs immersive/translation/shared/design audit và code-map đồng bộ; [audit](documentation/audits/sentence-audio-controls.md) có ảnh1440/390/320/spacing, reproduction và giới hạn.
- Kiểm dev3001:3Playwright29.1s và70/70unit đạt; targeted lint và initial typecheck đạt. Tests dùng synth/API fixtures, không gọi provider hoặc ghi dữ liệu; giọng Hàn thật/screenreader/native zoom chưa xác minh, TTS chưa hỗ trợ kéo tua/tổng thời lượng. Final container/deploy theo audit.
- Tái sử dụng branch bugfix/sample-audio-player; giữ nguyên mọi staged changes có sẵn, không reset/stash/chuyển branch hoặc commit/push. Không sửa worker/model/quota/schema/dữ liệu trong lượt này.


- Final: Docker production build42routes/TypeScript và app recreate3000 đạt;3Playwright trên deploy16.7s,70unit, lint và docs17features/152source, planning38PBI/82tasks/6Proposed, diff check đạt. Ảnh read/listen1440/390/320/spacing lấy lại từ bản deploy. Dev3001 đã dừng; rollback `everlang-before-sentence-controls:local`, giữ volumes. Chỉ cập nhật app, worker đang chạy giữ nguyên.

### 2026-10-31 — Kho hệ thống theo ngôn ngữ, worker crash và AI429

- User xác nhận kho từ/tài liệu ngữ pháp thuộc hệ thống, người học xem và lưu riêng. GET knowledge/word-sets thêm metadata language=ko/ownership=system; language khác400. Beta chỉ có tiếng Hàn; nội dung published dùng chung, draft vẫn chờ duyệt, bookmark/note/attempt/SRS giữ ownership. UI mô tả rõ kho hệ thống và sổ đọc/kho ôn cá nhân. Không tự publish các seed thật.
- Log cũ xác nhận Unhandled error event/Connection terminated unexpectedly. Thêm Pool idle-error listener không dump client; tái sử dụng API boundary/logError có sẵn; logger redact nested/cycle an toàn. Standalone grading/speech worker fatal exception/rejection log rồi exit1; recovery/listener/shutdown có catch và deadline. Grading429 cooldownRedis theo Retry-After/default60s, concurrency1/limiter1s, retry3; config4xx dừng sớm. Failed SQL status write được reconcile từ Redis; không tự gọi AI lại hoặc ghi điểm giả.
- Giữ branch bugfix/sample-audio-player/HEAD13d432b và thay đổi audio chưa commit; không đổi branch vì tree dirty. Lượt sửa này không commit/push, không đổi model/key/billing/schema/migration. File chính: lib/ai.ts, lib/logger.ts, lib/sql/index.ts, lib/process-errors.ts, scripts/worker.ts, scripts/speech-worker.ts, hai API và hai UI kho hệ thống.
- Kiểm:70/70unit; real Redis cooldown1222ms/2attempts, idle PG disconnect/reconnect và2fatal child processes đạt;0cloud calls. Actual auth/Mongo/PG library+catalog E2E2passed34.4s, learner isolation/CAS/quota/language checks/UI320 đạt. Dọn37catalog+4knowledge synthetic revisions/4QA accounts/candidate; giữ content thật. Final build/deploy ghi trong [audit tích hợp](documentation/audits/system-library-worker-errors.md).
- Tài liệu chuẩn [error handling](documentation/shared/error-handling.md); cập nhật5feature docs/audit, design audit và code-map. NOT VERIFIED với upstream quota/429 đã hồi phục thật, speech hardware/provider/điểm phát âm/chất lượng corpus và full WCAG; không đánh dấu toàn feature Done. Hai nhóm tiếp nối trong tổng hợp cuối ngày bên dưới vẫn còn hiệu lực.


- Final: lint/typecheck/70unit và Docker build42routes đạt; app+grading worker đã recreate tại localhost3000, worker ready. Probe trên final image đạt2attempts/1212ms cooldown + PG reconnect + fatal children,0cloud calls; final UI smoke1440/390/320 không tràn/pageerror. docs17feature/152source, planning38PBI/82tasks/6Proposed và diff check đạt. Rollback tags `everlang-before-worker-errors:local`, `everlang-worker-before-errors:local`; giữ volumes. Source speech boundary đã cập nhật nhưng không bật/rebuild speech profiles disabled. Final catalog53draft/0published/0QA, không tự duyệt học liệu thật.

### 2026-10-31 — Tổng hợp cuối ngày từ lịch sử chat và bằng chứng dự án

**Phạm vi:** đối chiếu chat hiện tại, các lượt công việc hôm nay trong chat dự án, Git, tài liệu feature/audit và trạng thái Docker. Đây là bản tổng hợp mới nhất; các mục bên dưới giữ làm lịch sử. Không coi triển khai kỹ thuật là hoàn tất toàn bộ sản phẩm tự học.

#### Những việc đã làm hôm nay

| Nhóm công việc | Kết quả và bằng chứng | Trạng thái bàn giao |
|---|---|---|
| WBS, backlog, sprint | Đã tạo tracking solo; hiện có **38 PBI, 82 task, 6 sprint Proposed**. Nguồn chuẩn: [work-items.json](documentation/planning/work-items.json), hướng dẫn: [planning](documentation/planning/README.md). Commit khởi tạo `89e53a8`, chuẩn hóa file sinh `c6fd33f`. | Chưa chốt giờ/tuần, capacity hoặc ngày sprint; không tự chuyển trạng thái Done. |
| BA và discovery | Đã tạo skill cá nhân `everlang-ba` ngoài repo; nghiên cứu pain point, đối thủ, vòng tự học, thư viện grammar/idiom/tài liệu và lựa chọn ASR cấu hình thấp. [Research tự học](documentation/research/self-study-vocabulary-pronunciation.md), [ASR](documentation/research/low-resource-asr.md). Commits `98dd29a`, `28957ad`. | Nghiên cứu là căn cứ yêu cầu; không đồng nghĩa các đề xuất đã có code hoặc được duyệt nội dung. |
| Thư viện kiến thức | `/knowledge`, `/admin/knowledge`: nội dung versioned, tìm/đọc, bookmark, ghi chú, vị trí đọc, bài tập MCQ/cloze và lưu SRS; migration004, backup/restore, integration hai tài khoản. Commit `cc1c776`; [docs](documentation/features/knowledge-library/README.md), [audit](documentation/audits/self-study-library-integration.md). | Checkpoint kỹ thuật đã kiểm; 13 học liệu nháp theo lần kiểm trước, chờ chủ dự án duyệt trên app. Không kiểm lại số lượng DB trong lượt tổng hợp này. |
| Thu âm và ASR | `/speech`: thu/import từ/câu tối đa20s, preview/consent, lịch sử riêng tư, phát/xóa, SQL outbox/worker; migration005–006. Có Whisper CPU option và Gemini adapter giới hạn20 lượt/ngày UTC. Commit `6790f1f`; [docs](documentation/features/self-hosted-speech/README.md), [audit](documentation/audits/self-study-speech-integration.md). | Key thay mới vẫn timeout trong lần thử trước; runtime bàn giao dùng `SPEECH_PROVIDER=disabled`, cho thu/nghe local. Chưa xác minh cloud thành công/free tier và chưa có chấm điểm phát âm. |
| Bộ từ theo chủ đề/nghĩa | `/word-sets`, `/admin/word-sets`: nghĩa/phiên bản/bộ từ, ví dụ, TTS, học và lưu vào FSRS hiện có; quota/CAS, liên kết thẻ nhập tay giữ lịch ôn; migration007. Commit `13d432b`; [docs](documentation/features/vocabulary-catalog/README.md), [bằng chứng](documentation/features/vocabulary-catalog/assets/verification.md), [audit](documentation/audits/vocabulary-catalog-integration.md). | Lần kiểm cuối của feature:30 nghĩa +23 bộ đều draft,0published; QA đã dọn. Chưa là corpus đầy đủ các ngành; nội dung/audio cần duyệt. Không truy vấn lại DB trong lượt này. |
| Play icon và time bar | Practice và Library/speak dùng `SampleAudioPlayer`: play/pause/resume/replay, thanh tiến trình theo vị trí chữ, đồng hồ thời gian đã phát, loading/timeout/error và cleanup; sửa tràn320px. [Contract](documentation/shared/sample-audio-player.md), [audit](documentation/audits/sample-audio-player.md), [test](tests/e2e/sample-audio.spec.ts). | Đã deploy localhost3000; thay đổi **chưa commit** trên `bugfix/sample-audio-player`. Thanh không kéo tua, không có tổng thời lượng media; thiếu boundary event thì thanh chỉ hoàn tất khi kết thúc. |

#### Snapshot code và vận hành mới nhất

- Checkout: `D:/Project/langz`; branch `bugfix/sample-audio-player`, HEAD `13d432b`. Các sửa đổi audio, docs/audit/code-map và ảnh QA đang uncommitted; giữ nguyên, không reset/stash/chuyển branch hoặc gom commit ngoài yêu cầu. Lượt tổng hợp này chỉ sửa `HANDOFF.md`, không commit/push/deploy thêm.
- Bản app mới nhất đã triển khai ở [localhost:3000](http://localhost:3000) trong lượt sửa audio. Lượt tổng hợp kiểm lại `docker compose ps`: app/worker running; PostgreSQL, MongoDB, Redis và Mailpit running/healthy. Đây là kiểm trạng thái container, không thay kiểm tra provider hay luồng dữ liệu.
- Rollback bản audio: image `everlang-before-sample-player:local` đã được giữ ở lượt trước. Với database đã migration007, chỉ dùng image tương thích007/bridge hoặc mới hơn; không quay về app trước bridge. Xem [bằng chứng migration/restore](documentation/features/vocabulary-catalog/assets/verification.md). Không có migration hoặc thay đổi dữ liệu trong lần sửa audio/tổng hợp này.

#### Kiểm tra gần nhất và giới hạn bằng chứng

- Lượt sửa audio đã đạt: **59/59 unit tests**, lint/typecheck, production build/Docker build **42 routes**, Playwright trên bản deploy3000 **1 test /10.7s**. UI kiểm1440/390/320px, keyboard và lifecycle/error; API và sự kiện SpeechSynthesis trong test là fixture, không chứng minh chất lượng giọng thật. [Chi tiết audit](documentation/audits/sample-audio-player.md).
- Kiểm cấu trúc gần nhất: `docs:check`17 feature/148 source-config/1396 liên kết; `plan:check`38PBI/82task/6Proposed; `git diff --check` đạt. Lượt tổng hợp chỉ chạy lại kiểm tài liệu, tracking, liên kết bàn giao và diff; không chạy lại build, unit, E2E hoặc gọi provider.
- Chưa xác minh: giọng Hàn/microphone thiết bị thật, screenreader/zoom, chất lượng đánh giá phát âm, audio curated, coverage corpus đầy đủ, benchmark AI được người duyệt chấp nhận và audit cuối toàn mục tiêu. Không đổi các kết quả này thành PASS chỉ vì bản build chạy được.

- Xác minh lượt tổng hợp: `npm run docs:check` và `npm run plan:check` đều PASS; liên kết mới trong bản tổng hợp trỏ tới file tồn tại; lịch sử bàn giao đã commit được giữ nguyên.

#### Hai nhóm việc tiếp nối

1. **Nội dung và vòng học:** chủ dự án duyệt học liệu/bộ từ trên app; tiếp tục corpus có nguồn/quyền dùng, audio chuẩn, grammar comparison, mastery, diagnostic/lộ trình, đọc–nghe và hội thoại theo [completion matrix](documentation/planning/SELF_STUDY_DELIVERY.md). Chỉ cập nhật trạng thái tracking khi có bằng chứng tương ứng; không thu hẹp mục tiêu toàn bộ thành pilot.
2. **Âm thanh và nghiệm thu:** xác minh phương án miễn phí/cấu hình thấp, chạy audio thật và benchmark trước khi bật provider/chấm phát âm; hoàn thiện các gate tích hợp, accessibility và vận hành còn mở. STT hoặc embedding chưa kiểm chứng không được dùng làm điểm phát âm. Không tự bật billing hoặc fallback trả phí.


### 2026-10-31 — Nút phát mẫu và thanh tiến trình

- Branch `bugfix/sample-audio-player` từ branch catalog, tree sạch trước khi tạo. Thay text button nghe mẫu ở Practice/Library bằng play/pause44px, thanh tiến trình theo vị trí chữ và mm:ss đã phát; pause/resume/replay/error/loading10s timeout, cleanup khi đổi câu/rời tab. Không bịa tổng thời lượng; TTS không hỗ trợ kéo tua. Sửa min-width nội dung Library để không tràn320px, giữ wireframe.
- Code: components/sample-audio-player.tsx/.css, components/practice.tsx, app/library/page.tsx. Docs hai feature/shared/code-map; audit: documentation/audits/sample-audio-player.md. Playwright lifecycle/error/keyboard/320+390+1440 và Practice smoke đạt1test10.3s bằng event TTS mô phỏng. Lint0errors (warning .local có sẵn), typecheck và production42routes đạt. Giọng tiếng Hàn thật/screenreader/zoom chưa xác minh; feature/provider gates cũ giữ nguyên.

- Final: Docker build42routes và cập nhật app3000 đạt; Playwright trên bản deploy1passed10.7s,59/59unit, targeted lint sạch, docs17features/148source/1396links, plan38PBI/82tasks và diff check đạt. Rollback image `everlang-before-sample-player:local`; dev3001 đã dừng.

### 2026-10-31 — Bộ từ theo chủ đề/sense (technical checkpoint, release gate mở)

- Branch feature/topic-vocabulary-catalog từ6790f1f, primary D:/Project/langz, tree sạch trước khi tạo. Đặc tả5 docs trước code tại documentation/features/vocabulary-catalog; PB-035 refine4 tasks, chưa chốt sprint/capacity. Mongo catalog versioned/pinned sense/set, learner/admin forms, PG sense-aware FSRS/quota/CAS/explicit legacy mapping, TTS hệ thống và /speech link; không thêm SRS thứ hai.
- Build/tag/deploy everlang-vocabulary-bridge:local từ6790f1f plus targetless legacy POST trước007. Backup PG+Mongo; restore vào DB tạm, PG vocabulary hash/card/due/version và Mongo collection counts khớp, DB tạm đã xóa.007 đổi old full uniqueness sang partial manual/catalog, không reset thẻ. Synthetic reviewed-card probe xác nhận id/card/due/version/algorithm/revlog nguyên vẹn rồi dọn QA. Rollback từ007 bắt buộc bridge/newer, không dùng pre-bridge image.
- Seed explicit30 nghĩa tự biên soạn AI-assisted/23 bộ đều draft, rerun0insert, không auto-review/pub; bộ khởi đầu không thay full domain corpus. Kiểm Mongo knowledge hiện13draft, chưa evidence owner duyệt.59/59 unit, lint/typecheck và production Docker build42routes đạt. Actual2-account/Mongo/PG/FSRS/quota/CAS/pin/legacy/bridge/outage E2E đạt26.3s; scoped admin UI workflow/keyboard/dirty-link/320+text-spacing đạt8.8s. Sửa recall lộ dịch Việt, TTS timer/cancel và font wordmark header tràn8px; giữ wireframe. Evidence: documentation/features/vocabulary-catalog/assets/verification.md; audit liên kết: documentation/audits/vocabulary-catalog-integration.md. Main3000 đã deploy; QA accounts/content/container dọn sạch, final53draft/0published. Chưa physical Korean voice/screenreader/full corpus/curated audio/điểm phát âm; không tuyên bố Done. PB-035-T03 Review/Pass technical, T04 chờ owner duyệt trên ứng dụng.

- Final docs:check17 features/146 source-config/1359 links, plan:check38PBI/82tasks/6 proposed sprints và git diff --check đạt; source map/hash đồng bộ. Chưa tự chốt ngày/capacity.

### 2026-10-31 — Speech enabler và API miễn phí (audit còn mở)

- Branch feature/self-hosted-audio, primary D:/Project/langz.5 docs trước code tại documentation/features/self-hosted-speech; thu/import từ/câu20s, preview/consent, private history/play/delete, PG005/006 + SQL outbox/BullMQ worker, provider snapshot. Shared docs/stack/screens/ops và code-map/backlog đồng bộ trong lượt này. Không là chấm phát âm.
- Owner chọn API/audio embedding miễn phí: Gemini adapter server-only,20 calls/day UTC, quota/timeout/schema/consent Google rõ, API worker không cần model.2.5Flash generate404 cho new user nên đổi model explicit3.8Flash theo docs và provider message. Key đầu402 prepaid depleted; owner thay key, probe audio45s/text20s/low-thinking audio45s timeout. Chưa xác minh API hoạt động/free tier; không bật billing/nạp tiền/fallback trả phí, không ghi secret.
- Giữ Whisper CPU option: source/model pinnedSHA, portable/AVX2 đúng flags,1–2threads/concurrency1.49 unit + lint/typecheck và production Docker build đạt checkpoint; actual local E2E2-account/ownership/idempotency/quiet/duration/WebM/mobile đạt28.9s. Backup metadata+private volume và restore hash đạt. Evidence/audit trong feature/assets và audit.md. Portable word31s/process-treeRSS287016KB không là cấu hình tối thiểu cả app.
- Kiểm tra cuối:49/49 unit, lint, typecheck, production Docker build, docs:check16 features/127 source-config/1292 links, plan:check38PBI/78tasks và git diff --check đều đạt. Audit tích hợp: documentation/audits/self-study-speech-integration.md. Đây là checkpoint implementation/audit một phần, chưa đóng feature hoặc full goal.
- Runtime main3000 đã cập nhật /speech với SPEECH_PROVIDER=disabled, cho thu/nghe local; không tự chạy model hoặc gọi cloud đang timeout. Final deployed-mode E2E9.4s đạt /library→/speech,503 offline, preview và simulated mic acquisition guard. Candidate đã dọn. Bản ghi TTS/backup trong .local riêng tư; screenshot/evidence bền vững trong documentation. UI Google/error pipeline và browser private audio decoding/playback kiểm thật đạt (availability probe1.7min, actual inference timeout); microphone thiết bị, human quality/pronunciation, cloud success và recovery stress NOT VERIFIED. Quota Redis thật25 concurrent chỉ20accepted (fake transport/no cloud); private artifacts không nằm standalone. Tag rollback cũ thất bại vì image không còn, đã rebuild cc1c776 thành everlang-before-speech:local và bootstrap3002/sign-in200; chưa full old-auth regression. Mục tiêu self-study vẫn active, vocabulary/mastery/path/audio curated tiếp tục độc lập.

### 2026-10-31 — Chốt hướng nghiên cứu ASR cấu hình thấp/Gemma

- Owner ưu tiên cấu hình thấp, có thể dùng Google Gemma audio/ASR. Tạo `documentation/research/low-resource-asr.md`, đăng ký trong index; đối chiếu primary docs Google Gemma3n/Gemma4 và whisper.cpp. Ưu tiên spike whisper.cpp base CPU; Gemma4 E2B audio là ứng viên so sánh, không mặc định suy E2B=2GB hoặc mọi Gemma nhận audio.
- Ghi cấu hình thử1–2 threads/concurrency1, resource/quality benchmark gate, phương án private local media cần ADR trước code; giữ chấm phát âm là yêu cầu riêng. Không sửa runtime/provider hoặc đánh dấu PB-020/026 Done. Full goal vẫn active, chưa tích hợp ASR local/Gemma.
- Review source URLs và phân biệt vendor support với runtime/quality evidence. Chưa chạy/download Gemma, chưa đo tiếng Hàn. `npm run docs:check` đạt (15 feature/109 source/1245 link); `npm run plan:check` và `git diff --check` đạt. Chỉ đổi research/docs, không chạy build runtime.

### 2026-10-31 — Triển khai thư viện kiến thức trong mục tiêu tự học

- Branch `feature/self-study-library`, source primary D:/Project/langz. Tạo đặc tả5 docs trước code tại `documentation/features/knowledge-library/`; triển khai /knowledge và /admin/knowledge, schema/service Mongo versioned, API session/role, PostgreSQL notes/bookmark/section/read và attempts snapshot/idempotent, MCQ/cloze server grading, lưu mẫu vào SRS. Library/admin cũ thêm link, không thay workflow đang có.
- Migration004 additive; backup PostgreSQL/Mongo và restore vào database tạm thành công trước migration. Seed explicit13 draft tự biên soạn có hỗ trợ AI; chạy lại0 insert, không tự review/publish. Owner xác nhận sẽ duyệt trên app, chưa xác nhận nội dung đã đạt.
- Đã đưa app mới lên localhost3000 sau candidate test3001.37 unit, lint/typecheck/production build/Docker build đạt; Playwright knowledge integration với2 account thật và smoke sign-in/anonymous isolation đạt. Đã dọn candidate/account/content QA; còn13 draft thực. Evidence trong `documentation/features/knowledge-library/assets/verification.md`; audit tại `documentation/audits/self-study-library-integration.md`.
- Review riêng phát hiện heading quá nhỏ và đã sửa/retest; CAS note lỗi giữ local, duplicate attempt và SRS không reset; related-reference validation và keyboard/text-spacing/mobile đã kiểm thêm; render720CSSpx/DPR2 không tràn. Zoom/assistive tech thật, TTS thiết bị và SPA unsaved guard toàn app còn NOT VERIFIED. Không coi feature hoặc mục tiêu toàn bộ hoàn tất.
- Đồng bộ backlog37 PBI/75 task, giữ sprint Proposed; PB-001/PB-034 implementation có evidence, audit gate còn mở. Toàn phạm vi tại `documentation/planning/SELF_STUDY_DELIVERY.md`: curated vocabulary/sense/audio, grammar compare/mastery/path, contextual learning, conversation và pronunciation còn tiếp tục.
- Owner hỏi free/self-host/Whisper: nghiên cứu whisper.cpp base và faster-whisper INT8; không biến STT match thành điểm phát âm. Chưa tích hợp speech scoring hoặc mua cloud. Retag rollback image cũ không được do image không còn; đã rebuild từ commit98dd29a thành everlang-before-knowledge:local và bootstrap smoke trên candidate3002 đạt; image giữ để rollback. Không tuyên bố đã thử mọi luồng auth trên rollback.

### 2026-10-31 — Bổ sung discovery thư viện kiến thức đọc lại

- Mở rộng `documentation/research/self-study-vocabulary-pronunciation.md` theo yêu cầu: ngữ pháp, idiom/quán dụng ngữ, tục ngữ, thành ngữ Hán-Hàn, collocation, phát âm và bài đọc/tài liệu; thêm tìm kiếm, bookmark, vị trí đọc, ghi chú riêng tư và liên kết SRS.
- Đối chiếu PB-001/002/005/006/007/013/014 để tránh tạo lại scope ngữ pháp; các phần bổ sung vẫn proposed, không sửa tracking/sprint/code. Nguồn NIKL API được đọc công khai, chưa gọi API hoặc kiểm coverage.
- Review phân loại/trạng thái và liên kết: tài liệu nghiên cứu không thay canonical feature spec; học liệu/UI/provider vẫn NOT VERIFIED. `npm run docs:check`, `npm run plan:check`, `git diff --check` đạt; chỉ đổi tài liệu, không cần build runtime.

### 2026-10-31 — BA discovery: bộ từ theo chủ đề và phát âm

- Branch `docs/vocabulary-pronunciation-discovery`: thêm `documentation/research/self-study-vocabulary-pronunciation.md`, đăng ký tại `documentation/README.md`. Đối chiếu vocabulary/SRS/recordings source; đề xuất taxonomy, content/audio pilot, vòng học và acceptance, liên kết PB-013/014/018/020/026; không đổi JSON tracking, code, schema hoặc scope sprint.
- Nguồn công khai: NIKL, LingQ, TEUIDA, Hàn Quốc Lý Thú, tài liệu Azure; bài Tiếng Hàn Thú Vị trả 429, chỉ ghi search signal. Azure có ko-KR assessment nhưng prosody/phoneme naming giới hạn theo locale; chưa gọi provider hoặc đo độ chính xác. Không dùng STT match làm điểm phát âm.
- Review riêng kiểm phân biệt baseline/proposed, nguồn và traceability; còn NOT VERIFIED với benchmark nhiều người/thiết bị, thử thực tế đối thủ và content/audio. Bước tiếp: chọn content-first hoặc speaking-first, refine pilot và spike trước khi triển khai.
- Kiểm tra: `npm run docs:check` đạt (14 domain, 94 source/config, 1196 local links); `npm run plan:check` đạt (33 PBI/72 task/6 sprint Proposed); `git diff --check` đạt. Không build app vì chỉ đổi tài liệu nghiên cứu.

### 2026-10-30 — Commit nền beta và đồng bộ documentation trước profile

- Đã commit nền beta/UI/quy tắc phát triển tại `1d0fbad`; không gom thay đổi riêng thư mục project-idea của người dùng.
- Backfill `/documentation` cho 14 feature: đặc tả, system design, function description, UI, audit; bổ sung architecture, stack thực tế, 8 màn hình, dữ liệu, API và vận hành. Source/symbol/hash có canonical owner trong code-map.
- Thêm `scripts/check-documentation.mjs`, `docs:check`/`docs:sync`: kiểm file, symbol, source drift và link; không thay thế review ngữ nghĩa. Kiểm tra đạt 14 feature, 82 file, 960 link; `git diff --check` đạt.
- Trace runtime xác định Google callback lỗi invalid_client trước khi tạo session. Người dùng đã cập nhật cấu hình; dummy refresh-token probe không còn invalid_client. Chưa xác minh đăng nhập Google thật thành công. Shell baseline chưa render avatar và còn hiện nút đăng nhập khi session pending; sẽ sửa cùng feature profile sau commit tài liệu.
- Mailpit là inbox SMTP local cho verify/reset, không tham gia Google OAuth. Dịch vụ ngoài STT/S3/Tutor và bộ đề đầy đủ vẫn chưa kiểm chứng; trạng thái ghi rõ trong audit. Không in hoặc lưu secret trong tài liệu.

- EverLang beta đã build và chạy Docker local tại `http://localhost:3000`; chỉ bind loopback. App/worker đang chạy, PostgreSQL/MongoDB/Redis healthy; Mailpit local tại cổng 8025. Migration 001–003 hoàn tất.
- Đã có đăng ký/đăng nhập email, xác minh/reset mật khẩu qua Mailpit; Google đã đăng nhập thật thành công sau khi người dùng cập nhật cấu hình; database có provider/image/session. Avatar và session UI đã sửa, profile lưu/refetch đồng bộ.
- Đã triển khai dashboard, kho từ/SRS FSRS-7, lịch học, nháp cloud, history/favorites theo session PostgreSQL và worker chấm AI; tên EverLang, theme editorial paper/ink/Cobalt theo documentation/design.
- Bộ 100 bài và 5 báo cáo MongoDB gốc được giữ. Không tự gán lịch sử cũ cho tài khoản mới; có CLI nhập idempotent sau đối chiếu chủ dữ liệu.
- OpenRouter đã chấm thật qua hàng đợi/lưu PostgreSQL; kết quả QA cuối 98/100 cho đáp án tham khảo. Không dùng smoke test này thay đánh giá chất lượng bằng bộ bài có người chấm.
- Có nền tảng nghe/đọc/thu âm, S3/STT/Tutor pgvector và mini exam; dịch vụ ngoài/nội dung đầy đủ còn điều kiện. Xem `FEATURE_AUDIT.md` để phân biệt đã kiểm chứng và chưa kiểm chứng.
- Tài khoản QA và học liệu test đã được dọn; mọi email có thể đăng ký, chỉ email chủ dự án giữ quyền admin trong môi trường cục bộ. Không có mật khẩu mặc định.

## Tính năng đã có

- Luyện dịch với chế độ danh sách/thẻ, lọc chủ đề và TOPIK, tìm kiếm, phân trang, tiến độ, gợi ý từ vựng ngắn, nhập câu trả lời, xem đáp án/ngữ pháp và nghe câu mẫu bằng Web Speech API `ko-KR`.
- Tạo bài mới và chấm bản dịch bằng OpenRouter; schema đầu ra được kiểm tra bằng Zod, JSON lỗi được thử phục hồi bằng `jsonrepair`, lỗi API được ghi log JSON có `requestId`.
- Chấm lại cùng nội dung dùng báo cáo đã lưu; người học có thể chủ động yêu cầu chấm lại. Điểm thống kê đếm bài/câu riêng biệt theo `sentenceId`, không tăng theo số lần gọi chấm.
- Xem lịch sử bài đã chấm, câu yêu thích, điểm/nhận xét đã lưu. Dữ liệu submission, nháp và trạng thái yêu thích hiện ở PostgreSQL theo tài khoản đã xác thực; bản MongoDB cũ chỉ giữ để lưu trữ/nhập có kiểm soát.
- Từ/cụm tiếng Hàn có thể chọn để tra; có popup từ điển, nghĩa/loại mục từ khi KRdict trả dữ liệu, liên kết mở KRdict và phát âm. Tra cứu qua API yêu cầu `KRDICT_API_KEY`; Web Speech vẫn dùng được khi thiếu khóa.
- Docker Compose khởi chạy ứng dụng và MongoDB 8; volume giữ dữ liệu MongoDB qua lần khởi động lại. Không đưa MongoDB vào Atlas trong cấu hình mặc định hiện tại.

## Lịch sử công việc của phiên

### 2026-10-31 — WBS, product backlog và kế hoạch sprint cho solo

- Branch docs/self-study-wbs-sprints từ4eb249c. User xác nhận solo và có khả năng duyệt tiếng Hàn; giờ/tuần/capacity/date TBD, không giả có nhiều người song song hoặc chốt deadline.
- documentation/planning/work-items.json là nguồn duy nhất:14 baseline domains tách riêng,33 PBIs (24 scheduled proposal +9 deferred),72 leaf task,6 sprint đề xuất2 tuần; Core/Stretch, acceptance, dependencies, verification/evidence và4 milestones. Tất cả task bổ sung Todo; không tính0% thành tiến độ toàn app.
- scripts/planning.mjs + npm plan:sync/plan:check sinh/check7 MD/CSV views (Dashboard/WBS/backlog/sprints/task board/2 CSV). Chặn dependency cycle, Done thiếu evidence/Pass, upstream chưa Done, Core dựa Stretch, sai commitment capacity. LF/CRLF được normalize; Markdown luôn kết thúc đúng một newline để diff sạch.
- Scope solo: pilot5 rồi15 bài grammar;5 bài đọc/3 audio. S1-S2 refine trước, S3-S6 forecast;25% capacity dự phòng. Luyện thi/đa ngôn ngữ/billing/gamification để backlog, không tự triển khai.
- Cập nhật AGENTS rule tracking, mục lục/status,5 docs platform-operations và code-map. Hướng dẫn tại documentation/planning/README.md; audit documentation/audits/project-planning.md.
- Kiểm:31 unit (8 planning), lint/typecheck/production build, docs:check/plan:check đạt; thử sửa generated view bị phát hiện, CRLF không tạo drift giả. Build lần đầu checkout chính thiếu Inter package; npm ci theo lockfile khắc phục, không đổi version/source UI.
- Không đổi route/UI/data/schema/worker, không deploy hoặc gọi provider/E2E app mới. Chưa start sprint hay tạo ticket/automation bên ngoài; cần refine acceptance và chốt giờ/tuần trước commitment.

### 2026-10-30 — Bàn giao main, tài liệu ý tưởng và tổng kết dự án

- Theo yêu cầu người dùng, giữ6 commit app/docs/UI đã có trên main và gom phần đã stage: chuyển Project_IDEA.md vào project-idea/ cùng ảnh mô phỏng giấy Writing. Đây là tài liệu ý tưởng, không coi là feature đã triển khai.
- Thêm documentation/project-status.md: tổng kết14 nhóm feature/8 màn hình, tách đã kiểm chứng với nền tảng còn thiếu; đề xuất2 hướng: hoàn thiện beta tự học (ưu tiên), sau đó môi trường beta thật.
- Đích đồng bộ origin/main bằng push thông thường, không force. Đối chiếu local HEAD và origin/main sau push; kết quả commit/remote được báo ở cuối lượt bàn giao.
- Kiểm thay đổi staged, pattern credential/private paths và docs:check. Không thay source runtime, schema hoặc dữ liệu; không chạy lại unit/E2E/build vì lượt này chỉ tài liệu/Git. .env, cache và log không được đưa vào commit.

### 2026-10-30 — Làm nhẹ sổ tay và shared surfaces

- Branch bugfix/lighten-editorial-surfaces từ50197f5. Theo ảnh/phản hồi, bỏ nền đen notebook, title labels, ngày/Beta, task hoàn thành và auth art note; dùng white/paper/tint + ink/muted/Cobalt. Làm nhẹ quote/layer chữ, giữ layout và profile passport.
- app/editorial.css override đủ text kế thừa để không white-on-white: heading/description, empty note, wrong/correction/explanation/link. Thêm khoảng thở18px và underline link ôn; focus Cobalt trên nền sáng.
- tests/e2e/editorial-design.spec.ts thêm empty/filled notebook regression, kiểm màu chữ/correction và href ôn; ảnh QA desktop/mobile lưu design-system/assets. Các route vẫn qua structural check1440/390/320; baseline JSON gốc không đổi.
- Sync documentation/design policy, design-system/daily-dashboard contracts/audits, code-map và documentation/audits/light-editorial-surfaces.md. Lint/tsc/production Docker build và6 Playwright UI tests đạt, container đã cập nhật.
- Không API/schema/auth/data thay đổi, không tạo/xóa tài khoản, không gọi AI. Không chạy lại full backend/provider tests vì chỉ đổi presentation. Full WCAG/native zoom/screen reader chưa chứng nhận; rollback bằng50197f5, giữ volumes.


### 2026-10-30 — Learning Passport: thiết kế lại view và edit profile

- Branch feature/profile-editorial-layout từ f7fa4cf; người dùng cho phép đổi layout /profile. Giữ editorial tokens, logo e và wireframe7 route khác.
- app/profile/page.tsx + profile.css: passport Cobalt với identity thật; goal nổi bật, phút/ngày lớn, facts; default view và inline editor hai cột. Mobile compact identity,320px chuyển một cột khi cần. Security/legacy import thành disclosure, giữ provider actions và ownership.
- View→Edit focus Tên; Cancel không PUT/discard form/return focus; saving khóa controls; failure giữ draft/alert; success PUT→GET→session refresh→view và header cập nhật. AccountSecurity tách state/status local.
- Sync profile README/system design/functions/UI/audit; design guide ghi ngoại lệ user-authorized; code-map thêm CSS và symbol. Audit nhóm documentation/audits/profile-layout-integration.md, ảnh view/edit desktop/mobile trong profile assets.
- Kiểm: lint/tsc/production Docker build,23 unit và13 E2E54.1s đều đạt. E2E gồm session/API/DB thật + mock UI cho cancel/failure/lock/long content;7 route khác so baseline không đổi. JSON wireframe gốc giữ nguyên, profile kiểm riêng do thay layout có yêu cầu.
- Không API/schema/migration mới, không thêm thông tin thành tích giả. Dọn riêng2 user QA; dữ liệu/session thật giữ nguyên. Google linking/reset Google-only thật, native zoom/screen reader không được chứng nhận lại; xem audit. Rollback bằng baseline f7fa4cf, giữ volume.


### 2026-10-30 — Editorial typography và quy chuẩn frontend

- Branch feature/editorial-design-system từ80e4247. Áp dụng Inter Variable5.3.0 self-host có Vietnamese, paper/white/ink/Cobalt; giữ logo e, wireframe, grid/container/spacing/breakpoint và logic học/auth.
- Thêm app/design-tokens.css, app/editorial.css, font license; cập nhật layout imports/Tailwind aliases và typography Dashboard. Headings UI uppercase, black labels, Cobalt số; quote/vertical/layer chỉ trong aria-hidden hero-art. Tên user, input, SRS/Hangul giữ tự nhiên; focus notebook nền đen dùng trắng. Khôi phục inset pl-10 cho search không đè icon.
- Lưu documentation/design/README.md và gallery8 màn hình trước/sau; AGENTS bắt buộc mọi FE đọc và tuân thủ. Sync feature UI, design-system contracts, code-map và audit nhóm documentation/audits/editorial-learning-ui.md.
- Kiểm: 23 unit, 11 E2E trên Docker production, lint/typecheck/build đạt; đối chiếu8 route ×1440/390/320 structural props, kiểm font/focus/text-spacing/overflow và review ảnh. Contrast token chính đạt mục tiêu; không tuyên bố toàn bộ WCAG hay tác dụng tâm lý tăng trí nhớ.
- Không migration, không đổi quyền/credential. E2E fixture users được dọn riêng, giữ dữ liệu/session thật. Rollback bằng code baseline80e4247, giữ volume. Native browser zoom200%/screen reader và dịch vụ ngoài không được chứng nhận lại trong lượt visual này.


### 2026-10-30 — Profile, Google avatar và audit tích hợp

- Branch feature/user-profile, nền tài liệu d151dcb (đồng bộ 14 feature và 8 màn hình trước viết code mới). Google lỗi invalid_client đã hết sau cập nhật môi trường của người dùng; chủ tài khoản xác nhận login thành công, SQL xác nhận provider/image/session.
- Thêm components/user-avatar.tsx, lib/profile.ts và lib/auth-errors.ts; sửa Shell pending/error/guest, avatar HTTPS/fallback và mobile selector chỉ ẩn tên. Không mount private page khi session chưa xác định. Giữ logo e và palette phẳng hiện hành.
- Profile GET chỉ trả safe user fields/provider names. PUT schema strict + transaction auth_user/profiles. UI có load/retry/save, refetch tên trên header, Google-linked notice và form password theo provider. Callback error có thông báo an toàn, wrapper log không chứa code/state/query.
- Kiểm tra cuối: 23/23 unit, 7/7 Playwright (32.2s), lint/typecheck, production Docker build và recreate app đều đạt. Playwright gồm email/session/API/DB thật và các UI mock để tái hiện failure; Google thật có xác nhận riêng. Đã xem ảnh desktop 1440/mobile390, không tràn ngang, avatar mobile visible.
- Cập nhật documentation profile/auth/design-system, code-map, audit nhóm và ảnh QA 6 màn hình. Nguồn chuẩn: documentation/audits/profile-auth-integration.md. Không có migration mới; cleanup đúng hai user QA, giữ nguyên account/session của chủ dự án và volume.
- Giới hạn: Google linking/Google-only tạo password chưa end-to-end với account thật; SMTP production, thiết bị thật thứ hai, STT/S3/Tutor và đề đầy đủ còn cần kiểm riêng. Mailpit chỉ inbox local verify/reset, không tham gia Google OAuth. Không push remote.


### 2026-10-30 — Chốt baseline trước đồng bộ tài liệu và feature hồ sơ

- Chuẩn bị commit các thay đổi EverLang đã thực hiện trong phiên, gồm quy tắc branch/tài liệu/audit; không đưa `.env`, log riêng tư hoặc thay đổi di chuyển `Project_IDEA.md` của người dùng vào commit.
- Truy vết lỗi được báo: log runtime ghi Google token exchange thất bại `invalid_client` / client secret không hợp lệ; database chưa có Google account và không có active session tại thời điểm kiểm tra. Chọn tài khoản Google chưa đồng nghĩa đăng nhập EverLang thành công.
- Chuỗi 401/409/404/403 trong log người dùng gửi khớp bài test quyền truy cập/concurrency ở `tests/e2e/beta.spec.ts`, không phải bằng chứng riêng của lỗi OAuth.
- UI Shell hiện chưa render `user.image`; đây là thiếu sót độc lập sẽ xử lý cùng feature profile sau khi đồng bộ docs hiện trạng.
- Đã yêu cầu người dùng cập nhật chính xác `GOOGLE_CLIENT_SECRET` trực tiếp trong môi trường cục bộ; chưa tự thay giá trị bằng suy đoán từ ảnh.


### 2026-10-30 — Quy tắc branch, audit và tài liệu feature đối chiếu code

- Bổ sung `AGENTS.md`: branch có prefix theo mục đích + mô tả kebab-case + ticket tùy chọn; audit từng feature/nhóm feature và các kết nối UI–auth–API–worker–DB–UI trước bàn giao.
- Bắt buộc tài liệu chuẩn tại `documentation/features/<feature-id>/`: đặc tả/tiêu chí và traceability, system design, function description, UI và audit. Code/docs đối chiếu hai chiều theo ID + file/symbol/route + bằng chứng; không đánh dấu hoàn tất khi yêu cầu bắt buộc chưa đạt/chưa kiểm chứng.
- Tạo `documentation/README.md` và 5 file mẫu tại `documentation/templates/feature/`; thêm liên kết mục lục trong README root. Tài liệu shared và audit nhóm có vị trí chuẩn, được tạo khi cần.
- Đây là thay đổi quy tắc/tài liệu; chưa backfill hoặc tuyên bố mọi feature legacy đã đạt chuẩn mới. Khi sửa feature cũ phải bổ sung bộ tài liệu cùng thay đổi.
- Kiểm tra: 19 liên kết nội bộ trong AGENTS/bộ tài liệu mới hợp lệ; 5 tên branch mẫu qua `git check-ref-format --branch`; `git diff --check` đạt. Không cần build/recreate hoặc chạy test ứng dụng cho thay đổi chỉ tài liệu này.
- File: `AGENTS.md`, `README.md`, `documentation/README.md`, `documentation/templates/feature/{README,system-design,functions,ui,audit}.md`, `HANDOFF.md`.


### 2026-10-30 — Theme màu phẳng xanh cobalt và vàng chanh theo ảnh tham khảo

- Chuyển từ nền xanh nhạt/gradient sang palette xanh cobalt và vàng chanh lấy cảm hứng từ hai ảnh người dùng: hero/trang giới thiệu vàng chanh, CTA và điều hướng xanh, thẻ nội dung trắng, sổ tay xanh tương phản.
- Loại gradient, quầng sáng, backdrop blur và bóng trang trí; dùng mảng màu phẳng, khoảng cách và viền mảnh. Giữ logo chữ e và viền nhẹ, đồng bộ icon SVG.
- File: `app/globals.css`, `components/dashboard.tsx`, `app/icon.svg`.
- Xác minh đạt: lint/typecheck, Docker production build/recreate app và 2 scenario Playwright hiện có. Đã xem trực tiếp trang đăng nhập, ảnh dashboard desktop 1440px/mobile 390px; không tràn ngang. Đã dọn hai tài khoản QA sau test. Ảnh trong `.local/everlang-dashboard-desktop.png` và `.local/everlang-dashboard-mobile.png` (gitignored).


### 2026-10-30 — Khôi phục logo chữ e, giảm độ đậm viền

- Theo yêu cầu người dùng, thay logo sách mới bằng chữ e trắng nghiêng trên nền xanh và điểm nhấn ngôi sao nhỏ như nhận diện cũ; viền xanh mảnh 1px, bóng mềm, đồng bộ favicon SVG.
- File: `components/shell.tsx`, `app/globals.css`, `app/icon.svg`.
- Xác minh đạt: lint/typecheck, Docker production build/recreate app và smoke Playwright responsive/anonymous isolation. Đã xem trực tiếp logo chữ e viền mảnh trên trang đăng nhập, đồng bộ favicon SVG.


### 2026-10-30 — Thay Neo-brutalism bằng giao diện hiện đại, tối giản

- Thiết kế lại hệ màu/surface dùng chung: nền xanh xám rất nhạt, thẻ trắng, viền mảnh, bóng mềm, chữ xanh đậm; giảm vàng thành điểm nhấn, tăng khoảng thở và chuẩn hóa input/button/nav.
- Thay logo viền đen/bóng cứng bằng biểu tượng sách gradient; cập nhật icon SVG. Dashboard dùng thẻ từ vựng nhẹ thay minh họa nghiêng; trang đăng nhập dùng khối màu mềm, bỏ nét đen dày.
- File: `app/globals.css`, `app/icon.svg`, `components/shell.tsx`, `components/dashboard.tsx`, `app/sign-in/page.tsx`.
- Xác minh đạt: lint/typecheck, production Docker build/recreate app và 2 scenario Playwright hiện có. Đã xem ảnh desktop 1440px/mobile 390px, không tràn ngang; luồng email, nháp, SRS và dashboard vẫn hoạt động. Đã dọn tài khoản QA sau test. Ảnh kiểm thử trong `.local/everlang-dashboard-desktop.png` và `.local/everlang-dashboard-mobile.png` (gitignored).


### 2026-10-30 — Xác nhận callback Google đã khớp

- Người dùng bổ sung ảnh cấu hình Authorized JavaScript origins/redirect URIs. Đã thử lại nút Google từ EverLang trong phiên trình duyệt mới.
- Kết quả: Google đã chuyển đến trang đăng nhập với nhãn ứng dụng EverLang; không còn lỗi `redirect_uri_mismatch`. Không lưu URL OAuth chứa state vào tài liệu.
- Giới hạn: chưa đăng nhập tài khoản Google/đồng ý quyền nên chưa xác minh token exchange và session cuối cùng. Không thay mã hay credential trong lượt này.


### 2026-10-30 — Cấu hình Google OAuth từ thông tin người dùng cung cấp

- Lưu `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào `.env` cục bộ (gitignored), recreate app/worker/migrate bằng image hiện tại. Không ghi giá trị credential vào source/tài liệu/log.
- Xác minh: `GET /api/config` trả HTTP 200 với `google: true`; tải lại trang đăng nhập đã hiển thị và bật nút Google. Bấm nút chuyển sang accounts.google.com thành công nhưng Google trả HTTP OAuth error 400 `redirect_uri_mismatch`.
- Callback app gửi: `http://localhost:3000/api/auth/callback/google`. Cần thêm chính xác URL này vào Authorized redirect URIs của OAuth client trong Google Cloud; không sửa callback chuẩn của app để đoán URL đã đăng ký.
- Chưa kiểm thử được token exchange/tạo session Google. Google Cloud Console trong trình duyệt của phiên hiện tại yêu cầu đăng nhập nên chưa thể chỉnh cấu hình tài khoản bên ngoài. OAuth consent screen trong ảnh còn Testing; cần Production để dùng mọi tài khoản Google.
- File liên quan: `.env` cục bộ; `HANDOFF.md`, `FEATURE_AUDIT.md`. Không thay mã ứng dụng trong lượt này.


### 2026-10-30 — Mở đăng ký/đăng nhập cho mọi email

- Bỏ hoàn toàn kiểm tra danh sách mời ở Better Auth và API cá nhân; loại `BETA_ALLOWED_EMAILS` khỏi Compose, cấu hình mẫu và môi trường cục bộ. Giữ xác minh email, session, quyền sở hữu và phân quyền admin qua `ADMIN_EMAILS`.
- Giao diện đăng nhập không còn thông báo email được mời; nút Google luôn hiển thị và chỉ bật khi có cấu hình OAuth. Config API trả no-store để phản ánh cấu hình hiện tại.
- File: `lib/auth.ts`, `lib/api.ts`, `app/sign-in/page.tsx`, `app/api/config/route.ts`, `docker-compose.yml`, `.env.example`, `README.md`, `tests/e2e/beta.spec.ts`.
- Kiểm tra đạt: lint/typecheck, 10 unit tests, production Docker build/recreate và 2 scenario Playwright. Hai email QA đăng ký/xác minh/đăng nhập thành công khi không còn cấu hình mời; kiểm tra nháp, SRS, quyền sở hữu và reset mật khẩu vẫn đạt. Đã dọn hai tài khoản QA sau kiểm thử. Google chưa kiểm thử thật do thiếu credential.
- Google: môi trường cục bộ chưa có `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; đã yêu cầu người dùng điền credential mới vào `.env`, không gửi secret qua chat. Chưa thể xác nhận đăng nhập Google thật.


### 2026-10-29 — Triển khai và audit EverLang beta

- Đổi thương hiệu/theme; tách module practice và thêm dashboard, tài khoản, kho từ/SRS, quản trị, nghe–đọc–nói, trợ giảng và engine bài luyện thi.
- Stack: Better Auth + PostgreSQL/Drizzle cho dữ liệu cá nhân; MongoDB cho học liệu; Redis/BullMQ cho cache/hàng đợi; tích hợp S3, Google Speech và pgvector qua cấu hình môi trường.
- File chính: `app/`, `components/`, `lib/sql/`, `lib/learning/`, `scripts/`, `migrations/`, Docker/Compose, `FEATURE_AUDIT.md`.
- Sao lưu MongoDB trong `.local/backups/` (gitignored); đã phục hồi thử vào database riêng: 100 học liệu, 5 bài chấm, 0 lỗi. Không sửa dữ liệu gốc khi nhập lịch sử.
- Xác minh: 10 unit tests, lint/typecheck, Docker production build và 2 scenario Playwright đạt; có kiểm thử AI thật, email verify/reset, admin lifecycle, mini exam, quyền sở hữu và cạnh tranh SRS. PostgreSQL dump/restore đã xác minh ở database riêng; CLI import fixture lần đầu 1/lặp lại 0. Google OAuth/STT/S3/Tutor chưa kiểm thử dịch vụ thật.
- Bảo mật: chỉ cấu hình tên biến trong tài liệu; OAuth secret trong ảnh phải thay, không đưa vào source/handoff. Email quản trị được cấu hình trong môi trường cục bộ.
- Việc còn lại: credential Google mới, chủ tài khoản đăng ký/xác minh và xác nhận UUID legacy; dịch vụ speech/storage/Tutor, kiểm định nội dung và rollout VPS. Bằng chứng/giới hạn chi tiết trong `FEATURE_AUDIT.md`.


### 2026-10-29 — Bỏ qua dấu câu khi chấm bản dịch

- Yêu cầu: không quan trọng bài làm có dấu câu hay không.
- File: `lib/ai.ts` — bổ sung prompt bỏ qua việc có/thiếu/khác dấu câu khi tính điểm và nhận xét; không tạo lỗi ngữ pháp, gợi ý từ vựng hoặc giải thích chỉ để sửa dấu câu. Thêm ví dụ `해방시키는 것이다` tương đương `해방시키는 것이다.`; vẫn kiểm tra đuôi câu tiếng Hàn như ngữ pháp.
- Kiểm tra: ESLint cho `lib/ai.ts` và TypeScript `npx tsc --noEmit` thành công. Chưa gọi AI thật để xác minh phản hồi và chưa rebuild Docker trong lượt này.
- Áp dụng: kết quả đã lưu giữ nguyên; sau khi triển khai bản mới, bấm **Chấm lại bằng AI** để chấm bài cũ theo prompt mới.


### Nền tảng và dữ liệu

- Dựng ứng dụng Next.js App Router + TypeScript + Tailwind; chuyển 100 câu từ HTML tham khảo vào JSON seed; xây API danh sách/lọc/phân trang, sinh bài, chấm và thống kê.
- Tạo model Mongoose cho bài tập, bài chấm và trạng thái bài tập theo người dùng ẩn danh.
- Thêm Dockerfile, Compose, MongoDB 8, volume, healthcheck, cấu hình môi trường và hướng dẫn log production.

### Trải nghiệm học và từ điển

- Bổ sung xem đánh giá đã lưu để tránh gọi AI lại không cần thiết; chấm lại có chủ đích.
- Bổ sung lịch sử bài đã chấm và yêu thích; thống kê tính theo số bài riêng, không theo số lượt chấm.
- Bổ sung gợi ý từ vựng vừa phải theo câu nguồn.
- Bổ sung chọn từ/cụm từ, popup từ điển có thể cuộn/tương tác, đánh dấu từ, phát âm; hỗ trợ KRdict và mở từ điển ngoài khi không tìm thấy mục phù hợp.

### OpenRouter và độ ổn định chấm

- Loại Gemini khỏi luồng AI; nhà cung cấp hiện tại là OpenRouter.
- Đã xử lý các tình huống model free trả rỗng, JSON sai/cắt cụt, reasoning chiếm hết token, model slug không còn miễn phí và lỗi upstream; có log phục vụ chẩn đoán.
- Model đang đặt là `qwen/qwen3.8-flash` (model trả phí theo mức sử dụng). `lib/ai.ts` tắt reasoning cho model này, yêu cầu JSON mode và giới hạn cấu trúc bằng schema.
- Prompt chấm nhấn mạnh chỉ đánh giá bản tiếng Hàn người học nhập; lọc đầu ra để lỗi ngữ pháp/từ vựng phải trích nguyên văn tiếng Hàn từ bài làm, không được phê bình câu nguồn tiếng Việt. Xếp loại được tính nhất quán từ điểm số.
- Phiên trước đã chạy ESLint, kiểm tra TypeScript, thử một request OpenRouter tối thiểu và build/recreate Docker. Ở bước tổng kết hiện tại xác nhận container đang chạy và trang trả HTTP 200.

## File đã thay đổi hoặc tạo

### Ứng dụng và API

- `app/page.tsx` — giao diện luyện tập, trạng thái, lịch sử/yêu thích, popup tra cứu và kết quả chấm.
- `app/globals.css`, `app/layout.tsx` — giao diện responsive và metadata/layout.
- `app/api/sentences/route.ts` — danh sách/lọc/phân trang và nạp seed.
- `app/api/sentences/generate/route.ts` — sinh bài qua AI.
- `app/api/submissions/grade/route.ts` — xác thực đầu vào, dùng báo cáo đã lưu hoặc chấm/lưu mới.
- `app/api/submissions/route.ts` — lịch sử bài đã chấm.
- `app/api/user/stats/route.ts`, `app/api/user/favorites/route.ts` — thống kê và yêu thích.
- `app/api/dictionary/route.ts` — tra KRdict.

### Dữ liệu và thư viện

- `data/seed-sentences.json` — 100 bài nhập từ HTML tham khảo.
- `lib/ai.ts` — tích hợp OpenRouter, schema, prompt chấm/sinh bài, phục hồi JSON và ánh xạ lỗi.
- `lib/db.ts`, `lib/logger.ts`, `lib/user-id.ts`, `lib/types.ts` — kết nối MongoDB, log có cấu trúc, định danh người dùng và kiểu/chủ đề/cấp độ.
- `lib/models/Sentence.ts`, `lib/models/Submission.ts`, `lib/models/UserSentenceState.ts` — schema MongoDB.
- `scripts/extract-seed.py` — trích dữ liệu seed từ HTML.
- `scripts/start-standalone.mjs` — khởi chạy Next standalone trong container.

### Build, cấu hình, tài liệu

- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `dockerRebuild.ps1` — Docker/build/rebuild.
- `.env.example` — tên biến và cấu hình mẫu; file `.env` thực tế không được ghi vào handoff.
- `package.json`, `package-lock.json`, `next.config.ts` — dependencies và cấu hình Next.
- `README.md` — hướng dẫn chạy, API, log, KRdict; đã đồng bộ model mặc định với Qwen trong lần cập nhật handoff.
- `AGENTS.md` — quy tắc Next.js hiện hữu và quy tắc cập nhật handoff sau mọi thay đổi.
- `Project_IDEA.md` — ý tưởng/định hướng dự án ban đầu.

## Cấu hình và lưu ý kỹ thuật

- Cần các biến: `MONGODB_URI`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `KRDICT_API_KEY`, `LOG_LEVEL`. Chỉ `OPENROUTER_API_KEY` bắt buộc cho sinh/chấm AI; MongoDB cần cho dữ liệu bài học và trạng thái.
- `.env` chứa thông tin nhạy cảm và không được commit/hiển thị. Một API key từng được dán vào cuộc trò chuyện; nên thu hồi/rotate các key đã chia sẻ công khai và chỉ dùng key mới trong `.env`. Tuyệt đối không đưa giá trị key vào handoff/log.
- Compose mặc định dùng `mongodb://mongo:27017/korean_practice`; URI `localhost` trong container sẽ không trỏ tới Mongo container.
- Khi thay đổi biến môi trường/Docker hoặc dependency, cần recreate/build lại container để cấu hình được áp dụng. Lệnh thông dụng: `docker compose up --build -d`.
- Log: `docker compose logs -f --tail=100 app`; mỗi response API có `x-request-id`. Không log request body/bản dịch/key.
- Nếu model đổi, kiểm tra slug, quyền truy cập, response format và reasoning behavior của model; không giả định model free có sẵn mãi. Cache đánh giá cũ không tự được thay bằng kết quả model mới; dùng nút chấm lại để tạo báo cáo mới.
- Quy tắc Next.js được generate trong block đánh dấu ở `AGENTS.md`; không sửa/xóa block này nếu không cần. Quy tắc handoff được thêm bên ngoài block.

## Bước tiếp theo

1. Nếu muốn xác nhận đầu cuối model mới, thử chấm một bài dịch thực tế và kiểm tra cả chất lượng, báo cáo lưu MongoDB, nút xem lại/chấm lại. Chưa xác minh end-to-end bài chấm Qwen mới trong phiên gần nhất.
2. Cập nhật/rotate các khóa đã từng chia sẻ, kiểm tra `.env` cục bộ (không in giá trị ra log/chat) và xác nhận OpenRouter còn quota/tài khoản hoạt động.
3. Khi phát triển feature hoặc sửa lỗi tiếp theo, cập nhật nhật ký ở đầu `HANDOFF.md` theo quy tắc trong `AGENTS.md`, bao gồm file, xác minh và việc còn lại.

## Nhật ký thay đổi

### 2026-10-29 — Qwen 3.8 Flash và handoff

- Chuyển mặc định OpenRouter sang `qwen/qwen3.8-flash`; tắt reasoning cho model này.
- Siết prompt và lọc phản hồi chấm để không coi câu tiếng Việt nguồn là bài làm/lỗi tiếng Hàn.
- Đồng bộ hướng dẫn model trong README; bổ sung quy tắc ghi handoff sau mỗi thay đổi.
- Xác minh trong lượt này: seed có 100 câu, Docker app/Mongo đang chạy, trang chủ trả HTTP 200. Build, lint/typecheck và request OpenRouter tối thiểu đã chạy ở phần trước của phiên.
- Việc còn lại: kiểm thử thủ công một bài dịch đầy đủ với model mới.
