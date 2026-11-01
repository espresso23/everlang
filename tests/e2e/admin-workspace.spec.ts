import { test, expect, type Page } from "@playwright/test";

async function fixture(page: Page, admin: boolean, loggedIn = true) {
  let signedIn = loggedIn;
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const user = { id: "workspace-qa", name: "Workspace QA", email: "workspace@example.test", emailVerified: true, admin };
    if (path === "/api/auth/sign-in/email") signedIn = true;
    if (path === "/api/auth/refresh" && !signedIn) return route.fulfill({ status: 401, json: { error: "Signed out" } });
    if (path === "/api/dashboard") return route.fulfill({ json: { profile: { minutes: 15, goal: "QA" }, plan: { day: "2026-11-01", version: 1, tasks: [], completed: false }, dueCount: 0, streak: 0, stats: { totalCompleted: 0, averageScore: 0 }, errors: [] } });
    return route.fulfill({ json: path === "/api/auth/csrf" ? { csrfToken: "fixture" } : path.startsWith("/api/auth/") ? { accessToken: "fixture", user } : path === "/api/config" ? { google: true } : { items: [], state: null } });
  });
}

test("admin login lands in management and can switch modes without redirect loop", async ({ page }) => {
  await fixture(page, true, false);
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill("workspace@example.test");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("workspace-qa-password");
  await page.getByRole("button", { name: "Đăng nhập →", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/overview$/);
  await expect(page.getByRole("heading", { name: "Không gian quản trị" })).toBeVisible();
  for (const [name, path] of [["Kiến thức", "/admin/knowledge"], ["Bộ từ", "/admin/word-sets"], ["Bài luyện", "/admin"]]) {
    await page.getByRole("navigation", { name: "Điều hướng quản trị" }).getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  }
  await page.getByRole("link", { name: "Học tập", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
  await page.getByRole("link", { name: "Quản trị", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/overview$/);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const header = await page.locator("header").boundingBox();
    const navigation = await page.getByRole("navigation", { name: "Điều hướng quản trị" }).boundingBox();
    expect(header!.y + header!.height).toBeLessThanOrEqual(navigation!.y);
    const switchLink = await page.getByRole("link", { name: "Học tập", exact: true }).boundingBox();
    expect(switchLink!.y + switchLink!.height).toBeLessThanOrEqual(header!.y + header!.height);
    await page.screenshot({ path: `documentation/features/content-authoring/assets/admin-workspace-${width}.png`, fullPage: true });
  }
});

test("Google callback landing routes by authenticated role", async ({ page }) => {
  await fixture(page, true);
  await page.goto("/sign-in");
  await expect(page).toHaveURL(/\/admin\/overview$/);
});

test("Google login requests role landing while callback errors remain visible", async ({ page }) => {
  await fixture(page, true, false);
  let callbackURL = "";
  await page.route("**/api/auth/google/start", async route => {
    callbackURL = route.request().postDataJSON().callbackURL;
    await route.fulfill({ status: 503, json: { error: "QA Google unavailable" } });
  });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Đăng nhập với Google", exact: true }).click();
  await expect.poll(() => callbackURL).toBe("/sign-in");
  await expect(page.getByRole("status")).toContainText("QA Google unavailable");
  await page.goto("/sign-in?error=oauth_failed");
  await expect(page.getByRole("alert").filter({ hasText: "Không hoàn tất đăng nhập" })).toBeVisible();
});

test("learner cannot mount management editor and retains study landing", async ({ page }) => {
  await fixture(page, false);
  const adminCalls: string[] = [];
  page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/admin/")) adminCalls.push(r.url()); });
  await page.goto("/admin/knowledge");
  await expect(page.getByRole("heading", { name: "Không có quyền quản trị" })).toBeVisible();
  expect(adminCalls).toEqual([]);
  await expect(page.getByRole("link", { name: "Quản trị", exact: true })).toHaveCount(0);
  await page.goto("/sign-in");
  await expect(page).toHaveURL(/\/$/);
});

test("unresolved or failed session never mounts management editor", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/auth/csrf", r => r.fulfill({ json: { csrfToken: "fixture" } }));
  await page.route("**/api/auth/refresh", async r => { await gate; await r.fulfill({ status: 503, json: { error: "QA connection unavailable" } }); });
  await page.goto("/admin/knowledge");
  await expect(page.getByText("Đang kiểm tra đăng nhập…").first()).toBeVisible();
  await expect(page.getByText("Tạo tài liệu", { exact: true })).toHaveCount(0);
  release();
  await expect(page.getByRole("button", { name: "Thử lại kết nối" })).toBeVisible();
  await expect(page.getByText("Tạo tài liệu", { exact: true })).toHaveCount(0);
});
