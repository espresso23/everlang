# UI — user-profile

Route [/profile](../../../app/profile/page.tsx); shared [Shell](../../../components/shell.tsx), [UserAvatar](../../../components/user-avatar.tsx).

- Header: during session loading show status, no login CTA; session error offers retry; authenticated shows avatar/name/profile link and logout; guest shows sign-in.
- Profile: loading text; API error + retry; identity card with image/initials, name, verified email and Google linkage; learning form with required bounds.
- Save disables button and shows Đang lưu; success refreshes identity/header and explains settings apply to the next plan; failure keeps entered fields.
- Security: Google-linked notice instead of duplicate link; credential account has current/new password; Google-only has explanation and email create-password action. Actions disabled while pending, errors shown.
- Legacy draft confirmation retained; admin sees content administration link.
- Fixed avatar geometry and wrapping identity text support 390px mobile. Original e logo and layout unchanged; current palette follows the editorial guide.

Screenshots use synthetic QA identity, not the owner's Google account. [Desktop](assets/profile-desktop.png) (1440×1000), [mobile](assets/profile-mobile.png) (390×844), 2026-10-30. These show the deliberate image-error fallback; successful image loading is covered separately by UI test. They prove UI states, not Google OAuth token exchange.

No custom photo upload or email edit. See [audit](audit.md) for verification/limits.

Giao diện hiện tại tuân thủ [EverLang Editorial](../../design/README.md); [gallery trước/sau](../../design/screens.md) thay appearance của ảnh lịch sử trong tài liệu này. Layout và contract feature giữ nguyên.
