# Function description — user-profile

[Đặc tả](README.md) · [System design](system-design.md).

| File / symbol | Input → output | Side effect / lỗi |
|---|---|---|
| [lib/profile.ts](../../../lib/profile.ts) · profileInput | Unknown JSON → five validated fields | trim name/goal, strict keys, IANA timezone; Zod error → 400 |
| [lib/profile.ts](../../../lib/profile.ts) · ProfileResponse | Compile-time response contract | Không chứa provider token/password/session token |
| [app/api/profile/route.ts](../../../app/api/profile/route.ts) · GET | Verified session → ProfileResponse | Insert default profile if absent; SELECT own fields/provider names, no-store |
| [app/api/profile/route.ts](../../../app/api/profile/route.ts) · PUT | Verified session + profileInput → saved:true | One PG transaction updates name/settings; rollback on failure, no role/email edit |
| [app/profile/page.tsx](../../../app/profile/page.tsx) · Profile | /api/profile response + form → UI | Loading/error retry, saving, GET refresh then useSession.refetch; provider-aware security actions report failures |
| [app/profile/page.tsx](../../../app/profile/page.tsx) · LegacyDraftImport | Confirm + localStorage → draft PUT version0 | Preserves cloud drafts; reports imported count, catches malformed legacy data |
| [components/user-avatar.tsx](../../../components/user-avatar.tsx) · UserAvatar | name/image/large → image or initials | HTTPS only, onError fallback, 32/72px geometry, descriptive alt |
| [components/shell.tsx](../../../components/shell.tsx) · Shell | useSession → protected children or auth state | Shared owner [design system](../design-system/functions.md); pending/error do not mount private pages |

UI tests with fake provider: [profile-ui.spec.ts](../../../tests/e2e/profile-ui.spec.ts). Actual email session/API/DB/header: [beta.spec.ts](../../../tests/e2e/beta.spec.ts). Pure validation: [profile.test.ts](../../../tests/unit/profile.test.ts).
