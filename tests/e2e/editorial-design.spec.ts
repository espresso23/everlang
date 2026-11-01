import { expect, test } from "@playwright/test";
import fs from "node:fs";
const seed = JSON.parse(fs.readFileSync("data/seed-sentences.json", "utf8"));

// Deterministic visual fixture only; this suite never writes user data or calls AI.
const user = { id: "editorial-qa", name: "EverLang QA", email: "editorial@example.test", emailVerified: true, image: null, admin: true };
const lesson = { ...seed[0], _id: "111111111111111111111111", isAiGenerated: false };
const fixtures: Record<string, unknown> = {
  "/api/auth/refresh": { accessToken: "fixture-access", user, session: { id: "qa", userId: user.id, token: "mock", expiresAt: "2099-01-01T00:00:00Z" } },
  "/api/config": { google: true },
  "/api/profile": { user, profile: { level: "Trung cấp", goal: "Đọc hiểu tiếng Hàn mỗi ngày", minutes: 20, timezone: "Asia/Ho_Chi_Minh" }, providers: ["google"], googleEnabled: true },
  "/api/dashboard": { profile: { minutes: 20, goal: "Đọc hiểu tiếng Hàn" }, dueCount: 12, streak: 8,
    stats: { totalCompleted: 24, averageScore: 85 }, errors: [], plan: { day: "2026-10-30", version: 1, completed: false,
      tasks: [{ id: "review", type: "review", title: "Ôn thẻ đến hạn", reason: "Ghi nhớ từ đã học trong ngữ cảnh", minutes: 4, status: "pending" },
        { id: "new", type: "new", title: "Luyện dịch trong ngữ cảnh", reason: "Tiến thêm một bước trong mục tiêu của bạn", minutes: 10, status: "pending", target: lesson._id }] } },
  "/api/sentences": { items: [lesson], total: 1, page: 1, pages: 1, limit: 50 },
  "/api/drafts": { drafts: [] },
  "/api/user/stats": { totalCompleted: 24, averageScore: 85, weakTopics: [] },
  "/api/user/favorites": { items: [] },
  "/api/vocabulary": { items: [], dueCount: 0, serverNow: "2026-10-30T00:00:00Z" },
  "/api/exams": { items: [{ id: "mini", title: "Bài luyện TOPIK ngắn", kind: "mini", minutes: 10 }], attempts: [] },
  "/api/admin/content": { items: [] },
};
fixtures["/api/auth/me"]=fixtures["/api/auth/refresh"];
const selectors = [".app-header", ".app-nav", ".page", ".hero", ".hero-art", ".stats-grid", ".dashboard-grid", ".auth-layout", ".form-stack", ".practice"];
const properties = ["display", "grid-template-columns", "flex-direction", "gap", "padding-top", "padding-right", "padding-bottom", "padding-left", "max-width", "width"];
const dir = "documentation/features/design-system/assets";
for (const width of [1440, 390, 320]) {
  test(`editorial skin preserves wireframe at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    const baseline = process.env.DESIGN_BASELINE === "1";
    await page.setViewportSize({ width, height: 1000 });
    await page.route("**/api/**", route => route.fulfill({ json: fixtures[new URL(route.request().url()).pathname] ?? { items: [] } }));
    fs.mkdirSync(dir, { recursive: true });
    const measured: Record<string, unknown> = {};
    for (const [route, name] of [["/", "dashboard"], ["/sign-in", "auth"], ["/practice", "practice"], ["/profile", "profile"], ["/vocabulary", "vocabulary"], ["/library", "library"], ["/exams", "exams"], ["/admin", "admin"]]) {
      const errors: string[] = [];
      const listener = (error: Error) => errors.push(error.message);
      page.on("pageerror", listener);
      await page.goto(route);
      await expect(page.locator("header .user-link")).toBeVisible();
      if (route === "/profile") await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
      if (route === "/practice") await expect(page.getByPlaceholder("Nhập câu trả lời tiếng Hàn...").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      measured[route] = await page.evaluate(({ selectors, properties }) => Object.fromEntries(selectors.map(selector => [selector,
        Array.from(document.querySelectorAll(selector)).map(element => Object.fromEntries(properties.map(key => [key, getComputedStyle(element).getPropertyValue(key)])))
      ])), { selectors, properties });
      expect(errors, route).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      if (!baseline) {
        expect(await page.locator("body").evaluate(element => getComputedStyle(element).fontFamily)).toContain("Inter Variable");
        if (width === 1440 && route === "/") await expect(page.locator(".editorial-margin-note")).toBeVisible();
        if (route === "/practice") expect(await page.locator("textarea").first().evaluate(element => getComputedStyle(element).textTransform)).toBe("none");
      }
      if (width !== 320) await page.screenshot({ path: `${dir}/${baseline ? "before" : "editorial"}-${name}-${width}.png`, fullPage: true });
      page.off("pageerror", listener);
    }
    const file = `${dir}/wireframe-${width}.json`;
    if (baseline) fs.writeFileSync(file, JSON.stringify(measured, null, 2) + "\n");
    else {
      const expected = JSON.parse(fs.readFileSync(file, "utf8"));
      // User explicitly authorized a new profile layout. Retain the old snapshot as history;
      // all seven other routes must still match their original wireframe.
      delete measured["/profile"];
      delete expected["/profile"];
      expect(measured).toEqual(expected);
    }
  });
}

test("learning text, keyboard focus and self-hosted fonts survive text spacing overrides", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", request => { if (request.resourceType() === "font") fontRequests.push(request.url()); });
  await page.route("**/api/**", route => route.fulfill({ json: fixtures[new URL(route.request().url()).pathname] ?? { items: [] } }));
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/");
  const inverseLink = page.locator(".notebook .soft-button");
  await inverseLink.focus();
  expect(await inverseLink.evaluate(element => getComputedStyle(element).outlineColor)).toBe("rgb(36, 76, 224)");
  await page.goto("/practice");
  const editor = page.getByPlaceholder("Nhập câu trả lời tiếng Hàn...").first();
  await editor.fill("꾸준히 공부한다 — học mỗi ngày, abc.");
  await expect(editor).toHaveValue("꾸준히 공부한다 — học mỗi ngày, abc.");
  expect(await editor.evaluate(element => getComputedStyle(element).textTransform)).toBe("none");
  expect(await editor.evaluate(element => getComputedStyle(element).outlineStyle)).toBe("solid");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe("solid");
  await page.addStyleTag({ content: ".practice * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } .practice p { margin-bottom:2em !important; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(editor).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('800 16px "Inter Variable"', "HỌC TIẾNG VIỆT"))).toBe(true);
  expect(fontRequests.length).toBeGreaterThan(0);
  expect(fontRequests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

for (const populated of [false, true]) {
  test(`light notebook stays readable when ${populated ? "populated" : "empty"}`, async ({ page }) => {
    const dashboard = { ...(fixtures["/api/dashboard"] as Record<string, unknown>), errors: populated ? [{
      id: "qa-correction", snapshot: { viText: "Tôi đang học tiếng Hàn." },
      report: { grammarErrors: [{ error: "한국어를 공부해요다", correction: "한국어를 공부한다",
        explanation: "Chọn một đuôi câu phù hợp và dùng nhất quán trong câu." }] },
    }] : [] };
    await page.route("**/api/**", route => route.fulfill({
      json: new URL(route.request().url()).pathname === "/api/dashboard"
        ? dashboard : fixtures[new URL(route.request().url()).pathname] ?? { items: [] },
    }));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const notebook = page.locator(".notebook");
    await expect(notebook.getByRole("heading", { name: "Sổ tay của bạn" })).toBeVisible();
    expect(await notebook.evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
    expect(await notebook.locator("h2").evaluate(element => getComputedStyle(element).color)).toBe("rgb(17, 17, 17)");
    for (const title of await page.locator(".editorial-title").all())
      expect(await title.evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    if (populated) {
      await expect(notebook.locator("del")).toHaveText("한국어를 공부해요다");
      await expect(notebook.locator("strong")).toHaveText("한국어를 공부한다");
      expect(await notebook.locator(".error-note p").evaluate(element => getComputedStyle(element).color)).toBe("rgb(17, 17, 17)");
      expect(await notebook.locator("del").evaluate(element => getComputedStyle(element).color)).toBe("rgb(180, 35, 24)");
      expect(await notebook.locator("strong").evaluate(element => getComputedStyle(element).color)).toBe("rgb(22, 101, 52)");
      const href = await notebook.getByRole("link", { name: "Lưu để ôn →" }).getAttribute("href");
      expect(new URL(href!, page.url()).searchParams.get("term")).toBe("한국어를 공부한다");
    } else await expect(notebook.locator(".empty-note")).toBeVisible();
    const state = populated ? "filled" : "empty";
    await page.screenshot({ path: `${dir}/light-notebook-${state}-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(notebook.getByRole("link", { name: "Mở kho từ & SRS →" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${dir}/light-notebook-${state}-mobile.png`, fullPage: true });
  });
}
