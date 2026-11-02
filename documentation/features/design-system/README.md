# EverLang Editorial Design System

Feature ID: design-system. Branch feature/editorial-design-system, 2026-10-30. Thay nhận diện cobalt/lemon cũ theo yêu cầu mới; giữ logo e và wireframe.

Quy chuẩn frontend bắt buộc: [documentation/design](../../design/README.md). Có dẫn nguồn W3C và hướng dẫn đặc thù learning/language; không coi một bộ màu là bằng chứng tăng khả năng ghi nhớ.

Cập nhật theo phản hồi người dùng: bugfix/lighten-editorial-surfaces bỏ mảng nền đen ở sổ tay, title labels, date/Beta badge, task hoàn thành và auth art note. Dùng surface/paper/tint, ink/muted và Cobalt; giữ layout, actions, profile passport và overlay modal chức năng. Kiểm sổ tay rỗng/có lỗi để không còn chữ trắng kế thừa trên nền sáng.

| ID | Yêu cầu | Source / xác minh |
|---|---|---|
| DS-01 | Inter Variable self-host, có tiếng Việt; Hangul fallback; không tải font Google runtime | [layout](../../../apps/web/app/layout.tsx), [package](../../../package.json), [font license](../../../apps/web/public/fonts/INTER-LICENSE.txt), [UI tests](../../../tests/e2e/editorial-design.spec.ts) |
| DS-02 | Paper/white/ink/Cobalt, tokens chuẩn, góc mảnh, không gradient/bóng nổi | [tokens](../../../apps/web/app/design-tokens.css), [editorial](../../../apps/web/app/editorial.css), [globals](../../../apps/web/app/globals.css) |
| DS-03 | Uppercase headline trên nền sáng, số Cobalt, quote/vertical/layer nhẹ trong artwork cũ; không black-filled title/card | [Dashboard](../../../apps/web/components/dashboard.tsx), editorial.css; không đổi text node câu học |
| DS-04 | Giữ DOM order, cột, width, padding, gap, breakpoint hiện hành | Wireframe snapshots trước/sau 8 route × 3 viewport, [test](../../../tests/e2e/editorial-design.spec.ts); reflow do typography được phép |
| DS-05 | Không uppercase/giãn chữ tên người, Hangul/SRS/editor; loading/error/session giữ nguyên | [Shell](../../../apps/web/components/shell.tsx), [avatar/profile](../user-profile/README.md), UI/functional E2E |
| DS-06 | Focus rõ, token contrast đạt mục tiêu, không tràn ở mobile/text spacing | [audit](audit.md); không tuyên bố full WCAG certification |
| DS-07 | Frontend tương lai tuân thủ design guide và traceability | [AGENTS](../../../AGENTS.md), [guide](../../design/README.md), [code-map](../../code-map.json) |

Không API/schema/quyền/auth/worker thay đổi. Các feature giữ nguyên hành vi; [system design](system-design.md), [functions](functions.md), [UI](ui.md), [audit](audit.md).


## 2026-11-02 — DS-08 component xác nhận

DS-08: Mọi xác nhận dùng component của dự án; Hủy/Escape không thực thi, focus/keyboard/mobile hợp lệ; callback chọn bài và link chờ quyết định. Cấm hộp thoại native qua lint. [Issue #14](https://github.com/espresso23/everlang/issues/14), PB-044-T01.

[Hợp đồng dùng chung](../../shared/confirmation-ui.md) · [Audit tích hợp và giới hạn](../../audits/confirmation-ui-2026-11-02.md).

Final audit: `useConfirmation` gắn AbortController theo vòng đời caller; caller unmount (kể cả browser Back) hủy pending decision và đóng dialog. Test regression tại confirmation.spec.ts; không bảo vệ mọi navigation khi chưa có dialog mở.
