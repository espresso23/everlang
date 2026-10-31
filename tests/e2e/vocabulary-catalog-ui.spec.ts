import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { verifiedAccount } from "./helpers/account";
test.use({ actionTimeout: 15000 });
test("catalogue editor keyboard/mobile, successful human workflow and dirty navigation guard", async ({
  playwright,
  request,
  browser,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_CATALOG_UI !== "1",
    "Explicit disposable admin environment required",
  );
  test.setTimeout(90000);
  const api = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  try {
    await verifiedAccount(
      api,
      request,
      baseURL!,
      "catalogue-qa-admin@example.test",
      randomUUID() + "aA1!",
      "/admin/word-sets",
    );
    const context = await browser.newContext({
      baseURL,
      storageState: await api.storageState(),
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto("/admin/word-sets");
    const key = page.getByLabel("Mã ổn định");
    await key.fill("qa-catalog-ui");
    await key.press("Tab");
    await expect(
      page.getByRole("combobox", { name: /^Trình độ/ }),
    ).toBeFocused();
    await page.getByLabel("Từ tiếng Hàn", { exact: true }).fill("학습");
    await page
      .getByLabel("Nghĩa Việt (chỉ một nghĩa cụ thể)")
      .fill("việc học (QA)");
    await page.getByLabel("Câu tiếng Hàn 1").fill("학습 시간을 정했어요.");
    await page.getByLabel("Dịch Việt 1").fill("Tôi đã định thời gian học.");
    await page
      .getByLabel("Nguồn / người biên soạn")
      .fill("Synthetic QA original content");
    await page
      .getByLabel("Quyền sử dụng / ghi công")
      .fill("QA only; not production teaching material");
    await page
      .getByRole("button", { name: "Tạo bản nháp", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Xác nhận đã duyệt" }),
    ).toBeDisabled();
    await page.getByRole("checkbox", { name: /Tôi đã kiểm nghĩa/ }).check();
    await page.getByRole("button", { name: "Xác nhận đã duyệt" }).click();
    await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: /Phiên bản 1 · Đã xuất bản/ }),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 844 });
    await page.screenshot({
      path: "documentation/features/vocabulary-catalog/assets/admin-mobile.png",
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.addStyleTag({
      content:
        "p,label,button,a,input,textarea,select,small,strong { line-height:1.5 !important; letter-spacing:0.12em !important; word-spacing:0.16em !important; } p {margin-bottom:2em !important;}",
    });
    await page.screenshot({
      path: "documentation/features/vocabulary-catalog/assets/admin-text-spacing.png",
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Tạo mục mới", exact: true })
      .click();
    await key.fill("qa-catalog-discard");
    page.once("dialog", (d) => d.dismiss());
    await page
      .getByRole("link", { name: "← Quản trị học liệu", exact: true })
      .click();
    await expect(key).toHaveValue("qa-catalog-discard");
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("link", { name: "← Quản trị học liệu", exact: true })
      .click();
    await expect(page).toHaveURL(/\/admin$/);
    await context.close();
  } finally {
    await api.dispose();
  }
});
