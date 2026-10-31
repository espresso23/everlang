import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { knowledgeSeed } from "../../data/knowledge-seed";

test("real knowledge authoring, learner isolation, concurrency, attempts and reader", async ({
  playwright,
  request,
  browser,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_KNOWLEDGE !== "1",
    "Disposable QA accounts and candidate app with test admin required.",
  );
  test.setTimeout(180000);
  const admin = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  const learner = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  const password = randomUUID() + "Aa1!";
  async function signup(client: APIRequestContext, email: string) {
    const res = await client.post("/api/auth/sign-up/email", {
      data: {
        name: "Knowledge QA",
        email,
        password,
        callbackURL: "/knowledge",
      },
    });
    expect(res.ok(), "Disposable signup").toBe(true);
    let link = "";
    for (let i = 0; i < 25 && !link; i++) {
      const inbox = await (
        await request.get("http://localhost:8025/api/v1/messages")
      ).json();
      for (const message of inbox.messages || []) {
        if (
          !message.To?.some((to: { Address: string }) => to.Address === email)
        )
          continue;
        const detail = await (
          await request.get(
            "http://localhost:8025/api/v1/message/" + message.ID,
          )
        ).json();
        link =
          detail.Text?.match(
            /https?:\/\/[^\s]+\/api\/auth\/verify-email\?[^\s]+/,
          )?.[0] || "";
        if (link) break;
      }
      if (!link) await new Promise((resolve) => setTimeout(resolve, 200));
    }
    expect(Boolean(link), "Verification mail arrived").toBe(true);
    await client.get(link);
    const login = await client.post("/api/auth/sign-in/email", {
      data: { email, password },
    });
    expect(login.ok(), "Verified account login").toBe(true);
  }
  const key = "qa-knowledge-" + randomUUID();
  const content = structuredClone(knowledgeSeed[0].content);
  content.title = "-느라고 · QA";
  content.related = [];
  const requestId = randomUUID();
  try {
    await signup(admin, "knowledge-admin@example.test");
    await signup(learner, "knowledge-learner@example.test");
    expect(
      (
        await request.get("/api/knowledge", {
          headers: { "x-user-id": "someone" },
        })
      ).status(),
    ).toBe(401);
    expect((await learner.get("/api/admin/knowledge")).status()).toBe(403);
    const created = await admin.post("/api/admin/knowledge", {
      data: { key, content },
    });
    expect(created.status()).toBe(200);
    expect((await learner.get(`/api/knowledge?key=${key}`)).status()).toBe(404);
    const mutation = { key, revision: 1, editVersion: 1 };
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { ...mutation, action: "publish" },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { ...mutation, action: "review" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { ...mutation, action: "edit", content },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { ...mutation, editVersion: 2, action: "publish" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { ...mutation, editVersion: 3, action: "edit", content },
        })
      ).status(),
    ).toBe(400);
    const pub = await (await learner.get(`/api/knowledge?key=${key}`)).json();
    expect(pub.item.questions[0]).not.toHaveProperty("answers");
    expect(pub.item.questions[0]).not.toHaveProperty("explanation");
    const list = await (
      await learner.get("/api/knowledge?q=QA&kind=grammar")
    ).json();
    expect(list.items.some((item: { key: string }) => item.key === key)).toBe(
      true,
    );
    expect(
      (await (await learner.get("/api/knowledge?q=.*")).json()).items,
    ).toHaveLength(0);
    const state = {
      key,
      revision: 1,
      version: 0,
      bookmarked: true,
      note: "Ghi chú riêng",
      section: "attention",
      read: true,
    };
    expect(
      (
        await learner.put("/api/knowledge/state", {
          data: { ...state, user_id: "other" },
        })
      ).status(),
    ).toBe(400);
    expect(
      (await learner.put("/api/knowledge/state", { data: state })).status(),
    ).toBe(200);
    expect(
      (await learner.put("/api/knowledge/state", { data: state })).status(),
    ).toBe(409);
    expect(
      (await (await admin.get(`/api/knowledge/state?key=${key}`)).json()).state,
    ).toBeNull();
    expect(
      (
        await learner.put("/api/knowledge/state", {
          data: { ...state, version: 1, section: "not-a-section" },
        })
      ).status(),
    ).toBe(400);
    const answers = { q1: content.questions[0].answers[0] };
    const attempt = await (
      await learner.post("/api/knowledge/attempts", {
        data: { key, revision: 1, answers, requestId },
      })
    ).json();
    expect(attempt.result[0].correct).toBe(true);
    const duplicate = await (
      await learner.post("/api/knowledge/attempts", {
        data: { key, revision: 1, answers, requestId },
      })
    ).json();
    expect(duplicate.id).toBe(attempt.id);
    expect(duplicate.duplicate).toBe(true);
    expect(
      (
        await learner.post("/api/knowledge/attempts", {
          data: { key, revision: 1, answers: { q1: "different" }, requestId },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { ...mutation, editVersion: 3, action: "fork" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { key, revision: 2, editVersion: 1, action: "review" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: { key, revision: 2, editVersion: 2, action: "revise" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (await (await learner.get(`/api/knowledge?key=${key}`)).json()).item
        .revision,
    ).toBe(1);
    const idiomKey = key + "-idiom";
    const idiom = structuredClone(knowledgeSeed[5].content);
    idiom.title = "QA idiom";
    idiom.related = [key];
    expect(
      (
        await admin.post("/api/admin/knowledge", {
          data: { key: idiomKey, content: idiom },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: {
            key: idiomKey,
            revision: 1,
            editVersion: 1,
            action: "review",
          },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: {
            key: idiomKey,
            revision: 1,
            editVersion: 2,
            action: "publish",
          },
        })
      ).status(),
    ).toBe(200);
    expect(
      (await (await learner.get("/api/knowledge?q=idiom")).json()).items.some(
        (item: { key: string }) => item.key === idiomKey,
      ),
    ).toBe(true);
    expect(
      (await (await learner.get(`/api/knowledge?key=${idiomKey}`)).json()).item
        .relatedItems,
    ).toEqual([{ key, title: content.title }]);
    const brokenKey = key + "-broken";
    const broken = {
      ...structuredClone(idiom),
      title: "QA broken",
      related: [key + "-missing"],
    };
    expect(
      (
        await admin.post("/api/admin/knowledge", {
          data: { key: brokenKey, content: broken },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: {
            key: brokenKey,
            revision: 1,
            editVersion: 1,
            action: "review",
          },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.patch("/api/admin/knowledge", {
          data: {
            key: brokenKey,
            revision: 1,
            editVersion: 2,
            action: "publish",
          },
        })
      ).status(),
    ).toBe(400);
    const context = await browser.newContext({
      baseURL,
      storageState: await learner.storageState(),
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto(`/knowledge?key=${key}`);
    await expect(
      page.getByRole("heading", { name: content.title, exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Ghi chú riêng")).toHaveValue("Ghi chú riêng");
    await page.getByLabel("Ghi chú riêng").fill("Đã sửa trên trình duyệt");
    await page
      .getByRole("button", { name: "Lưu ghi chú", exact: true })
      .click();
    await expect(page.getByRole("status").last()).toContainText(
      "Đã lưu ghi chú",
    );
    await page.reload();
    await expect(page.getByLabel("Ghi chú riêng")).toHaveValue(
      "Đã sửa trên trình duyệt",
    );
    expect(
      (
        await learner.put("/api/knowledge/state", {
          data: { ...state, version: 2, note: "Đổi từ thiết bị khác" },
        })
      ).status(),
    ).toBe(200);
    await page.getByLabel("Ghi chú riêng").fill("Bản local cần giữ");
    await page
      .getByRole("button", { name: "Lưu ghi chú", exact: true })
      .click();
    await expect(page.getByRole("status").last()).toContainText(
      "thiết bị khác",
    );
    await expect(page.getByLabel("Ghi chú riêng")).toHaveValue(
      "Bản local cần giữ",
    );
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Tải ghi chú mới nhất" }).click();
    await expect(page.getByLabel("Ghi chú riêng")).toHaveValue(
      "Đổi từ thiết bị khác",
    );
    await page
      .getByLabel(content.questions[0].answers[0], { exact: true })
      .check();
    await page.getByRole("button", { name: "Kiểm tra và lưu kết quả" }).click();
    await expect(
      page.getByText("Đáp án: " + content.questions[0].answers[0], {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Lưu mẫu vào SRS" }).click();
    await expect(page.getByRole("status").last()).toContainText("Đã lưu mẫu");
    await page.getByRole("button", { name: "Lưu mẫu vào SRS" }).click();
    await expect(page.getByRole("status").last()).toContainText("lịch ôn cũ");
    await page.screenshot({
      path: "documentation/features/knowledge-library/assets/reader-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "documentation/features/knowledge-library/assets/reader-mobile.png",
      fullPage: true,
    });
    await page.goto("/knowledge?kind=idiom");
    await expect(
      page.getByRole("heading", { name: "QA idiom", exact: true }),
    ).toBeVisible();
    await page.locator("summary").click();
    await expect(
      page.getByRole("link", { name: content.title, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Đọc và luyện tập →" })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: "QA idiom", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: content.title + " →", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Ý nghĩa và cách dùng", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#usage$/);
    await page
      .getByRole("button", { name: "Ghi nhớ vị trí này" })
      .first()
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").last()).toContainText(
      "Đã chọn vị trí",
    );
    await page
      .getByRole("button", { name: "Lưu ghi chú", exact: true })
      .click();
    await expect(page.getByRole("status").last()).toContainText(
      "Đã lưu ghi chú",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addStyleTag({
      content:
        "html body main.knowledge-page * {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} html body main.knowledge-page p {margin-bottom:2em!important}",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
    const zoomContext = await browser.newContext({
      baseURL,
      storageState: await learner.storageState(),
      viewport: { width: 720, height: 500 },
      deviceScaleFactor: 2,
    });
    const zoomPage = await zoomContext.newPage();
    await zoomPage.goto(`/knowledge?key=${key}`);
    await expect(
      zoomPage.getByRole("heading", { name: content.title, exact: true }),
    ).toBeVisible();
    expect(
      await zoomPage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await zoomPage.screenshot({
      path: "documentation/features/knowledge-library/assets/reader-scale2.png",
      fullPage: true,
    });
    await zoomContext.close();
    const editorContext = await browser.newContext({
      baseURL,
      storageState: await admin.storageState(),
    });
    const editor = await editorContext.newPage();
    await editor.goto("/admin/knowledge");
    await expect(
      editor.getByRole("heading", { name: "Thư viện kiến thức", exact: true }),
    ).toBeVisible();
    await expect(
      editor.getByText("Tạo tài liệu", { exact: true }),
    ).toBeVisible();
    await editorContext.close();
  } finally {
    await admin.dispose();
    await learner.dispose();
  }
});
