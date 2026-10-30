# EverLang Editorial Design System

Feature ID: design-system. Branch feature/editorial-design-system, 2026-10-30. Thay nhận diện cobalt/lemon cũ theo yêu cầu mới; giữ logo e và wireframe.

Quy chuẩn frontend bắt buộc: [documentation/design](../../design/README.md). Có dẫn nguồn W3C và hướng dẫn đặc thù learning/language; không coi một bộ màu là bằng chứng tăng khả năng ghi nhớ.

| ID | Yêu cầu | Source / xác minh |
|---|---|---|
| DS-01 | Inter Variable self-host, có tiếng Việt; Hangul fallback; không tải font Google runtime | [layout](../../../app/layout.tsx), [package](../../../package.json), [font license](../../../public/fonts/INTER-LICENSE.txt), [UI tests](../../../tests/e2e/editorial-design.spec.ts) |
| DS-02 | Paper/white/ink/Cobalt, tokens chuẩn, góc mảnh, không gradient/bóng nổi | [tokens](../../../app/design-tokens.css), [editorial](../../../app/editorial.css), [globals](../../../app/globals.css) |
| DS-03 | Uppercase headline, black labels, số Cobalt, quote/vertical/layer trong artwork cũ | [Dashboard](../../../components/dashboard.tsx), editorial.css; không đổi text node câu học |
| DS-04 | Giữ DOM order, cột, width, padding, gap, breakpoint hiện hành | Wireframe snapshots trước/sau 8 route × 3 viewport, [test](../../../tests/e2e/editorial-design.spec.ts); reflow do typography được phép |
| DS-05 | Không uppercase/giãn chữ tên người, Hangul/SRS/editor; loading/error/session giữ nguyên | [Shell](../../../components/shell.tsx), [avatar/profile](../user-profile/README.md), UI/functional E2E |
| DS-06 | Focus rõ, token contrast đạt mục tiêu, không tràn ở mobile/text spacing | [audit](audit.md); không tuyên bố full WCAG certification |
| DS-07 | Frontend tương lai tuân thủ design guide và traceability | [AGENTS](../../../AGENTS.md), [guide](../../design/README.md), [code-map](../../code-map.json) |

Không API/schema/quyền/auth/worker thay đổi. Các feature giữ nguyên hành vi; [system design](system-design.md), [functions](functions.md), [UI](ui.md), [audit](audit.md).
