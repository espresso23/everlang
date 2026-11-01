# Tài liệu EverLang

[System design diagram và luồng giao tiếp](shared/architecture.md#system-design-diagram) — ảnh tổng quan kiến trúc NestJS/JWT, dữ liệu, queue và các worker.

[WBS / product backlog / sprint tracking — 2026-10-31](planning/README.md) · [Dashboard tiến độ](planning/DASHBOARD.md).

[Checkpoint dự án và ngữ cảnh sprint tiếp theo — 2026-10-31](project-status.md).

Frontend bắt buộc tuân thủ [EverLang Editorial Design](design/README.md); [screen gallery hiện tại](design/screens.md).

Thư mục này chứa đặc tả, system design, function description, UI và audit chuẩn cho từng feature. Quy tắc bắt buộc nằm trong [AGENTS.md](../AGENTS.md).

## Cấu trúc

```text
documentation/
  README.md                         # Mục lục và trạng thái feature
  features/<feature-id>/
    README.md                       # Phạm vi, yêu cầu, tiêu chí, traceability
    system-design.md                # Kiến trúc, dữ liệu, hợp đồng, luồng tích hợp
    functions.md                    # Hàm/điểm vào, I/O, side effect, lỗi
    ui.md                           # Màn hình, trạng thái và tương tác
    audit.md                        # Kết quả review và xác minh
    assets/                         # Ảnh/sơ đồ/bằng chứng không chứa bí mật
  shared/<component-id>.md          # Hợp đồng chuẩn của thành phần dùng chung
  audits/<group-id>.md              # Audit tích hợp một nhóm feature
  templates/feature/               # Bộ mẫu; không phải feature đã triển khai
```

Chỉ tạo thư mục `shared/`, `audits/`, `assets/` khi có tài liệu hoặc bằng chứng tương ứng. Mỗi feature có một thư mục chuẩn; nhiều file code có thể cùng hiện thực feature đó.

## Mục lục feature

| Feature ID | Tên | Tài liệu chuẩn | Code/điểm vào | Hiện thực | Audit |
|---|---|---|---|---|---|
| `identity-auth` | Tài khoản và xác thực | [Đặc tả](features/identity-auth/README.md) | [Functions](features/identity-auth/functions.md) | `implemented` | [Audit](features/identity-auth/audit.md) |
| `user-profile` | Hồ sơ và mục tiêu học | [Đặc tả](features/user-profile/README.md) | [Functions](features/user-profile/functions.md) | `implemented` | [Audit](features/user-profile/audit.md) |
| `translation-practice` | Luyện dịch tiếng Hàn | [Đặc tả](features/translation-practice/README.md) | [Functions](features/translation-practice/functions.md) | `implemented` | [Audit](features/translation-practice/audit.md) |
| `learning-records` | Nháp, lịch sử, yêu thích và thống kê | [Đặc tả](features/learning-records/README.md) | [Functions](features/learning-records/functions.md) | `implemented` | [Audit](features/learning-records/audit.md) |
| `ai-grading` | Chấm AI bất đồng bộ | [Đặc tả](features/ai-grading/README.md) | [Functions](features/ai-grading/functions.md) | `implemented` | [Audit](features/ai-grading/audit.md) |
| `vocabulary-srs` | Kho từ và lặp lại ngắt quãng | [Đặc tả](features/vocabulary-srs/README.md) | [Functions](features/vocabulary-srs/functions.md) | `implemented` | [Audit](features/vocabulary-srs/audit.md) |
| `daily-dashboard` | Dashboard và lịch học | [Đặc tả](features/daily-dashboard/README.md) | [Functions](features/daily-dashboard/functions.md) | `implemented` | [Audit](features/daily-dashboard/audit.md) |
| `dictionary` | Tra cứu từ điển tiếng Hàn | [Đặc tả](features/dictionary/README.md) | [Functions](features/dictionary/functions.md) | `implemented` | [Audit](features/dictionary/audit.md) |
| `content-authoring` | Kho học liệu và kiểm duyệt | [Đặc tả](features/content-authoring/README.md) | [Functions](features/content-authoring/functions.md) | `implemented` | [Audit](features/content-authoring/audit.md) |
| `immersive-learning` | Đọc, nghe và luyện nói | [Đặc tả](features/immersive-learning/README.md) | [Functions](features/immersive-learning/functions.md) | `blocked` | [Audit](features/immersive-learning/audit.md) |
| `ai-tutor` | Trợ giảng truy xuất học liệu | [Đặc tả](features/ai-tutor/README.md) | [Functions](features/ai-tutor/functions.md) | `blocked` | [Audit](features/ai-tutor/audit.md) |
| `exam-practice` | Bài luyện TOPIK II PBT | [Đặc tả](features/exam-practice/README.md) | [Functions](features/exam-practice/functions.md) | `implemented` | [Audit](features/exam-practice/audit.md) |
| `design-system` | App shell và nhận diện | [Đặc tả](features/design-system/README.md) | [Functions](features/design-system/functions.md) | `implemented` | [Audit](features/design-system/audit.md) |
| `platform-operations` | Hạ tầng, hợp đồng dùng chung và vận hành | [Đặc tả](features/platform-operations/README.md) | [Functions](features/platform-operations/functions.md) | `implemented` | [Audit](features/platform-operations/audit.md) |
| `postgresql-orm-migration` | PostgreSQL TypeORM data layer và Redis resilience | [Đặc tả](features/postgresql-orm-migration/README.md) | [Functions](features/postgresql-orm-migration/functions.md) | `implemented`, verified local / Review | [Audit](features/postgresql-orm-migration/audit.md) |

14 feature/domain hiện có đã được backfill theo source baseline, gồm các giới hạn và thiếu sót. `implemented` chỉ có nghĩa code đã có; trạng thái xác minh nằm trong audit, không tự coi Google/STT/S3/Tutor/full exam đã hoàn tất.

- [System design toàn dự án](shared/architecture.md) · [Tech stack thực tế](shared/tech-stack.md)
- [Màn hình đã implement](shared/screens.md) · [Dữ liệu](shared/data-model.md) · [Auth/API](shared/auth-and-api.md)
- [Vận hành](shared/operations.md) · [Bằng chứng](shared/baseline-evidence.md) · [Audit tích hợp](audits/baseline-integration.md)
- [Code map](code-map.json): file/symbol/hash và feature owner duy nhất; `npm run docs:check` phát hiện source drift/link sai. Sau review code + docs, dùng `npm run docs:sync` để cập nhật hash; không thay thế audit ngữ nghĩa.

## Product discovery

- [ASR local CPU và bản ghi riêng tư](features/self-hosted-speech/README.md) — runtime đang kiểm chứng; [design](features/self-hosted-speech/system-design.md), [functions](features/self-hosted-speech/functions.md), [UI](features/self-hosted-speech/ui.md), [audit](features/self-hosted-speech/audit.md).

- [ASR cấu hình thấp và Google Gemma](research/low-resource-asr.md) — ưu tiên CPU/self-host, nguồn chính thức, hai ứng viên và benchmark gate; chưa tích hợp.

- [Mục tiêu và completion matrix tự học](planning/SELF_STUDY_DELIVERY.md) — phạm vi end-state, tracking và bằng chứng nghiệm thu; goal đang active.
- [Thư viện kiến thức](features/knowledge-library/README.md) — feature mới đang triển khai, content seed chưa được duyệt; [system design](features/knowledge-library/system-design.md), [functions](features/knowledge-library/functions.md), [UI](features/knowledge-library/ui.md), [audit](features/knowledge-library/audit.md).

- [Từ vựng theo chủ đề và luyện phát âm](research/self-study-vocabulary-pronunciation.md) — nghiên cứu 2026-10-31; đề xuất chưa duyệt scope, chưa triển khai hoặc chuyển sprint.

## Quy trình

Workflow đầy đủ: [Context → grill-me → PRD → vertical slices → AFK → self-review → human QA](workflow/README.md). Phiên mới đọc [NEW_SESSION](workflow/NEW_SESSION.md); mẫu [interview](templates/workflow/interview.md), [issue](templates/workflow/issue.md), [context](templates/workflow/context.md). Skills có nguồn versioned tại `.agents/skills/`; [audit thiết lập](audits/agent-delivery-workflow.md).

1. Chọn/tái sử dụng branch đúng phạm vi, ví dụ `feature/JIRA-456-add-login-page`.
2. Grill-me các quyết định còn mở; dùng README trong [bộ mẫu feature](templates/feature/README.md) làm PRD chuẩn tại `features/<feature-id>/`, chuẩn bị năm docs và chia vertical issues có AC/dependency rõ.
3. Agent triển khai issue được giao đã Ready; TDD theo rủi ro, cập nhật tài liệu khi có quyết định mới. Mỗi yêu cầu/hành vi liên kết tới route, file + symbol và bằng chứng; tự review trước human QA.
4. Audit feature và các kết nối bị ảnh hưởng. Nếu có nhóm feature liên quan, thêm audit nhóm theo cấu trúc [mẫu audit](templates/feature/audit.md).
5. Kiểm tra tham chiếu hai chiều, cập nhật mục lục và [HANDOFF.md](../HANDOFF.md). Không ghi credential, token, dữ liệu người dùng thật hoặc URL chứa thông tin xác thực vào bằng chứng.

Bộ tài liệu baseline đã được backfill cho toàn bộ source/màn hình hiện có. Mỗi thay đổi tiếp theo cập nhật đúng feature, code map và audit trong cùng lượt; không tạo bản đặc tả thứ hai cho cùng feature.

- [Bộ từ theo chủ đề](features/vocabulary-catalog/README.md) — implemented PB-035; technical audit đạt phạm vi ghi nhận, content/audio release gates còn mở; sense/version, học và FSRS hiện có.

- [Audio mẫu play/pause và time bar](shared/sample-audio-player.md) — cập nhật2026-10-31; [audit hai màn hình](audits/sample-audio-player.md).

- [Exception boundaries chuẩn](shared/error-handling.md) và [audit kho hệ thống/worker429](audits/system-library-worker-errors.md) —2026-10-31; nội dung published dùng chung ko, trạng thái học/lưu riêng mỗi tài khoản.

- [Rà soát icon Nghe câu trong read/listen/reference](audits/sentence-audio-controls.md) —2026-10-31; bổ sung phạm vi còn sót sau bản sửa sample player ban đầu.

- [Cached grading failure409 và nút chấm lại tại lỗi](audits/grading-retry.md) —2026-10-31; giữ draft và retry explicit.

- [Backend NestJS/JWT migration](features/backend-nestjs-migration/README.md) —2026-11-01, implemented/cutover local đã kiểm; owner Google và provider gates còn NOT VERIFIED, PB-039 Review.

- [PostgreSQL-only primary database](features/postgresql-only/README.md) — migration in progress.

- [Admin learning CMS benchmark (2026-11-01)](research/admin-learning-cms-benchmark.md) — public-source comparison and proposed editorial workspace, not implemented.

- [Editorial workbench audit](audits/editorial-workbench-2026-11-01.md) — pagination, batch drafts, student preview and native regression.
