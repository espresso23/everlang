# Audit tích hợp editorial / learning UI

Ngày 2026-10-30; branch feature/editorial-design-system, baseline80e4247. Không đổi API/schema/session/queue hoặc dữ liệu học.

| Kết nối | Kết quả / bằng chứng |
|---|---|
| Fontsource → layout imports → local CSS/font → Vietnamese/Hangul UI | PASS self-host font/font readiness và tiếng Việt; Hangul giữ fallback hệ thống, không uppercase/editor tracking |
| Tokens → Tailwind aliases → controls/cards/practice/review/profile | PASS review ảnh và token contrast; amber utility cũ chuyển neutral, semantic lỗi/đúng giữ nhãn |
| Typography → wireframe across 8 routes | PASS computed display/grid/flex/gap/padding/width/max-width khớp baseline1440/390/320; natural text reflow không phải pixel equality chiều cao |
| Session/profile → new Shell presentation | PASS bộ E2E auth/profile đang có, không sửa auth; ảnh/avatar không bị selector mobile ẩn |
| Input → autosave/API → UI / SRS / daily plan | PASS regression E2E email/API thật: save/name, nháp, SRS concurrency, dashboard version/isolation. Visual tests chỉ dùng fixture, không gọi AI |
| Contrast/focus/text spacing → usable learning text | PASS token pairs, spacing override practice390px, keyboard và uppercase exceptions; inverse notebook focus dùng trắng |
| Full screen reader/native browser zoom200% và toàn bộ WCAG | NOT VERIFIED; không dùng test token/viewport để tuyên bố WCAG certification |
| STT/S3/Tutor/Google provider credential | Không thay đổi; không tái xác minh dịch vụ ngoài trong lượt visual này |

Ảnh và before/after: [gallery](../design/screens.md). Spec: [guide](../design/README.md), feature audit [design-system](../features/design-system/audit.md).

Phát hiện audit: input search có pl-10 nhưng padding unlayered cũ che icon; khôi phục inset40px mà không đổi frame/container. Focus Cobalt trên notebook đen có contrast thấp; dùng outline trắng ở inverse surface. Lượt dev đầu timeout khi compile nhiều route lần đầu; tăng timeout suite, production dùng build tối ưu. Một lần Docker registry DNS lỗi tạm thời, retry build thành công; không sửa DNS hay cấu hình production để né lỗi.

Không migration hay rollback dữ liệu. Rollback visual: deploy baseline80e4247; giữ volume và account thật. Các tài khoản E2E disposable được dọn theo hai địa chỉ fixture chính xác.
