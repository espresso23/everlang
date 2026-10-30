# Audit — Editorial Design System

Ngày 2026-10-30, feature/editorial-design-system, baseline80e4247. Review riêng sau implement và kiểm production Docker.

| Requirement | Kết quả | Bằng chứng |
|---|---|---|
| DS-01 font thật/self-host/Vietnamese | PASS | Fontsource5.3.0, font request same-origin, document.fonts.ready/check với HỌC TIẾNG VIỆT; license public/fonts |
| DS-02 palette, visual skin | PASS review | [contrast pairs](assets/contrast.json), [gallery](../../design/screens.md); không gradient/bóng nổi; semantic feedback giữ riêng |
| DS-03 editorial hierarchy/decor | PASS review | H1/H2 uppercase, black/white labels, Cobalt stats, quote/vertical/layer trong aria-hidden hero-art |
| DS-04 giữ wireframe | PASS | 8 route × 1440/390/320px; computed structural props equality với before snapshot, overflow false; không cam kết text height pixel-identical |
| DS-05 giữ học liệu/auth behavior | PASS | Input Hangul/Vietnamese/lowercase giữ nguyên; review/SRS/name exceptions; auth/profile/SRS/dashboard regression E2E |
| DS-06 accessibility scope | PASS phạm vi test; NOT VERIFIED full WCAG | Keyboard focus, token contrast, text-spacing override. Native zoom200%, screen reader và contrast mọi trạng thái legacy chưa audit exhaustive |
| DS-07 docs/mandatory policy | PASS | AGENTS rule → design/README → source/code-map + UI contracts, docs:check |

Lệnh kiểm: npm run lint; npx tsc --noEmit; npm test (23/23); production Docker build; E2E_AUTH_TESTS=1 npx playwright test (11/11 trên container). Ca design riêng chạy lại sau chỉnh inverse focus. Before snapshots chỉ ghi với DESIGN_BASELINE=1 trước sửa runtime; không refresh baseline để bỏ qua regression.

Contrast measured từ token: ink/paper17.15:1, muted/paper6.36:1, white/Cobalt6.59:1, Cobalt/tint5.86:1, input border/white3.69:1. Những số này không là chứng nhận mọi tổ hợp màu trong app.

Review ảnh1440/390, overflow320; tất cả fixture UI là synthetic, không có ảnh Google thật. Source diff giữ container layout rules; search text inset pl-10 được khôi phục, không đổi field box. New decorations nằm ngoài reading flow và mobile ẩn theo breakpoint760 cũ.

[Audit tích hợp](../../audits/editorial-learning-ui.md) · [Design guide](../../design/README.md) · [Gallery](../../design/screens.md).

## Lịch sử audit trước theme editorial

# Audit cập nhật — 2026-10-30, feature/user-profile

PASS phạm vi sửa: 23 unit, 7 Playwright; lint/typecheck và Docker production build. Profile API/DB/session/header dùng hai fixture email thật; trạng thái session/avatar/error dùng mock có chủ đích. Google login thật được chủ tài khoản xác nhận và SQL kiểm provider/image/session; explicit linking và SMTP production chưa kiểm end-to-end.

Review riêng bắt và sửa mobile selector ẩn avatar. Header không mount trang cá nhân khi pending/error; không phản chiếu raw OAuth query hoặc ghi code/state vào log mới.

[Audit nhóm](../../audits/profile-auth-integration.md) · [Profile UI và ảnh](../user-profile/ui.md).

## Lịch sử audit baseline

# Audit — design-system

- Ngày: 2026-10-30; baseline code `1d0fbad`; tài liệu được đối chiếu nguồn trước bắt đầu profile mới.
- Reviewer: Codex, lượt review tài liệu/contract riêng; không giả định mọi chức năng đã hoàn tất.
- Kết luận: **NOT VERIFIED toàn bộ feature ở snapshot mới**; các bằng chứng đã có được phân biệt bên dưới.

| Phạm vi | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| File/symbol và hợp đồng trong docs | PASS kiểm tra cấu trúc sau `npm run docs:check` | [Code map](../../code-map.json), source links, signatures; kiểm tra hash phát hiện drift |
| Kiểm thử có liên quan | Theo test runner và [baseline evidence](../../shared/baseline-evidence.md) | [tests/e2e/beta.spec.ts](../../../tests/e2e/beta.spec.ts) |
| E2E/provider/UI đặc thù | NOT VERIFIED nếu chưa ghi bằng chứng riêng | Session pending/avatar đã sửa trong feature/user-profile; xem [audit tích hợp](../../audits/profile-auth-integration.md). Một số utility colors trong Practice vẫn có màu trạng thái ngữ nghĩa. |

## Audit kết nối

Luồng phải kiểm: **RootLayout → Shell/useSession → navigation + page → shared CSS tokens**.

Quyền/validation, contract hai đầu, snapshot/state và lỗi cần đối chiếu [system design](system-design.md). [Audit tích hợp baseline](../../audits/baseline-integration.md) chỉ ra các kết nối đã kiểm và chưa kiểm; không đánh dấu PASS bằng suy đoán từ build.

## Phát hiện và việc còn lại

Session pending/avatar đã sửa trong feature/user-profile; xem [audit tích hợp](../../audits/profile-auth-integration.md). Một số utility colors trong Practice vẫn có màu trạng thái ngữ nghĩa.

Điều kiện nâng trạng thái verified: yêu cầu bắt buộc trong [README](README.md) có bằng chứng tương ứng, không còn lỗi bắt buộc, docs/symbol/hash đúng và provider đã kiểm trong môi trường mục tiêu. Lịch sử kiểm tra trước đây giữ ở [FEATURE_AUDIT](../../../FEATURE_AUDIT.md); đây không phải khẳng định đã chạy lại mọi ca trong lượt tài liệu này.
