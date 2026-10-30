# Function/component description — design-system

| Source / symbol | Trách nhiệm và contract |
|---|---|
| [app/layout.tsx](../../../app/layout.tsx) · RootLayout | Imports self-host font, globals, editorial in order; wraps Shell, lang vi, giữ children và metadata |
| [app/layout.tsx](../../../app/layout.tsx) · metadata | Title/description hiện có, không sửa nội dung SEO trong lượt theme |
| [components/shell.tsx](../../../components/shell.tsx) · Shell | Header/nav/session/avatar/footer giữ hành vi; class styles kế thừa skin mới |
| [components/dashboard.tsx](../../../components/dashboard.tsx) · Dashboard | Owner daily-dashboard; thêm aria-hidden quote/vertical note, data-word và editorial-title span trong khối cũ; không sửa task/data |
| [app/design-tokens.css](../../../app/design-tokens.css) · :root | Font/palette semantic và aliases; source chuẩn cho CSS/guide |
| [app/globals.css](../../../app/globals.css) · @theme | Existing layout và Tailwind palette aliases, import design tokens |
| [app/editorial.css](../../../app/editorial.css) | Skin visual theo guide: headings, controls, cards, reading exceptions, focus, artwork |
| [app/icon.svg](../../../app/icon.svg), [app/favicon.ico](../../../app/favicon.ico) | Giữ nguyên asset e hiện có; header logo chỉ đổi palette bằng CSS |
| [tests/e2e/editorial-design.spec.ts](../../../tests/e2e/editorial-design.spec.ts) | Mock identity/content cố định, không viết DB; before capture chỉ khi DESIGN_BASELINE=1, default compare structural snapshots; font/focus/spacing assertions |

Không thêm public function/API ngoài component hiện có. [Guide](../../design/README.md), [audit](audit.md), [UI](ui.md).
