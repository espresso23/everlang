import { test, expect } from "@playwright/test";
import { knowledgeSeed } from "../../data/knowledge-seed";

test("editorial page/filter, exact-version preview, cancellation, conflicts and student reveal", async ({ page }) => {
  const writes: unknown[] = [];
  const queries: URL[] = [];
  const row = { key: "editorial-qa", revision: 2, editVersion: 4, status: "reviewed", content: { ...knowledgeSeed[0].content, title: "Editorial QA" } };
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/auth/")) return route.fulfill({ json: { csrfToken: "qa", accessToken: "qa", user: { id: "qa", name: "Editor QA", email: "qa@example.test", emailVerified: true, admin: true } } });
    if (url.pathname === "/api/admin/knowledge") {
      if (route.request().method() === "PATCH") { writes.push(route.request().postDataJSON()); return route.fulfill({ status: 409, json: { error: "Phiên bản đã đổi" } }); }
      queries.push(url);
      return route.fulfill({ json: { items: [row], total: 205, limit: 25, offset: Number(url.searchParams.get("offset") || 0) } });
    }
    return route.fulfill({ json: { items: [] } });
  });
  await page.goto("/admin/knowledge");
  const desk = page.getByRole("region", { name: "Kho học liệu biên tập" });
  await expect(desk.getByText("1–1 / 205 phiên bản")).toBeVisible();
  await desk.getByRole("button", { name: "Trang sau", exact: true }).click();
  await expect.poll(() => queries.some(q => q.searchParams.get("offset") === "25")).toBe(true);
  await desk.getByLabel("Tìm học liệu", { exact: true }).fill("느라고");
  await expect.poll(() => queries.some(q => q.searchParams.get("q") === "느라고" && q.searchParams.get("offset") === "0")).toBe(true);
  await expect(page).toHaveURL(/q=/);
  await desk.getByRole("button", { name: "Preview & xuất bản", exact: true }).click();
  const preview = page.getByRole("dialog");
  await expect(preview.getByText("v2", { exact: false }).first()).toBeVisible();
  await expect(preview.getByText("Đáp án:", { exact: false })).toHaveCount(0);
  await preview.getByLabel(row.content.questions[0].answers[0], { exact: true }).check();
  await preview.getByRole("button", { name: "Kiểm tra thử · không lưu" }).click();
  await expect(preview.getByText("Đáp án: " + row.content.questions[0].answers.join(" / "), { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await preview.screenshot({ path: "documentation/features/content-authoring/assets/editorial-student-preview.png" });
  await preview.getByRole("button", { name: "Hủy · giữ nguyên trạng thái" }).click();
  expect(writes).toHaveLength(0);
  await desk.getByRole("button", { name: "Preview & xuất bản", exact: true }).click();
  await preview.getByRole("button", { name: "Xác nhận xuất bản bản này" }).click();
  await expect(preview.getByRole("alert")).toContainText("Phiên bản đã đổi");
  expect(writes).toEqual([{ key: row.key, revision: 2, editVersion: 4, action: "publish" }]);
  await preview.getByRole("button", { name: "Đóng preview" }).click();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `documentation/features/content-authoring/assets/editorial-${width}.png`, fullPage: true });
  }
});

test("set preview fetches the pinned revision, and sentence answers require reveal", async ({ page }) => {
  const lookedUp: string[] = [];
  const set = { key: "set-qa", revision: 3, editVersion: 7, status: "reviewed", content: { kind: "set", title: "Bộ QA", summary: "Pinned content", source: "QA", rights: "QA", senses: [{ key: "sense-qa", revision: 2 }] } };
  const sentence = { _id: "000000000000000000000001", contentVersion: 2, status: "reviewed", viText: "Bài luyện QA", koSampleAnswer: "학교에 가요.", source: "QA", rights: "QA", keyGrammar: [], keyVocab: [] };
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/auth/")) return route.fulfill({ json: { accessToken: "qa", csrfToken: "qa", user: { id: "qa", name: "Editor QA", email: "qa@example.test", emailVerified: true, admin: true } } });
    if (url.pathname === "/api/admin/word-sets" && url.searchParams.has("key")) { lookedUp.push(url.search); return route.fulfill({ json: { item: set, references: [{ key: "sense-qa", revision: 2, title: "학교", meaning: "trường học" }] } }); }
    if (url.pathname === "/api/admin/word-sets") return route.fulfill({ json: { items: [set], total: 1 } });
    return route.fulfill({ json: { items: [sentence], total: 1 } });
  });
  await page.goto("/admin/word-sets");
  const desk = page.getByRole("region", { name: "Kho học liệu biên tập" });
  await desk.getByRole("button", { name: "Preview & xuất bản" }).click();
  await expect(page.getByRole("dialog").getByText("trường học", { exact: false })).toBeVisible();
  expect(lookedUp).toEqual(["?key=set-qa&revision=3"]);
  await page.getByRole("dialog").getByRole("button", { name: "Đóng preview" }).click();
  await page.goto("/admin");
  await desk.getByRole("button", { name: "Preview & xuất bản" }).click();
  await expect(page.getByRole("dialog").getByText("학교에 가요.", { exact: true })).toHaveCount(0);
  await page.getByRole("dialog").getByRole("button", { name: "Xem đáp án tham khảo" }).click();
  await expect(page.getByRole("dialog").getByText("학교에 가요.", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(desk.getByRole("button", { name: "Preview & xuất bản" })).toBeFocused();
});

test("draft bulk edits preserve partial failures and imports require dry-run", async ({ page }) => {
  const rows = [1, 2].map(n => ({ key: `draft-${n}`, revision: 1, editVersion: 1, status: "draft", content: { ...knowledgeSeed[0].content, title: `Draft ${n}` } }));
  const mutations: { key?: string }[] = [];
  await page.route("**/api/**", async route => {
    if (route.request().url().includes("/api/auth/")) return route.fulfill({ json: { csrfToken: "qa", accessToken: "qa", user: { id: "qa", name: "Editor QA", email: "qa@example.test", emailVerified: true, admin: true } } });
    if (route.request().method() === "PATCH") { const b = route.request().postDataJSON(); mutations.push(b); return route.fulfill({ status: b.key === "draft-2" ? 409 : 200, json: b.key === "draft-2" ? { error: "Có thay đổi đồng thời" } : { item: rows[0] } }); }
    if (route.request().method() === "POST") { mutations.push(route.request().postDataJSON()); return route.fulfill({ json: { item: rows[0] } }); }
    return route.fulfill({ json: { items: rows, total: 2 } });
  });
  await page.goto("/admin/knowledge");
  const desk = page.getByRole("region", { name: "Kho học liệu biên tập" });
  await desk.getByLabel("Chọn Draft 1", { exact: true }).check(); await desk.getByLabel("Chọn Draft 2", { exact: true }).check();
  await desk.locator("summary").filter({ hasText: "Cập nhật nguồn" }).click();
  await desk.getByLabel("Nguồn hàng loạt").fill("Nguồn QA");
  page.once("dialog", d => d.accept());
  await desk.getByRole("button", { name: "Cập nhật nháp đã chọn" }).click();
  await expect(desk.getByText("Có thay đổi đồng thời", { exact: false })).toBeVisible();
  await expect(desk.getByLabel("Chọn Draft 1", { exact: true })).not.toBeChecked();
  await expect(desk.getByLabel("Chọn Draft 2", { exact: true })).toBeChecked();
  expect(mutations).toHaveLength(2);
  await desk.locator("summary").filter({ hasText: "Nhập nháp" }).click();
  await desk.getByLabel("JSON bản nháp").fill('[{"key":"bad","content":{}}]');
  await desk.getByRole("button", { name: "Kiểm tra trước khi nhập" }).click();
  await expect(desk.getByRole("button", { name: "Nhập 0 nháp đã kiểm tra" })).toBeDisabled();
  expect(mutations).toHaveLength(2);
  await desk.getByLabel("JSON bản nháp").fill(JSON.stringify([{ key: "import-qa", content: knowledgeSeed[0].content }]));
  await desk.getByRole("button", { name: "Kiểm tra trước khi nhập" }).click();
  page.once("dialog", d => d.accept());
  await desk.getByRole("button", { name: "Nhập 1 nháp đã kiểm tra" }).click();
  await expect(desk.getByText("Đã tạo nháp", { exact: false })).toBeVisible();
  expect(mutations).toHaveLength(3);
});
