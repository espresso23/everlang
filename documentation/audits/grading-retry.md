# Audit — Retry failed grading

Ngày2026-10-31; branch bugfix/retry-failed-grading từ main af438bf. User log request2129d9fd-cdd1-4251-982a-a86bc3ce50e1 lúc14:05:40UTC (21:05:40Asia/Saigon) trả502/131.67ms. Đối chiếu app log và code: đường502 explicit duy nhất của POSTgrade là own dedup submission đãfailed; request không gọi provider mới. Không suy quota upstream đã hồi phục.

## Review riêng

- [POSTgrade](../../app/api/submissions/grade/route.ts) giữ auth/Origin/rate-limit/published source/snapshot/dedup. Own failed row trả409/code GRADING_PREVIOUS_FAILED/submissionId/retryable, không enqueue hoặc update failed attempt. Completed trảcache200; forceRegrade dùng requestId mới tạo dedupkey riêng/202.
- [Practice.submit](../../components/practice.tsx) đưa retryGrading tới error alert cho failed409 và failed polling. Click Chấm lại bằng AI gọi forceRegrade=true; không phụ thuộc report modal, không tự retry vô hạn, gradingRequestRef chặn double submission. Draft/textarea giữ nguyên; không đổi model/billing/worker/cooldown/schema hoặc reset dữ liệu.
- Endpoint/API logger chung vẫn có x-request-id và phân loại409warning thay502error. Thông báo provider-safe lấy từ failed row do server tạo.

## Checks

- PASS74/74unit,12files: [route regression](../../tests/unit/grading-retry.test.ts) kiểm409/noenqueue/noupdate/ownquery/requestId, explicit force dedup mới/attempts3, cached report và anonymous401. `npm test`, `npx tsc --noEmit` exit0.
- Browser [regression](../../tests/e2e/grading-retry.spec.ts) kiểm failed cached và worker failed → alert action explicit → requestId mới/forceRegrade → draft giữ nguyên, không gọi thêm AI nếu chưa click;1440/390/320. Kết quả cuối và ảnh bổ sung bên dưới.
- Lượt test đầu lỗi fixture stats/favorites thiếu field sau profile load, không phải lỗi app; sửa fixture đủ contract và chạy lại. Không bỏ assertions hoặc fake provider success.
- NOT VERIFIED: successful real OpenRouter grading/quota availability, physical screenreader/native zoom; không gọi cloud trong lượt này. Browser/API/worker failures mô phỏng; unit route dùng real API wrapper và mocked data services.

Feature audits: [AI](../features/ai-grading/audit.md), [practice](../features/translation-practice/audit.md). Final build/deploy/docs/cleanup ghi sau kiểm tra.

## Final results

- PASS browser dev3001:2tests25.0s. Final deployed3000: `E2E_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/grading-retry.spec.ts` —2passed16.1s. Cached-failed và worker-failed đều có nút retry explicit, draft không mất, không phát sinh request mới trước click; force request cóUUID mới.
- PASS UI screenshots1440/390/320 không tràn; [desktop](../features/ai-grading/assets/retry-failed-1440.png), [mobile390](../features/ai-grading/assets/retry-failed-390.png), [mobile320](../features/ai-grading/assets/retry-failed-320.png). Ảnh từ final deployed code với API fixtures; screenshot mobile đã review.
- PASS74unit/typecheck, targeted ESLint0errors/warnings, Docker production42routes, app recreate3000. Dev3001 dừng; giữ image everlang-before-grading-retry:local để rollback, giữ volumes. Không đổi/deploy worker, không schema/migration hoặc ghi dữ liệu thật.
- PASSdocs:sync/docs:check17features/154source-config, plan:check38PBI/82tasks/6Proposed, diff check. Không sửa taskstatus/start sprint. Branch bugfix/retry-failed-grading chưa commit/merge/push; main checkpointaf438bf giữ nguyên.
- Giới hạn: không gọi OpenRouter thật hoặc tạo lượt chấm thay người dùng. Sửa này không chứng minh upstream quota/quality đã hồi phục; lỗi provider thật vẫn có thể làm retry thất bại với draft được giữ nguyên.
