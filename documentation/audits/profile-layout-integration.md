# Audit profile layout — 2026-10-30

Branch feature/profile-editorial-layout, baseline f7fa4cf. Phạm vi: view/editor, disclosure, CSS riêng; không đổi API/schema/quyền.

| Kết nối | Kết quả | Bằng chứng |
|---|---|---|
| Profile GET → passport / goal / rhythm / facts | PASS | Render dữ liệu thật từ contract; UI fixture riêng không giả làm số thành tích |
| View → edit → cancel | PASS | Focus Tên; cancel trả focus CTA, không PUT và không đổi saved data |
| Edit → failed PUT → retry → view/header | PASS | 503 giữ input và alert; pending khóa fieldset/Save/Cancel; thành công refetch tên/header, form unmount |
| UI → real session/API/PostgreSQL → header/reload | PASS | beta E2E email QA: save name, reload, mở editor kiểm persisted; 2 account isolation/400 unknown fields vẫn qua |
| Google/avatar → profile / security | PASS UI regression | Avatar success/fallback; Google-only không current-password, disclosure mở được và giữ notice/action |
| Credential/security / legacy data | PASS regression/source review | Credential form được mở trong E2E; provider APIs và confirm/version0 import giữ nguyên. Không tái thao tác Google linking thật hay nhập nháp thật |
| 1440/390 view và edit / 320 long content | PASS | 4 ảnh QA và long name/email/goal test; không overflow; mobile compact passport |
| Profile CSS → other route layout | PASS | Structural compare7 route khác ở1440/390/320; JSON baseline cũ giữ nguyên, riêng profile loại có lý do user yêu cầu redesign |
| Lint/typecheck/unit/production | PASS | 23 unit, 13 E2E (54.1s) trên container mới; lint/tsc và Docker build đạt |
| Screen reader/native zoom200%, provider ngoài | NOT VERIFIED toàn phần | Không coi focus/viewport tests như full WCAG; SMTP production/Google linking không tái kiểm end-to-end |

Source review: không có API nhận identity tùy ý; saveProfile giữ payload5 trường strict, backend transaction cũ. Chỉ UI state mới; không migration hoặc reset dữ liệu. View dùng số phút và level từ profile, không tính nhầm thành tích học.

Review trực quan: desktop304px passport/main, góc6px và viền nhẹ; không bóng/gradient. Form có label/hint và focus; mục tiêu/tên/Hangul không uppercase. Security message nằm gần action trong disclosure. Phần profile thay layout theo yêu cầu trực tiếp, không âm thầm refresh baseline để che regression.

[UI + ảnh](../features/user-profile/ui.md) · [Feature audit](../features/user-profile/audit.md) · [Design exception](../design/README.md).

Rollback: deploy baseline f7fa4cf, giữ PG/Mongo/Redis volumes. Dọn riêng2 email fixture sau E2E; không đụng account/session thật.
