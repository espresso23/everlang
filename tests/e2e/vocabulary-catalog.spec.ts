import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { verifiedAccount } from "./helpers/account";
import {
  CATALOG_TAXONOMY_VERSION,
  type CatalogContent,
  type CatalogRecord,
  type SenseContent,
  type SetContent,
} from "../../lib/vocabulary-catalog-contract";

test("versioned vocabulary catalog, homograph SRS, quota, legacy mapping and integrated UI", async ({
  playwright,
  request,
  browser,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_CATALOG !== "1",
    "Explicit disposable integration environment required",
  );
  test.setTimeout(240000);
  const admin = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  const learner = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  const password = randomUUID() + "aA1!";
  const base = {
    language: "ko" as const,
    skill: "vocabulary" as const,
    taxonomyVersion:
      CATALOG_TAXONOMY_VERSION as typeof CATALOG_TAXONOMY_VERSION,
    level: "Trung cấp" as const,
    topics: ["food"],
    source: "Synthetic QA original content",
    rights: "QA temporary; not real lesson publication",
  };
  const sense = (meaning: string): SenseContent => ({
    ...base,
    kind: "sense",
    term: "배",
    pos: "Danh từ",
    meaning,
    pronunciation: "",
    hanja: "",
    register: "Trung tính",
    usage: "QA only",
    collocations: [],
    examples: [
      {
        ko: meaning.includes("quả lê") ? "배를 먹어요." : "배를 타요.",
        vi: meaning.includes("quả lê") ? "Tôi ăn lê." : "Tôi đi thuyền.",
      },
    ],
  });
  async function create(key: string, content: CatalogContent) {
    const r = await admin.post("/api/admin/word-sets", {
      data: { key, content },
    });
    expect(r.status()).toBe(200);
    return (await r.json()).item as CatalogRecord;
  }
  async function action(
    item: CatalogRecord,
    action: string,
    extra: object = {},
  ) {
    return admin.patch("/api/admin/word-sets", {
      data: {
        key: item.key,
        revision: item.revision,
        editVersion: item.editVersion,
        action,
        ...extra,
      },
    });
  }
  async function publish(item: CatalogRecord) {
    const review = await action(item, "review", { reviewConfirmed: true });
    expect(review.status()).toBe(200);
    const reviewed = (await review.json()).item as CatalogRecord;
    const pub = await action(reviewed, "publish");
    expect(pub.status()).toBe(200);
    return (await pub.json()).item as CatalogRecord;
  }
  async function learning(client = admin, key = "qa-catalog-set") {
    return await (await client.get(`/api/word-sets/learn?key=${key}`)).json();
  }
  async function cards(client = admin) {
    return (await (await client.get("/api/vocabulary")).json()).items as {
      id: string;
      term: string;
      meaning: string;
      version: number;
      due: string;
      card: unknown;
      sense_key: string;
      content_snapshot: { revision: number; content: SenseContent };
    }[];
  }
  function payload(
    key: string,
    version = 0,
    setKey = "qa-catalog-set",
    setRevision = 1,
    senseRevision = 1,
  ) {
    return {
      setKey,
      setRevision,
      senseKey: key,
      senseRevision,
      action: "save",
      version,
    };
  }
  try {
    await verifiedAccount(
      admin,
      request,
      baseURL!,
      "catalogue-qa-admin@example.test",
      password,
      "/word-sets",
    );
    await verifiedAccount(
      learner,
      request,
      baseURL!,
      "catalogue-qa-learner@example.test",
      password,
      "/word-sets",
    );
    expect((await request.get("/api/word-sets")).status()).toBe(401);
    expect((await learner.get("/api/word-sets?language=en")).status()).toBe(400);
    expect((await learner.get("/api/admin/word-sets")).status()).toBe(403);
    const pear = await create("qa-catalog-pear", sense("quả lê"));
    const boat = await create("qa-catalog-boat", sense("thuyền"));
    const setContent: SetContent = {
      ...base,
      kind: "set",
      title: "qa-catalog-title-old",
      summary: "QA sense collection",
      senses: [
        { key: pear.key, revision: 1 },
        { key: boat.key, revision: 1 },
      ],
    };
    const set = await create("qa-catalog-set", setContent);
    expect(
      (await action(set, "review", { reviewConfirmed: true })).status(),
    ).toBe(400);
    expect((await action(pear, "publish")).status()).toBe(400);
    expect((await action(pear, "review")).status()).toBe(400);
    expect(
      (
        await action(pear, "review", {
          reviewConfirmed: true,
          content: pear.content,
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await admin.post("/api/admin/word-sets", {
          data: { key: pear.key, content: pear.content },
        })
      ).status(),
    ).toBe(409);
    expect((await admin.get(`/api/word-sets?key=${set.key}`)).status()).toBe(
      404,
    );
    const pearPublished = await publish(pear);
    await publish(boat);
    const setPublished = await publish(set);
    expect(
      (
        await action(pearPublished, "edit", { content: sense("edited") })
      ).status(),
    ).toBe(400);
    const set2 = await create("qa-catalog-other-set", {
      ...setContent,
      title: "qa-catalog-shared-sense",
      senses: [{ key: pear.key, revision: 1 }],
    });
    await publish(set2);
    const found = await (
      await admin.get("/api/word-sets?q=" + encodeURIComponent("quả lê"))
    ).json();
    expect(found.items.some((i: { key: string }) => i.key === set.key)).toBe(
      true,
    );
    const detail = await (
      await admin.get(`/api/word-sets?key=${set.key}`)
    ).json();
    expect(detail.senses).toHaveLength(2);
    expect(detail).toMatchObject({ language: "ko", ownership: "system" });
    expect(detail.senses[0]).not.toHaveProperty("reviewedBy");
    expect(
      (
        await admin.post("/api/word-sets/learn", {
          data: { ...payload(pear.key), meaning: "spoofed", userId: "other" },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await admin.post("/api/word-sets/learn", {
          data: payload("qa-not-member"),
        })
      ).status(),
    ).toBe(404);
    expect(
      (
        await admin.put("/api/word-sets/learn", {
          data: { newPerDay: 1, version: 0 },
        })
      ).status(),
    ).toBe(200);
    const concurrent = await Promise.all([
      admin.post("/api/word-sets/learn", { data: payload(pear.key) }),
      admin.post("/api/word-sets/learn", { data: payload(boat.key) }),
    ]);
    expect(concurrent.map((r) => r.status()).sort()).toEqual([200, 429]);
    const after = await cards();
    expect(after).toHaveLength(1);
    const first = after[0];
    const recallContext = await browser.newContext({
      baseURL,
      storageState: await admin.storageState(),
    });
    const recallPage = await recallContext.newPage();
    await recallPage.goto("/vocabulary?review=true");
    const recallPanel = recallPage.locator(".review-card");
    await expect(recallPanel).toContainText(first.term);
    await expect(recallPanel).not.toContainText(
      first.content_snapshot.content.examples[0].vi,
    );
    await recallPage.getByRole("button", { name: "Hiện nghĩa" }).click();
    await expect(recallPanel).toContainText(first.meaning);
    await expect(recallPanel).toContainText(
      first.content_snapshot.content.examples[0].vi,
    );
    await recallPage.screenshot({
      path: "documentation/features/vocabulary-catalog/assets/srs-recall.png",
      fullPage: true,
    });
    await recallContext.close();

    const otherKey = first.sense_key === pear.key ? boat.key : pear.key;
    expect((await learning()).used).toBe(1);
    expect(
      (
        await admin.post("/api/reviews", {
          data: {
            id: first.id,
            version: first.version,
            rating: 3,
            requestId: randomUUID(),
          },
        })
      ).status(),
    ).toBe(200);
    const reviewed = (await cards())[0];
    expect(
      (
        await admin.post("/api/word-sets/learn", {
          data: payload(first.sense_key, 0),
        })
      ).status(),
    ).toBe(200);
    expect((await cards())[0]).toEqual(reviewed);
    const legacy = await admin.post("/api/vocabulary", {
      data: {
        term: "배",
        meaning: "Manual prior learning",
        kind: "word",
        context: "Legacy context",
        note: "keep my note",
      },
    });
    expect(legacy.status()).toBe(200);
    const manual = (await legacy.json()).item;
    expect(
      (
        await admin.post("/api/vocabulary", {
          data: { term: "배", meaning: "duplicate manual", kind: "word" },
        })
      ).status(),
    ).toBe(200);
    expect((await cards()).filter((c) => !c.sense_key)).toHaveLength(1);
    expect(
      (
        await admin.post("/api/reviews", {
          data: {
            id: manual.id,
            version: manual.version,
            rating: 3,
            requestId: randomUUID(),
          },
        })
      ).status(),
    ).toBe(200);
    const manualReviewed = (await cards()).find((c) => c.id === manual.id)!;
    expect(
      (
        await learner.put("/api/word-sets/learn", {
          data: { newPerDay: 0, version: 0 },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await learner.post("/api/word-sets/learn", {
          data: {
            ...payload(otherKey),
            attachCardId: manual.id,
            attachVersion: manualReviewed.version,
          },
        })
      ).status(),
    ).toBe(409);
    const attach = await admin.post("/api/word-sets/learn", {
      data: {
        ...payload(otherKey),
        attachCardId: manual.id,
        attachVersion: manualReviewed.version,
      },
    });
    expect(attach.status()).toBe(200);
    const attached = (await cards()).find((c) => c.id === manual.id)!;
    expect(attached.card).toEqual(manualReviewed.card);
    expect(attached.due).toBe(manualReviewed.due);
    expect(attached.version).toBe(manualReviewed.version + 1);
    expect(attached.sense_key).toBe(otherKey);
    expect((await cards()).filter((c) => c.term === "배")).toHaveLength(2);
    expect((await learning()).used).toBe(1);
    expect(
      (
        await learner.post("/api/word-sets/learn", { data: payload(pear.key) })
      ).status(),
    ).toBe(429);
    expect(
      (
        await learner.post("/api/word-sets/learn", {
          data: { ...payload(pear.key), action: "known" },
        })
      ).status(),
    ).toBe(200);
    expect(await cards(learner)).toHaveLength(0);
    expect((await learning(learner)).progress[0].status).toBe("known");
    const current = (await learning()).progress.find(
      (p: { sense_key: string }) => p.sense_key === pear.key,
    );
    expect(
      (
        await admin.post("/api/word-sets/learn", {
          data: { ...payload(pear.key, current.version), action: "known" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await admin.post("/api/word-sets/learn", {
          data: { ...payload(pear.key, current.version), action: "reset" },
        })
      ).status(),
    ).toBe(409);
    const prefs = await learning();
    const preferenceRace = await Promise.all([
      admin.put("/api/word-sets/learn", {
        data: { newPerDay: 2, version: prefs.preferences.version },
      }),
      admin.put("/api/word-sets/learn", {
        data: { newPerDay: 3, version: prefs.preferences.version },
      }),
    ]);
    expect(preferenceRace.map((r) => r.status()).sort()).toEqual([200, 409]);
    // Published sets and saved cards retain their immutable source revision.
    const fork = await action(pearPublished, "fork");
    expect(fork.status()).toBe(200);
    const draft = (await fork.json()).item as CatalogRecord;
    const edited = await action(draft, "edit", {
      content: {
        ...sense("quả lê (giải thích cập nhật)"),
        usage: "QA revised explanation",
      },
    });
    expect(edited.status()).toBe(200);
    await publish((await edited.json()).item);
    const pinned = await (
      await admin.get(`/api/word-sets?key=${set.key}`)
    ).json();
    expect(
      pinned.senses.find((s: { key: string }) => s.key === pear.key).revision,
    ).toBe(1);
    const sharedSave = await admin.post("/api/word-sets/learn", {
      data: payload(pear.key, 0, set2.key),
    });
    expect(sharedSave.status()).toBe(200);
    expect((await sharedSave.json()).duplicate).toBe(true);
    expect(
      (await cards()).find((c) => c.sense_key === pear.key)!.content_snapshot
        .revision,
    ).toBe(1);
    const setFork = await action(setPublished, "fork");
    expect(setFork.status()).toBe(200);
    const setDraft = (await setFork.json()).item as CatalogRecord;
    const setEdited = await action(setDraft, "edit", {
      content: {
        ...setContent,
        title: "qa-catalog-title-new",
        senses: [
          { key: pear.key, revision: 2 },
          { key: boat.key, revision: 1 },
        ],
      },
    });
    expect(setEdited.status()).toBe(200);
    expect(
      (await (await admin.get("/api/word-sets?q=qa-catalog-title-new")).json())
        .items,
    ).toHaveLength(0);
    await publish((await setEdited.json()).item);
    expect(
      (await (await admin.get("/api/word-sets?q=qa-catalog-title-old")).json())
        .items,
    ).toHaveLength(0);
    expect(
      (
        await (
          await admin.get(`/api/word-sets?key=${set.key}&revision=1`)
        ).json()
      ).set.revision,
    ).toBe(1);
    const context = await browser.newContext({
      baseURL,
      storageState: await admin.storageState(),
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto("/word-sets?set=qa-catalog-set");
    await expect(
      page.getByRole("heading", { name: "qa-catalog-title-new" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Nhớ nghĩa rồi mở đáp án" }).click();
    await expect(
      page.getByRole("heading", { name: "Nghĩa đang học" }),
    ).toBeVisible();
    const beforeTabChange = await learning();
    const pearProgress = beforeTabChange.progress.find(
      (p: { sense_key: string }) => p.sense_key === pear.key,
    );
    expect(
      (
        await admin.post("/api/word-sets/learn", {
          data: {
            ...payload(pear.key, pearProgress.version, set.key, 2, 2),
            action: "reset",
          },
        })
      ).status(),
    ).toBe(200);
    await page.getByRole("button", { name: "Tôi đã biết nghĩa này" }).click();
    await expect(page.getByRole("status")).toContainText("Trạng thái đã đổi");
    await expect(
      page.getByRole("heading", { name: "Nghĩa đang học" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tải lại trạng thái" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Đã tải trạng thái mới",
    );
    await page.getByRole("button", { name: "Tôi đã biết nghĩa này" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Đã cập nhật tự đánh giá",
    );

    await expect(
      page.getByRole("button", { name: "Đã có trong SRS · giữ lịch" }),
    ).toBeVisible();
    await expect(page.getByText(/Thẻ SRS đang giữ bản v1/)).toBeVisible();
    const ttsButton = page.getByRole("button", { name: "Nghe từ · TTS" });
    await ttsButton.click();
    await expect(ttsButton).toBeEnabled({ timeout: 35000 });
    await page.screenshot({
      path: "documentation/features/vocabulary-catalog/assets/learner-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "documentation/features/vocabulary-catalog/assets/learner-mobile.png",
      fullPage: true,
    });
    await page.goto("/admin/word-sets");
    await expect(
      page.getByRole("heading", { name: "Bộ từ & nghĩa" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Bộ từ", exact: true }).click();
    await page
      .getByRole("button", { name: /qa-catalog-title-new.*qa-catalog-set.*v2/ })
      .click();
    await expect(
      page.getByRole("button", { name: "Tạo phiên bản mới" }),
    ).toBeVisible();
    await expect(page.getByText(/배 — quả lê.*Đã xuất bản/)).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: "documentation/features/vocabulary-catalog/assets/admin-desktop.png",
      fullPage: true,
    });
    await context.close();
    for (let i = 0; i < 31; i++) {
      const paged = await create(
        `qa-catalog-page-${String(i).padStart(2, "0")}`,
        {
          ...setContent,
          title: `qa-pagination ${i}`,
          senses: [{ key: pear.key, revision: 1 }],
        },
      );
      await publish(paged);
    }
    const firstPage = await (
      await admin.get(
        "/api/word-sets?q=qa-pagination&topic=food&level=" +
          encodeURIComponent("Trung cấp"),
      )
    ).json();
    const secondPage = await (
      await admin.get("/api/word-sets?q=qa-pagination&offset=30")
    ).json();
    expect(firstPage.total).toBe(31);
    expect(firstPage.items).toHaveLength(30);
    expect(secondPage.items).toHaveLength(1);
    expect(
      firstPage.items.some(
        (i: { key: string }) => i.key === secondPage.items[0].key,
      ),
    ).toBe(false);
    const pagerContext = await browser.newContext({
      baseURL,
      storageState: await admin.storageState(),
    });
    const pagerPage = await pagerContext.newPage();
    await pagerPage.goto("/word-sets");
    await pagerPage
      .getByLabel("Tìm bộ từ", { exact: true })
      .fill("qa-pagination");
    await pagerPage
      .getByRole("button", { name: "Tìm kiếm", exact: true })
      .click();
    await expect(pagerPage.locator("article.catalog-card")).toHaveCount(30);
    await pagerPage.getByRole("button", { name: "Trang sau" }).click();
    await expect(pagerPage.locator("article.catalog-card")).toHaveCount(1);
    await pagerPage
      .getByRole("combobox", { name: /^Chủ đề/ })
      .selectOption("it");
    await pagerPage
      .getByRole("button", { name: "Tìm kiếm", exact: true })
      .click();
    await expect(
      pagerPage.getByRole("heading", { name: "Chưa có bộ đã xuất bản" }),
    ).toBeVisible();
    await pagerContext.close();
    if (process.env.E2E_CATALOG_FAILURE_URL) {
      const failingURL = process.env.E2E_CATALOG_FAILURE_URL;
      const failing = await playwright.request.newContext({
        baseURL: failingURL,
        storageState: await admin.storageState(),
        extraHTTPHeaders: { Origin: failingURL },
      });
      const outageBefore = await cards();
      try {
        expect((await failing.get("/api/word-sets")).status()).toBe(500);
        expect(
          (
            await failing.post("/api/word-sets/learn", {
              data: payload(pear.key),
            })
          ).status(),
        ).toBe(500);
        expect(await cards()).toEqual(outageBefore);
        const failedContext = await browser.newContext({
          baseURL: failingURL,
          storageState: await admin.storageState(),
        });
        const failedPage = await failedContext.newPage();
        await failedPage.goto("/word-sets?set=qa-catalog-set");
        await expect(failedPage.locator("p.notice[role=alert]")).toContainText(
          "Lỗi nội bộ máy chủ",
        );
        await failedPage.goto("/admin/word-sets");
        await failedPage.getByLabel("Mã ổn định").fill("qa-catalog-outage");
        await failedPage
          .getByLabel("Từ tiếng Hàn", { exact: true })
          .fill("오류");
        await failedPage
          .getByLabel("Nghĩa Việt (chỉ một nghĩa cụ thể)")
          .fill("Lỗi QA");
        await failedPage.getByLabel("Câu tiếng Hàn 1").fill("오류가 났어요.");
        await failedPage.getByLabel("Dịch Việt 1").fill("Đã xảy ra lỗi.");
        await failedPage
          .getByLabel("Nguồn / người biên soạn")
          .fill("Synthetic QA original content");
        await failedPage.getByLabel("Quyền sử dụng / ghi công").fill("QA only");
        const failedSaveResponse = failedPage.waitForResponse(
          (r) =>
            new URL(r.url()).pathname === "/api/admin/word-sets" &&
            r.request().method() === "POST",
        );
        await failedPage
          .getByRole("button", { name: "Tạo bản nháp", exact: true })
          .click();
        expect((await failedSaveResponse).status()).toBe(500);
        expect(
          (
            await admin.get(
              "/api/admin/word-sets?key=qa-catalog-outage&revision=1",
            )
          ).status(),
        ).toBe(404);
        await expect(failedPage.getByRole("status")).toContainText(
          "Lỗi nội bộ máy chủ",
        );
        await expect(
          failedPage.getByLabel("Từ tiếng Hàn", { exact: true }),
        ).toHaveValue("오류");
        await failedPage.screenshot({
          path: "documentation/features/vocabulary-catalog/assets/service-error.png",
          fullPage: true,
        });
        await failedContext.close();
      } finally {
        await failing.dispose();
      }
    }
    if (process.env.E2E_BRIDGE_URL) {
      const bridge = await playwright.request.newContext({
        baseURL: process.env.E2E_BRIDGE_URL,
        storageState: await admin.storageState(),
        extraHTTPHeaders: { Origin: process.env.E2E_BRIDGE_URL },
      });
      try {
        for (let i = 0; i < 2; i++)
          expect(
            (
              await bridge.post("/api/vocabulary", {
                data: {
                  term: "rollback-qa",
                  meaning: "Bridge regression after007",
                  kind: "word",
                },
              })
            ).status(),
          ).toBe(200);
        const legacyList = await (await bridge.get("/api/vocabulary")).json();
        expect(
          legacyList.items.filter(
            (c: { term: string }) => c.term === "rollback-qa",
          ),
        ).toHaveLength(1);
        expect(
          legacyList.items.filter((c: { term: string }) => c.term === "배"),
        ).toHaveLength(2);
      } finally {
        await bridge.dispose();
      }
    }
  } finally {
    await admin.dispose();
    await learner.dispose();
  }
});
