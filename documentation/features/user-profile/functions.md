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


## Điểm vào layout mới

| Source/symbol | Contract |
|---|---|
| [page.tsx](../../../app/profile/page.tsx) · Profile | Learning passport view, inline editing state, loading/error, focus Tên khi mở và CTA khi đóng |
| [page.tsx](../../../app/profile/page.tsx) · saveProfile | FormData 5 fields → PUT/GET/refetch; pending locks fields and buttons, success view, failure keeps draft/alert |
| [page.tsx](../../../app/profile/page.tsx) · AccountSecurity | ProfileResponse → existing provider-aware actions; local busy/status trong disclosure |
| [profile.css](../../../app/profile/profile.css) | Desktop sidebar304px/main, responsive1000/760/360; chỉ selectors profile- |
| LegacyDraftImport | Giữ confirm và draft version0; placement chuyển vào disclosure, không đổi ownership |

Test beta click Edit trước khi fill và mở security trước kiểm password; UI test thêm cancel/no-write, saving lock, failure retry, successful view/name/session, focus và long content320px.
