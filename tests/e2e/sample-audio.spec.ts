import { expect, test } from "@playwright/test";
import fs from "node:fs";

test.beforeEach(async ({ page }) => {
  const seed = JSON.parse(fs.readFileSync("data/seed-sentences.json", "utf8"));
  const user = { id: "audio-qa", name: "Audio QA", email: "audio@example.test", emailVerified: true, image: null };
  await page.route("**/api/**", route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path === "/api/auth/refresh" ? { accessToken: "fixture-access", user, session: { id: "qa", userId: user.id, expiresAt: "2099-01-01T00:00:00Z" } }
      : path === "/api/sentences" ? { items: [{ ...seed[0], _id: "111111111111111111111111" }], total: 1, pages: 1, page: 1, limit: 50 }
      : path === "/api/drafts" ? { drafts: [] } : { items: [] } });
  });
  await page.addInitScript(() => {
    let current: SpeechSynthesisUtterance | undefined;
    let delayed = false;
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      speak(u: SpeechSynthesisUtterance) { current = u; if (!delayed) u.onstart?.({} as SpeechSynthesisEvent); },
      pause() { current?.onpause?.({} as SpeechSynthesisEvent); },
      resume() { current?.onresume?.({} as SpeechSynthesisEvent); },
      cancel() { current = undefined; },
    } });
    Object.assign(window, { audioProbe: (kind: string) => {
      if (kind === "delay") delayed = true;
      if (kind === "boundary") current?.onboundary?.({ charIndex: 5 } as SpeechSynthesisEvent);
      if (kind === "end") current?.onend?.({} as SpeechSynthesisEvent);
      if (kind === "error") current?.onerror?.({ error: "synthesis-failed" } as SpeechSynthesisErrorEvent);
      return !!current;
    } });
  });
});

test("sample player: playback, pause, end, error, cleanup and responsive layout", async ({ page }) => {
  await page.goto("/library");
  const firstSentence = page.getByRole("group", { name: "Nghe câu 1", exact: true });
  const secondSentence = page.getByRole("group", { name: "Nghe câu 2", exact: true });
  await expect(page.getByRole("group", { name: /^Nghe câu [1-3]$/ })).toHaveCount(3);
  await expect(page.locator("button").filter({ hasText: /^Nghe câu$/ })).toHaveCount(0);
  await firstSentence.getByRole("button", { name: "Nghe câu 1", exact: true }).click();
  await expect(firstSentence.getByRole("button", { name: "Tạm dừng: Nghe câu 1" })).toBeVisible();
  await secondSentence.getByRole("button", { name: "Nghe câu 2", exact: true }).click();
  await expect(firstSentence.getByRole("button", { name: "Nghe câu 1", exact: true })).toBeVisible();
  await expect(firstSentence.getByRole("progressbar")).toHaveAttribute("value", "0");
  await expect(secondSentence.getByRole("button", { name: "Tạm dừng: Nghe câu 2" })).toBeVisible();
  await page.getByRole("button", { name: "디지털 시대의 균형" }).click();
  expect(await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("active"))).toBe(false);
  await expect(firstSentence.getByRole("button", { name: "Nghe câu 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Nghe & chép chính tả", exact: true }).click();
  await page.getByRole("button", { name: "Nghe câu đầu tiên", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tạm dừng: Nghe câu đầu tiên" })).toBeVisible();
  await page.getByRole("button", { name: "Thu âm & shadowing", exact: true }).click();
  const group = page.getByRole("group", { name: "Nghe mẫu", exact: true });
  const bar = group.getByRole("progressbar");
  await expect(bar).toHaveAttribute("value", "0");
  await group.getByRole("button", { name: "Nghe mẫu", exact: true }).click();
  await expect(group.getByRole("button", { name: "Tạm dừng: Nghe mẫu" })).toBeVisible();
  await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("boundary"));
  expect(Number(await bar.getAttribute("value"))).toBeGreaterThan(0);
  await expect(group.locator(".sample-audio-time")).not.toHaveText("0:00");
  await group.getByRole("button", { name: "Tạm dừng: Nghe mẫu" }).click();
  const paused = await group.locator(".sample-audio-time").textContent();
  await page.waitForTimeout(1100);
  await expect(group.locator(".sample-audio-time")).toHaveText(paused!);
  await group.getByRole("button", { name: "Tiếp tục: Nghe mẫu" }).click();
  await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("end"));
  await expect(bar).toHaveAttribute("value", "100");
  await group.getByRole("button", { name: "Nghe mẫu", exact: true }).click();
  await expect(bar).toHaveAttribute("value", "0");
  await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("error"));
  await expect(group.getByRole("alert")).toContainText("Hãy thử lại");
  await group.getByRole("button", { name: "Nghe mẫu", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(group.getByRole("button", { name: "Tạm dừng: Nghe mẫu" })).toBeFocused();
  const dir = "documentation/features/immersive-learning/assets";
  fs.mkdirSync(dir, { recursive: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await group.screenshot({ path: `${dir}/sample-player-${width}.png` });
  }
  await page.getByRole("button", { name: "Đọc hiểu", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("active"))).toBe(false);
  await firstSentence.getByRole("button", { name: "Nghe câu 1", exact: true }).click();
  await firstSentence.getByRole("button", { name: "Tạm dừng: Nghe câu 1" }).click();
  await secondSentence.getByRole("button", { name: "Nghe câu 2", exact: true }).click();
  await expect(firstSentence.getByRole("button", { name: "Nghe câu 1", exact: true })).toBeVisible();
  await page.goto("/practice");
  await expect(page.getByRole("group", { name: "Nghe đáp án mẫu", exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Nghe đáp án mẫu", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Tạm dừng: Nghe đáp án mẫu" })).toBeVisible();
  await page.getByRole("button", { name: "Xem đáp án & ngữ pháp" }).first().click();
  const reference = page.getByRole("group", { name: "Nghe đáp án tham khảo", exact: true }).first();
  await reference.getByRole("button", { name: "Nghe đáp án tham khảo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Nghe đáp án mẫu", exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Nghe đáp án mẫu", exact: true }).first().click();
  await page.getByRole("button", { name: "Ẩn gợi ý & đáp án" }).first().click();
  expect(await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("active"))).toBe(true);
});


test("reading and dictation use play icons and fit desktop/mobile/text spacing", async ({ page }) => {
  const dir = "documentation/features/immersive-learning/assets";
  fs.mkdirSync(dir, { recursive: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/library");
    await expect(page.getByRole("group", { name: /^Nghe câu [1-3]$/ })).toHaveCount(3);
    await expect(page.locator(".sample-audio-toggle svg")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${dir}/read-players-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Nghe & chép chính tả", exact: true }).click();
    await expect(page.getByRole("button", { name: "Nghe câu đầu tiên", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${dir}/dictation-player-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Đọc hiểu", exact: true }).click();
  await page.addStyleTag({ content: "*{letter-spacing:.12em!important;word-spacing:.16em!important}p{line-height:1.5!important;margin-bottom:2em!important}" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${dir}/read-players-320-spacing.png`, fullPage: true });
});

test("loading timeout and unsupported speech keep controls usable", async ({ page }) => {
  await page.goto("/library");
  await page.clock.install();
  await page.evaluate(() => (window as unknown as { audioProbe: (s: string) => boolean }).audioProbe("delay"));
  const first = page.getByRole("group", { name: "Nghe câu 1", exact: true });
  await first.getByRole("button", { name: "Nghe câu 1", exact: true }).click();
  await expect(first.getByRole("button")).toHaveAttribute("aria-busy", "true");
  await page.clock.fastForward(11000);
  await expect(first.getByRole("alert")).toContainText("Giọng đọc chưa phản hồi");
  await expect(first.getByRole("button")).toBeEnabled();
  await page.evaluate(() => Object.defineProperty(window, "speechSynthesis", { value: undefined }));
  await first.getByRole("button").click();
  await expect(first.getByRole("alert")).toContainText("Thiết bị chưa hỗ trợ giọng đọc");
});
