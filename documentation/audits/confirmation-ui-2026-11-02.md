# Audit xác nhận UI — 2026-11-02

Branch `docs/knowledge-tracer-acceptance`, working tree, [issue #14](https://github.com/espresso23/everlang/issues/14), PB-044-T01 / DS-08. Owner giao sửa toàn bộ native confirmations; giữ branch đang có nhiều chỉnh sửa chưa commit, không switch/stash/reset. Không đổi layout trang. [Hợp đồng](../shared/confirmation-ui.md), [feature audit](../features/design-system/audit.md).

## Findings và xử lý

- Medium, observed/static: 13 window.confirm tại speech delete, exam submit, legacy profile import, reader reload/back/related, admin content selection, knowledge selection/review, word sets selection/back và shared editorial import/batch. Thay toàn bộ bằng useConfirmation; source scan apps/packages không còn browser dialog call.
- Medium, observed qua test: Tab/Shift+Tab có thể thoát focus vòng hai nút của native dialog trong candidate đầu. Thêm vòng focus rõ, test PASS; Cancel là focus đầu, Escape hủy, trả focus control gọi. Dialog HTML render bởi dự án, không phải browser confirm.
- Async contract: EditorialDesk.open await onSelect; WordSetsAdmin await choose trước đổi kind; link preventDefault trước await và push sau true. Kiểm lại toàn bộ caller không dùng Promise như boolean; API/body/CAS không đổi.
- Duplicate safety: provider chỉ một pending decision, request lặp trả false, settle giải quyết một lần; LegacyDraftImport thêm disabled/pending/finally. Caller nghiệp vụ khác giữ busy/error hiện hữu.
- Native beforeunload ở reader/admin knowledge/admin word sets đã bỏ theo yêu cầu. Không thể thay bằng modal tùy chỉnh khi tab đang đóng/reload; không thêm autosave/recovery. SPA header/browser Back chưa có guard chung trước thay đổi và chưa mở rộng ở đây. Người dùng cần lưu trước khi đóng/tải lại.

## Kiểm tra thực tế

| Check | Kết quả | Bằng chứng/lệnh |
|---|---|---|
| TDD red | PASS | Test confirmation trên localhost:3000 baseline thất bại đúng `Native browser dialog is forbidden` |
| UI cancellation/keyboard/mobile/navigation + async selection | PASS | `E2E_BASE_URL=http://localhost:3101 npx playwright test tests/e2e/confirmation.spec.ts`: 2 passed |
| Editorial filtering/preview/publication conflict/bulk partial failure/import | PASS | `E2E_BASE_URL=http://localhost:3101 npx playwright test tests/e2e/confirmation.spec.ts tests/e2e/editorial-desk.spec.ts`: 4 passed ở lượt trước thêm test thứ hai; 3 editorial cases đều PASS |
| Lint | PASS | npm run lint; negative probe qua ESLint lintText cho bare confirm/window.confirm/globalThis.prompt/self.alert |
| Typecheck | PASS | npm run typecheck; chạy lại tuần tự sau build. Lượt chạy chồng build ban đầu lỗi missing generated backend declarations; không đổi worker để che lỗi này |
| Build | PASS | npm run build: contracts/backend/API/worker/web; 18 routes generated |
| Visual | PASS scoped | Chromium fixture admin word sets, desktop1440/mobile390/320; ảnh dưới design-system/assets/confirmation-*.png. Đã xem ảnh320: đủ title/message/2buttons, focus rõ, không tràn dialog |
| Real backend/auth/PG/ASR/exam scoring | NOT VERIFIED | Browser fixtures intercept API; không ghi dữ liệu người dùng, không gọi provider. Payload và API source không đổi; không dùng test mock chứng nhận kết nối thật |
| Full accessibility/physical device/zoom200% | NOT VERIFIED | Chỉ keyboard/focus/viewport và visual scoped; không tuyên bố full WCAG |

Test cũ đã chuyển native dialog accept/dismiss sang nút component tại knowledge.spec.ts/vocabulary-catalog-ui.spec.ts/editorial-desk.spec.ts. Hai suite acceptance cần disposable account chưa chạy lại trong scope này. Editorial pinned-version expectation kiểm các query unique để tương thích Strict Mode double effect ở dev, vẫn bắt mọi revision sai. Ảnh editorial ngoài scope do suite sinh lại đã khôi phục; giữ ảnh mới confirmation làm evidence.

## Self-review riêng

Đọc lại diff sau implementation đối chiếu 13 call sites, trạng thái hủy/true, await chọn editor/chuyển kind và synchronous preventDefault. Không đổi service/schema/ownership/version/retry hoặc published content. Lint guard frontend chặn các dạng phổ biến, không hứa dò mọi alias động. docs:sync/check PASS (20 features,250 sources,2225 links); plan:sync/check PASS (44 PBIs,92 tasks). git diff --check PASS sau sửa trailing spaces của đoạn docs mới. Giữ Review cho human QA, không tự đóng #14 từ mock tests; không push/merge/deploy.


## Final audit và quyền merge của owner

Owner yêu cầu trực tiếp: “ok tự test và audit lại lần cuối nếu ổn thì merge vào main rồi report cho tôi”. Quyền này thay giới hạn không merge ở snapshot trước; không cấp quyền deploy hoặc duyệt nội dung học liệu.

Candidate cuối nằm trong managed worktree riêng `bugfix/14-custom-confirmation-dialogs`, base main e69f357. Chỉ đưa scope #14, không kéo edits pilot/tracer/workflow/skills chưa commit trong checkout gốc. File shared knowledge.spec.ts chỉ đổi thao tác xác nhận, không lấy các bổ sung tracer khác; tracking chỉ thêm PB-044, giữ trạng thái PB-001/PB-002 theo main. Ảnh ngoài scope sinh lại bởi tests sẽ được khôi phục trước commit.

Lượt review riêng tìm được lỗi pending dialog còn trên trang mới khi browser Back làm caller unmount. Test mới RED (expected0, received1); sửa `useConfirmation` để mỗi caller có AbortController và provider settle(false) khi abort. GREEN regression; không chỉ đóng UI mà Promise cũng trả false để ngăn stale mutation. Source review kiểm listener được tháo khi resolve, Strict Mode effect cleanup, cancellation/single-pending semantics và các caller.

Mở rộng browser fixtures kiểm reader reload hủy/accept và related cancel/back giữ filter; speech delete hủy/duplicate/open/error giữ row và payload; exam submit hủy/accept/error giữ versioned body; legacy draft import hủy/confirmed pending khóa nút; admin selection và 3 editorial/7 profile regression. Đây là network-intercepted UI tests, không live PG/provider. Không sửa API/schema/data, không gọi dịch vụ trả phí. Kết quả cuối và merge commit ghi trong HANDOFF sau khi kiểm xong.


### Kết quả final — PASS, đủ điều kiện merge #14

- `npm run lint`: PASS; `npx eslint tests/e2e/confirmation.spec.ts` PASS sau bổ sung test. ESLint negative probes PASS cho4forms.
- `npm run typecheck`: PASS; `npm run build`: PASS contracts/backend/API/worker/web18routes; chạy tuần tự, không thay backend.
- `npm test -- --maxWorkers=1`:88/88PASS,19files. Lượt mặc định19workers lúc đang build có2timeout5s ở grading-worker/runtime-errors (86pass); không đổi test timeout hay code để hợp thức hóa; cùng88test PASS khi chạy1worker sau build.
- `E2E_BASE_URL=http://localhost:3102 npx playwright test tests/e2e/confirmation.spec.ts tests/e2e/editorial-desk.spec.ts tests/e2e/profile-ui.spec.ts`:17/17PASS trên Next dev.
- Cùng17test PASS trên production standalone tại `http://127.0.0.1:3102` (36.3s), gồm7confirmation +3editorial +7profile. Serve built standalone server với public/.next/static được copy vào output; không dùng next start warning làm chứng nhận deployment. Test intercept API, không dữ liệu thật/provider.
- Visual confirmation1440/390/320 lưu trong design-system/assets. Dialog đủ nút/message/focus ở320. Source scan không còn native confirm/alert/prompt hoặc beforeunload. Diff whitespace, docs/plan checks PASS sau sync, không đổi sprint Proposed/các task ngoài PB-044.
- Final source review PASS:13callers await; cancel không phát mutation; một pending decision; owner abort không để dialog/action trên trang mới; link preventDefault đồng bộ; import busy/finally; auth/CAS/payload giữ nguyên. Không còn finding mở trong scope #14.

| Feature audit | Kết nối kiểm |
|---|---|
| [design-system](../features/design-system/audit.md) | Provider lifecycle/focus/mobile/Back PASS |
| [knowledge-library](../features/knowledge-library/audit.md) | Reader reload/cancel/back/related → mock state/API PASS |
| [content-authoring](../features/content-authoring/audit.md) | Async editor/batch/import/preview → mock CAS conflict PASS |
| [vocabulary-catalog](../features/vocabulary-catalog/audit.md) | WordSets dirty cancel/return link và owner unmount PASS; service không đổi |
| [exam-practice](../features/exam-practice/audit.md) | Submit true/version/body → API error recovery PASS |
| [self-hosted-speech](../features/self-hosted-speech/audit.md) | Delete cancel/duplicate/body/error giữ recording PASS |
| [user-profile](../features/user-profile/audit.md) | Legacy import cancel/pending/body và7profile regression PASS |

NOT VERIFIED ngoài phạm vi: live PG/auth/provider và opt-in knowledge/catalog real-backend suites không chạy lại; không đổi contracts backend. Full WCAG/hardware chưa chứng nhận. Không có content review/production deployment trong issue này. Owner đã giao self-test/audit rồi merge nếu ổn, nên PB-044-T01 Done/Pass sau final audit, không yêu cầu lặp lại human UI gate cho chính scope này.
