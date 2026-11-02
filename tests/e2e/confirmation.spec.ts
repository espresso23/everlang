import { test, expect } from "@playwright/test";
import { knowledgeSeed } from "../../data/knowledge-seed";

test("discard confirmation cancels safely, traps focus, restores focus and navigates only on acceptance", async ({ page }) => {
  const writes: string[] = [];
  page.on("dialog", async dialog => { await dialog.dismiss(); throw new Error("Native browser dialog is forbidden"); });
  await page.route("**/api/**", route => {
    if (route.request().url().includes("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "Editor QA", email: "qa@example.test", emailVerified: true, admin: true } } });
    if (route.request().method() !== "GET") writes.push(route.request().method());
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  await page.goto("/admin/word-sets");
  const input = page.getByLabel("Mã ổn định");
  await input.fill("unsaved-qa");
  const link = page.getByRole("link", { name: "← Quản trị học liệu", exact: true });
  await link.click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận thao tác" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Hủy", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Rời trang", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Hủy", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(link).toBeFocused();
  await expect(input).toHaveValue("unsaved-qa");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await link.click();
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(el => el.getBoundingClientRect().right <= innerWidth && el.getBoundingClientRect().left >= 0)).toBe(true);
    await page.screenshot({ path: `documentation/features/design-system/assets/confirmation-${width}.png` });
    await dialog.getByRole("button", { name: "Hủy", exact: true }).click();
  }
  expect(writes).toEqual([]);
  await link.click();
  await dialog.getByRole("button", { name: "Rời trang", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("async editor selection preserves unsaved input on cancel and changes only after confirmation", async ({ page }) => {
  const rows = [1, 2].map(n => ({ key: `confirm-${n}`, revision: 1, editVersion: 1, status: "draft", content: { ...knowledgeSeed[0].content, title: `Confirm ${n}` } }));
  await page.route("**/api/**", route => {
    if (route.request().url().includes("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "Editor QA", email: "qa@example.test", emailVerified: true, admin: true } } });
    return route.fulfill({ json: { items: rows, total: 2 } });
  });
  await page.goto("/admin/knowledge");
  const desk = page.getByRole("region", { name: "Kho học liệu biên tập" });
  await desk.getByRole("button", { name: "Mở biên tập", exact: true }).first().click();
  const title = page.getByLabel("Tiêu đề", { exact: true });
  await title.fill("Unsaved title");
  await desk.getByRole("button", { name: "Mở biên tập", exact: true }).nth(1).click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận thao tác" });
  await dialog.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(title).toHaveValue("Unsaved title");
  await expect(desk.getByText("Đang biên tập: Confirm 1")).toBeVisible();
  await desk.getByRole("button", { name: "Mở biên tập", exact: true }).nth(1).click();
  await dialog.getByRole("button", { name: "Bỏ thay đổi", exact: true }).click();
  await expect(title).toHaveValue("Confirm 2");
  await expect(desk.getByText("Đang biên tập: Confirm 2")).toBeVisible();
});

test("browser Back cancels a pending decision when its page unmounts", async ({ page }) => {
  await page.route("**/api/**", route => {
    if (route.request().url().includes("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "Editor QA", email: "qa@example.test", emailVerified: true, admin: true } } });
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  await page.goto("/admin");
  await page.getByRole("link", { name: "Biên soạn bộ từ & nghĩa →", exact: true }).click();
  await page.getByLabel("Mã ổn định").fill("pending-decision");
  await page.getByRole("link", { name: "← Quản trị học liệu", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Xác nhận thao tác" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("dialog", { name: "Xác nhận thao tác" })).toHaveCount(0);
});

test("reader reload and related navigation respect cancellation and preserve filter on return", async ({ page }) => {
  let reads = 0;
  const entry = { ...knowledgeSeed[0].content, key: "reader-confirm", revision: 1, title: "Reader confirmation", questions: [], relatedItems: [{ key: "next-confirm", title: "Bài tiếp" }] };
  await page.route("**/api/**", route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "QA", email: "qa@example.test", emailVerified: true } } });
    if (url.pathname === "/api/knowledge/state") {
      if (url.searchParams.has("key")) { reads++; return route.fulfill({ json: { state: { revision: 1, version: reads, bookmarked: false, read: false, note: "Cloud note", section: "" } } }); }
      return route.fulfill({ json: { items: [] } });
    }
    if (url.searchParams.has("key")) return route.fulfill({ json: { item: entry } });
    return route.fulfill({ json: { items: [] } });
  });
  await page.goto("/knowledge?q=qa&key=reader-confirm");
  const note = page.getByLabel("Ghi chú riêng");
  await note.fill("Unsaved note");
  const baselineReads = reads;
  await page.getByRole("button", { name: "Tải ghi chú mới nhất" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Hủy", exact: true }).click();
  expect(reads).toBe(baselineReads);
  await expect(note).toHaveValue("Unsaved note");
  await page.getByRole("button", { name: "Tải ghi chú mới nhất" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Tải bản mới", exact: true }).click();
  await expect(note).toHaveValue("Cloud note");
  expect(reads).toBe(baselineReads + 1);
  await note.fill("Keep me");
  await page.getByRole("link", { name: "Bài tiếp →" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(note).toHaveValue("Keep me");
  await expect(page).toHaveURL(/key=reader-confirm/);
  await page.getByRole("link", { name: "← Về thư viện" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Rời bài", exact: true }).click();
  await expect(page).toHaveURL(/\/knowledge\?q=qa$/);
});

test("speech delete needs explicit acceptance and reports API errors without hiding the recording", async ({ page }) => {
  const writes: unknown[] = [];
  const item = { id: "speech-confirm", status: "completed", transcript: "안녕하세요", reference: "", createdAt: "2026-11-02T10:00:00Z", audioRemoved: true };
  await page.route("**/api/**", route => {
    if (route.request().url().includes("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "QA", email: "qa@example.test", emailVerified: true } } });
    if (route.request().method() === "DELETE") { writes.push(route.request().postDataJSON()); return route.fulfill({ status: 503, json: { error: "Xóa tạm thời lỗi" } }); }
    return route.fulfill({ json: { capabilities: { configured: false, workerOnline: false, maxSeconds: 20, maxBytes: 3000000 }, items: [item] } });
  });
  await page.goto("/speech");
  await page.getByRole("button", { name: "Xóa bản ghi", exact: true }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await page.getByRole("dialog").getByRole("button", { name: "Hủy", exact: true }).click();
  expect(writes).toEqual([]);
  await page.getByRole("button", { name: "Xóa bản ghi", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Xóa bản ghi", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Xóa tạm thời lỗi" })).toBeVisible();
  expect(writes).toEqual([{ id: item.id }]);
  await expect(page.getByText(item.transcript)).toBeVisible();
});

test("legacy draft import cancels safely and stays disabled during the confirmed request", async ({ page }) => {
  const user = { id: "legacy-qa", name: "Legacy QA", email: "legacy@example.test", emailVerified: true, admin: false };
  const writes: unknown[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user } });
    if (url.pathname === "/api/drafts") {
      writes.push(route.request().postDataJSON());
      await gate;
      return route.fulfill({ json: { version: 1 } });
    }
    return route.fulfill({ json: { user, profile: { level: "Trung cấp", goal: "QA", minutes: 20, timezone: "Asia/Ho_Chi_Minh" }, providers: ["google"], googleEnabled: true } });
  });
  await page.goto("/profile");
  await page.evaluate(() => {
    localStorage.setItem("kr-practice-user-id", "legacy-fixture");
    localStorage.setItem("kr-practice-drafts-legacy-fixture", JSON.stringify({ "sentence-qa": "Nháp QA" }));
  });
  await page.locator("summary").filter({ hasText: "Dữ liệu trên thiết bị" }).click();
  const button = page.getByRole("button", { name: "Xác nhận nhập nháp từ máy này" });
  await button.click();
  await page.getByRole("dialog").getByRole("button", { name: "Hủy", exact: true }).click();
  expect(writes).toEqual([]);
  await button.click();
  await page.getByRole("dialog").getByRole("button", { name: "Nhập nháp", exact: true }).click();
  await expect(button).toBeDisabled();
  await expect.poll(() => writes.length).toBe(1);
  release();
  await expect(button).toBeEnabled();
  expect(writes).toEqual([{ sentenceId: "sentence-qa", text: "Nháp QA", version: 0 }]);
  await expect(page.getByRole("status").filter({ hasText: "Đã nhập 1 nháp" })).toBeVisible();
});

test("exam submission cancels without submitting then sends the existing versioned payload exactly once", async ({ page }) => {
  const writes: unknown[] = [];
  const attempt = { id: "exam-confirm", version: 3, deadline: new Date(Date.now() + 3600000).toISOString(), submitted_at: null, snapshot: { title: "Exam QA", kind: "mini", questions: [] }, answers: {}, result: null };
  await page.route("**/api/**", route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "QA", email: "qa@example.test", emailVerified: true } } });
    if (route.request().method() === "PATCH") { writes.push(route.request().postDataJSON()); return route.fulfill({ status: 503, json: { error: "Nộp bài tạm thời lỗi" } }); }
    return route.fulfill({ json: url.searchParams.has("attempt") ? attempt : { items: [], attempts: [{ id: attempt.id, submitted_at: null }] } });
  });
  await page.goto("/exams");
  await page.getByRole("button", { name: "Tiếp tục bài đang làm →" }).click();
  const submit = page.getByRole("button", { name: "Nộp bài", exact: true });
  await submit.click();
  await page.getByRole("dialog").getByRole("button", { name: "Hủy", exact: true }).click();
  expect(writes).toEqual([]);
  await submit.click();
  await page.getByRole("dialog").getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Nộp bài tạm thời lỗi")).toBeVisible();
  expect(writes).toEqual([{ id: attempt.id, version: 3, answers: {}, submit: true }]);
  await expect(submit).toBeEnabled();
});
