# Function map — design-system

2026-11-01, branch `feature/nestjs-jwt-migration`. Bản đồ hiện tại sau chuyển monorepo. [Đặc tả](README.md) · [Thiết kế](system-design.md) · [UI](ui.md) · [Audit](audit.md).

| File/điểm vào | Symbol hiện có | Trách nhiệm/hợp đồng |
|---|---|---|
| [apps/web/components/shell.tsx](../../../apps/web/components/shell.tsx) | `Shell` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/layout.tsx](../../../apps/web/app/layout.tsx) | `metadata`, `RootLayout` | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/globals.css](../../../apps/web/app/globals.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/icon.svg](../../../apps/web/app/icon.svg) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/favicon.ico](../../../apps/web/app/favicon.ico) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/design-tokens.css](../../../apps/web/app/design-tokens.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/app/editorial.css](../../../apps/web/app/editorial.css) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [apps/web/public/fonts/INTER-LICENSE.txt](../../../apps/web/public/fonts/INTER-LICENSE.txt) | Cấu hình / dữ liệu / schema | Module nội bộ; hợp đồng và trạng thái UI/side effect theo README, system-design và ui của feature. |
| [tests/e2e/editorial-design.spec.ts](../../../tests/e2e/editorial-design.spec.ts) | `seed`, `user`, `lesson`, `fixtures`, `selectors`, `properties`, `dir` | Bằng chứng kiểm tra có thể tái chạy; kết quả thực tế và giới hạn ở audit. |

Hợp đồng auth/error dùng chung: [JWT/API](../../shared/auth-and-api.md), [exception/logging](../../shared/error-handling.md). Payload, SQL và Zod schema tại service là điểm thực thi; không có Next Route Handler hay adapter Better Auth. HTTP route inventory: [49 domain methods](../backend-nestjs-migration/routes.json). Audit cũ trước 2026-11-01 là bằng chứng của phiên bản cũ, không chứng nhận backend Nest hiện tại.


## 2026-11-02 — DS-08 component xác nhận

[confirmation.tsx](../../../apps/web/components/confirmation.tsx): `ConfirmationProvider`, `useConfirmation`; [layout.tsx](../../../apps/web/app/layout.tsx): `RootLayout`; [confirmation.css](../../../apps/web/components/confirmation.css): style modal; [eslint.config.mjs](../../../eslint.config.mjs): `eslintConfig` chặn native dialogs; [confirmation.spec.ts](../../../tests/e2e/confirmation.spec.ts): hủy/focus/navigation/async editor.

[Hợp đồng dùng chung](../../shared/confirmation-ui.md) · [Audit tích hợp và giới hạn](../../audits/confirmation-ui-2026-11-02.md).

Final audit: `useConfirmation` gắn AbortController theo vòng đời caller; caller unmount (kể cả browser Back) hủy pending decision và đóng dialog. Test regression tại confirmation.spec.ts; không bảo vệ mọi navigation khi chưa có dialog mở.
