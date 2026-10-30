# Audit — làm nhẹ nền editorial

2026-10-30, bugfix/lighten-editorial-surfaces, baseline50197f5.

## Review riêng theo phản hồi người dùng

- Rà toàn bộ app/components CSS và utility: mảng ink ở notebook, title label, Beta/date badge, task hoàn thành, auth art note. Chuyển surface/paper/tint; giữ typography, Cobalt, profile passport và scrim modal có chức năng.
- Notebook có override đầy đủ h2/h3/eyebrow, description, empty p, del/strong/explanation/link. Quan trọng: globals.css cũ có rule chữ trắng; chỉ đổi background sẽ gây white-on-white. Source mới xử lý cả hai phía.
- Notebook rỗng có vùng paper nhẹ, thêm18px khoảng thở trước vùng trống và CTA; filled state giữ strikethrough/negative, strong/positive, explanation ink, link Cobalt gạch chân và focus Cobalt. Không đổi đường dẫn ôn grammar hoặc nội dung lỗi.
- Layer Hangul chuyển tint, quote nhẹ hơn; giảm cảm giác mực đen dày. Header/nav/layout/breakpoint/API không thay đổi.

## Kiểm tra và bằng chứng

| Phạm vi | Kết quả | Bằng chứng |
|---|---|---|
| Source cascade và contrast trên nền sáng | PASS review/test | Notebook white/heading ink, error explanation ink, negative/positive đúng; token contrast guide giữ nguyên |
| Empty/filled notebook + link ôn | PASS | 2 ca regression riêng, fixture synthetic; href correction/meaning giữ đúng |
| 1440/390/320, cấu trúc màn hình | PASS | Bộ editorial-design: 3 viewport,7 route giữ baseline, profile ngoại lệ đã được yêu cầu trước đó |
| Font/focus/spacing | PASS | Self-host font, input giữ casing và text-spacing; focus đổi sang Cobalt trên notebook sáng |
| Lint/typecheck/build/container | PASS | npm run lint; npx tsc --noEmit; Docker production build và recreate app |
| Backend/auth/provider end-to-end | N/A thay đổi này | Chỉ presentation CSS và UI test; không đổi API/DB/session, không gọi AI để test màu |
| Full WCAG/screen reader/native zoom | NOT VERIFIED đầy đủ | Không coi token/sample/viewport như certification |

Ảnh desktop/mobile: [empty desktop](../features/design-system/assets/light-notebook-empty-desktop.png), [filled desktop](../features/design-system/assets/light-notebook-filled-desktop.png), [empty mobile](../features/design-system/assets/light-notebook-empty-mobile.png), [filled mobile](../features/design-system/assets/light-notebook-filled-mobile.png). Chỉ dữ liệu QA, không ảnh tài khoản thật.

Không migration/data write; không tạo user QA. Rollback deploy50197f5, giữ toàn bộ volumes và account. [Quy chuẩn mới](../design/README.md), [feature UI](../features/design-system/ui.md), [sổ tay/dashboard](../features/daily-dashboard/ui.md).
