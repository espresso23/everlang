# Admin workspace verification — 2026-11-01

Feature branch feature/admin-workspace / PB-042-T01 / GitHub #9. Canonical requirements AW-01–04.

Run: npm test; npm run lint; npm run typecheck; docker compose build app; docker compose up -d --no-deps app; npx playwright test tests/e2e/admin-workspace.spec.ts --timeout=25000; npx playwright test tests/e2e/beta.spec.ts --grep "sign-in is responsive".

Role E2E intercepts HTTP responses for isolated deterministic UI coverage. No real-user session/token/private data captured; screenshots show Workspace QA only. It verifies post-OAuth role landing and requested callback URL, not Google upstream login. Owner live smoke: sign out → Google with allowed admin → /admin/overview → knowledge → Học tập → Quản trị; learner direct /admin/knowledge denied. No database/auth identity mutation in this increment.

Visual review desktop1440/mobile390/320; existing horizontal-scroll nav retained. Header admin wraps and grows naturally without overlapping menu; no document horizontal overflow. No content auto-published. Real physical keyboard/assistive tech and full WCAG not certified.

Final: 5/5 role browser checks11.7s +1/1 deployed sign-in smoke3.7s PASS;86unit PASS; lint/typecheck/fullDockerbuild PASS. Screenshot review final320 passed after autoheight correction.
