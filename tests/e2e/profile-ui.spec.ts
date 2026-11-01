import { expect, test } from "@playwright/test";

// Provider identity is mocked only in this suite. Real ownership is tested in beta.spec.ts.
const user = { id: "qa-profile", name: "EverLang QA", email: "profile@example.test",
  emailVerified: true, image: "https://avatar.example.test/profile.png", admin: false };
const profile = { user, profile: { level: "Trung cấp", goal: "Đọc tiếng Hàn", minutes: 20, timezone: "Asia/Ho_Chi_Minh" },
  providers: ["google"], googleEnabled: true };
const session = {accessToken: "fixture-access", user, session: { id: "mock", token: "mock", userId: user.id, expiresAt: "2099-01-01T00:00:00Z",
  createdAt: "2026-10-30T00:00:00Z", updatedAt: "2026-10-30T00:00:00Z" } };

test.beforeEach(async({page})=>{await page.route("**/api/auth/csrf",route=>route.fulfill({json:{csrfToken:"fixture"}}));});
test("pending session never shows guest login or requests private page data", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let profileRequests = 0;
  await page.route("**/api/auth/{refresh,me}**", async route => { await gate; await route.fulfill({ status:401,json:{error:"Hãy đăng nhập",code:"REFRESH_INVALID"} }); });
  await page.route("**/api/profile", async route => { profileRequests++; await route.fulfill({ json: profile }); });
  await page.goto("/profile");
  await expect(page.getByText("Đang kiểm tra đăng nhập…").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Đăng nhập", exact: true })).toHaveCount(0);
  expect(profileRequests).toBe(0);
  release();
  await expect(page.getByRole("link", { name: "Đăng nhập", exact: true })).toBeVisible();
});

test("Google profile renders avatar, falls back on image failure, and hides credential form", async ({ page }) => {
  await page.route("**/api/auth/{refresh,me}**", route => route.fulfill({ json: session }));
  await page.route("**/api/profile", route => route.fulfill({ json: profile }));
  await page.route(user.image, route => route.fulfill({ status: 404 }));
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
  await expect(page.getByRole("img", { name: `Ảnh đại diện của ${user.name}` })).toHaveCount(2);
  await expect(page.locator(".user-avatar").first()).toHaveText("EQ");
  await expect(page.getByLabel("Mật khẩu hiện tại")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Đăng nhập", exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "documentation/features/user-profile/assets/profile-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("header .user-avatar")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "documentation/features/user-profile/assets/profile-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Chỉnh sửa hồ sơ" }).click();
  await expect(page.getByLabel("Tên", { exact: true })).toBeFocused();
  await page.screenshot({ path: "documentation/features/user-profile/assets/profile-edit-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "documentation/features/user-profile/assets/profile-edit-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Hủy thay đổi" }).click();
  await page.getByText("Bảo mật & đăng nhập", { exact: true }).click();
  await expect(page.getByText("Google đã được liên kết với tài khoản này.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mật khẩu hiện tại")).toHaveCount(0);
});

test("profile edit cancels without writes and preserves input on failure before saving to view", async ({ page }) => {
  let current = structuredClone(profile);
  let attempts = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/auth/{refresh,me}**", route => route.fulfill({ json: { ...session, user: current.user } }));
  await page.route(user.image, route => route.fulfill({ status: 404 }));
  await page.route("**/api/profile", async route => {
    if (route.request().method() !== "PUT") return route.fulfill({ json: current });
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 503, json: { error: "Chưa lưu được hồ sơ" } });
    await gate;
    const body = route.request().postDataJSON();
    current = { ...current, user: { ...current.user, name: body.name }, profile: body };
    await route.fulfill({ json: { saved: true } });
  });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Chỉnh sửa hồ sơ" }).click();
  await page.getByLabel("Tên", { exact: true }).fill("Discarded name");
  await page.getByRole("button", { name: "Hủy thay đổi" }).click();
  expect(attempts).toBe(0);
  await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chỉnh sửa hồ sơ" })).toBeFocused();
  await page.getByRole("button", { name: "Chỉnh sửa hồ sơ" }).click();
  await expect(page.getByLabel("Tên", { exact: true })).toHaveValue(user.name);
  await page.getByLabel("Tên", { exact: true }).fill("Updated Profile QA");
  await page.getByRole("textbox", { name: /^Mục tiêu/ }).fill("Đọc tiểu thuyết tiếng Hàn");
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Chưa lưu được hồ sơ" })).toBeVisible();
  await expect(page.getByLabel("Tên", { exact: true })).toHaveValue("Updated Profile QA");
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await expect(page.getByRole("button", { name: "Đang lưu…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Hủy thay đổi" })).toBeDisabled();
  release();
  await expect(page.getByRole("heading", { name: "Updated Profile QA" })).toBeVisible();
  await expect(page.locator(".profile-goal")).toHaveText("Đọc tiểu thuyết tiếng Hàn");
  await expect(page.locator("header .user-link")).toContainText("Updated Profile QA");
  await expect(page.getByLabel("Tên", { exact: true })).toHaveCount(0);
});

test("profile view and editor handle long identity and goals on 320px", async ({ page }) => {
  const long = { ...profile, user: { ...user, name: "Người học ".repeat(8).trim(), email: "long-address-" + "a".repeat(70) + "@example.test" },
    profile: { ...profile.profile, goal: "목표".repeat(150) } };
  await page.route("**/api/auth/{refresh,me}**", route => route.fulfill({ json: { ...session, user: long.user } }));
  await page.route("**/api/profile", route => route.fulfill({ json: long }));
  await page.route(user.image, route => route.fulfill({ status: 404 }));
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/profile");
  await expect(page.locator(".profile-goal")).toHaveText(long.profile.goal);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Chỉnh sửa hồ sơ" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("OAuth callback error is explained without reflecting arbitrary query text", async ({ page }) => {
  await page.route("**/api/auth/{refresh,me}**", route => route.fulfill({ status:401,json:{error:"Hãy đăng nhập",code:"REFRESH_INVALID"} }));
  await page.goto("/sign-in?error=account_not_linked");
  await expect(page.getByRole("status").filter({ hasText: "Email này đã có tài khoản" })).toBeVisible();
  await page.goto("/sign-in?error=untrusted-query-string");
  await expect(page.getByText("Yêu cầu xác thực chưa hoàn tất.", { exact: false })).toBeVisible();
  await expect(page.getByText("untrusted-query-string", { exact: false })).toHaveCount(0);
});

test("successful provider image loads and profile failures can be retried", async ({ page }) => {
  await page.route("**/api/auth/{refresh,me}**", route => route.fulfill({ json: session }));
  let failed = true;
  await page.route("**/api/profile", route => route.fulfill(failed
    ? { status: 503, json: { error: "Hồ sơ tạm thời không khả dụng" } } : { json: profile }));
  await page.route(user.image, route => route.fulfill({ contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="#4546c7"/></svg>' }));
  await page.goto("/profile");
  await expect(page.getByRole("alert").filter({ hasText: "Hồ sơ tạm thời" })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
  await expect.poll(() => page.locator("header .user-avatar img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test("session service failure offers retry without pretending the user is signed out", async ({ page }) => {
  let failed = true;
  await page.route("**/api/auth/{refresh,me}**", route => route.fulfill(failed
    ? { status: 503, json: { message: "Unavailable" } } : { json: session }));
  await page.route("**/api/profile", route => route.fulfill({ json: profile }));
  await page.route(user.image, route => route.fulfill({ status: 404 }));
  await page.goto("/profile");
  await expect(page.getByRole("button", { name: "Thử lại kết nối" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Đăng nhập", exact: true })).toHaveCount(0);
  failed = false;
  await page.getByRole("button", { name: "Thử lại kết nối" }).click();
  await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
});
