import { expect, test } from "@playwright/test";
import fs from "node:fs";

for (const initial of ["cached-failed", "worker-failed"]) {
  test(`failed grading exposes explicit retry and preserves draft: ${initial}`, async ({ page }) => {
    const seed = JSON.parse(fs.readFileSync("data/seed-sentences.json", "utf8"));
    const lesson = { ...seed[0], _id: "111111111111111111111111" };
    const user = { id: "retry-qa", name: "Retry QA", email: "retry@example.test", emailVerified: true };
    const calls: Array<{ forceRegrade: boolean; requestId: string }> = [];
    await page.route("**/api/**", route => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/api/submissions/grade") {
        calls.push(route.request().postDataJSON());
        if (calls.length === 1 && initial === "cached-failed") return route.fulfill({ status: 409, json: { code: "GRADING_PREVIOUS_FAILED", retryable: true, error: "Lượt chấm trước thất bại. Nháp được giữ nguyên." } });
        return route.fulfill({ status: 202, json: { jobId: calls.length === 1 ? "old-job" : "retry-job", status: "queued" } });
      }
      if (path === "/api/jobs") return route.fulfill({ json: { status: "failed", error: "Dịch vụ AI đang giới hạn lượt gọi. Nháp được giữ nguyên." } });
      return route.fulfill({ json: path === "/api/auth/refresh" ? { accessToken: "fixture-access", user, session: { id: "qa", userId: user.id, expiresAt: "2099-01-01T00:00:00Z" } }
        : path === "/api/profile" ? { user } : path === "/api/sentences" ? { items: [lesson], page: 1, pages: 1, total: 1, limit: 50 }
        : path === "/api/user/stats" ? { totalCompleted: 0, averageScore: 0, weakTopics: [] }
        : path === "/api/user/favorites" ? { favorites: [] }
        : path === "/api/drafts" ? { drafts: [], version: 1 } : { items: [] } });
    });
    await page.goto("/practice");
    const answer = page.getByPlaceholder("Nhập câu trả lời tiếng Hàn...").first();
    await answer.fill("한국어를 공부해요");
    await page.getByRole("button", { name: "Nộp bài & AI chấm điểm" }).first().click();
    const alert = page.getByRole("alert").filter({ has: page.getByRole("button", { name: "Chấm lại bằng AI", exact: true }) });
    await expect(alert).toContainText("Nháp được giữ nguyên");
    await expect(answer).toHaveValue("한국어를 공부해요");
    await page.waitForTimeout(300);
    expect(calls).toHaveLength(1);
    await alert.getByRole("button", { name: "Chấm lại bằng AI", exact: true }).click();
    await expect.poll(() => calls.length).toBe(2);
    expect(calls[0].forceRegrade).toBe(false);
    expect(calls[1].forceRegrade).toBe(true);
    expect(calls[1].requestId).not.toBe(calls[0].requestId);
    await expect(answer).toHaveValue("한국어를 공부해요");
    await expect(alert).toContainText("Nháp được giữ nguyên");
    if (initial === "cached-failed") {
      fs.mkdirSync("documentation/features/ai-grading/assets", { recursive: true });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: `documentation/features/ai-grading/assets/retry-failed-${width}.png`, fullPage: true });
      }
    }
  });
}
