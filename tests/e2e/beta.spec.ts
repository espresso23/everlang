import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("EverLang sign-in is responsive and no anonymous identity is accepted", async ({
  page,
  request,
}) => {
  await page.goto("/sign-in");
  await expect(
    page.getByRole("heading", { name: "Tiếp tục hành trình" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /EverLang/ })).toBeVisible();
  await expect(page.getByRole("button",{name:"Đăng nhập với Google",exact:true})).toBeVisible();
  await expect(page.getByText("Bản beta dành cho email đã được mời.")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  for (const url of [
    "/api/profile",
    "/api/user/stats",
    "/api/user/favorites",
    "/api/submissions",
    "/api/drafts",
    "/api/vocabulary",
    "/api/dashboard",
    "/api/jobs?id=other",
  ]) {
    const r = await request.get(url, {
      headers: { "x-user-id": "11111111-1111-4111-8111-111111111111" },
    });
    expect(r.status(), url).toBe(401);
  }
});

test("email verification, cloud drafts, SRS concurrency, daily plan, and isolation", async ({
  playwright,
  request,
  page,
}) => {
  test.skip(
    process.env.E2E_AUTH_TESTS !== "1",
    "Enable with disposable test accounts. No email invitation is required.",
  );
  test.setTimeout(180000);
  const password = randomUUID() + "aA1!";
  const a = await playwright.request.newContext({
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: { Origin: "http://localhost:3000" },
  });
  const b = await playwright.request.newContext({
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: { Origin: "http://localhost:3000" },
  });
  async function signup(client: typeof a, email: string) {
    const res = await client.post("/api/auth/sign-up/email", {
      data: { name: "EverLang QA", email, password, callbackURL: "/" },
    });
    expect(res.ok()).toBe(true);
    const unverified=await client.post("/api/auth/sign-in/email",{data:{email,password}});
    expect(unverified.status()).toBe(403);
    let tokenUrl = "";
    for (let i = 0; i < 20 && !tokenUrl; i++) {
      const inbox = await request.get("http://localhost:8025/api/v1/messages");
      const data = await inbox.json();
      for (const msg of data.messages || []) {
        if (
          !msg.To?.some(
            (t: { Address: string }) => t.Address.toLowerCase() === email,
          )
        )
          continue;
        const detail = await (
          await request.get("http://localhost:8025/api/v1/message/" + msg.ID)
        ).json();
        tokenUrl =
          detail.Text?.match(
            /https?:\/\/[^\s]+\/api\/auth\/verify-email\?[^\s]+/,
          )?.[0] || "";
        if (tokenUrl) break;
      }
      if (!tokenUrl) await new Promise((r) => setTimeout(r, 300));
    }
    expect(Boolean(tokenUrl)).toBe(true);
    await client.get(tokenUrl);
    let login = await client.post("/api/auth/sign-in/email", {data:{email,password}});
    if(login.status()===429){
      const seconds=Math.min(60,Math.max(11,Number(login.headers()["retry-after"])||11));
      await new Promise(resolve=>setTimeout(resolve,seconds*1000));
      login=await client.post("/api/auth/sign-in/email",{data:{email,password}});
    }
    if (!login.ok()) {
      const problem = await login.json();
      throw new Error(
        `Sign-in failed ${login.status()}: ${problem.code} ${problem.message}`,
      );
    }
  }
  await signup(a, process.env.E2E_EMAIL_A || "everlang-qa-a@example.test");
  await signup(b, process.env.E2E_EMAIL_B || "everlang-qa-b@example.test");
  const preferences = { name: "EverLang Profile QA", level: "Cao cấp", goal: "Đọc báo tiếng Hàn", minutes: 30, timezone: "Asia/Ho_Chi_Minh" };
  expect((await a.put("/api/profile", { data: preferences })).status()).toBe(200);
  const updatedProfile = await (await a.get("/api/profile")).json();
  expect(updatedProfile.user.name).toBe(preferences.name);
  expect(updatedProfile.profile.minutes).toBe(30);
  expect(updatedProfile.providers).toEqual(["credential"]);
  expect(Object.keys(updatedProfile.user).sort()).toEqual(["admin", "email", "emailVerified", "id", "image", "name"].sort());
  expect((await (await a.get("/api/auth/get-session")).json()).user.name).toBe(preferences.name);
  expect((await (await b.get("/api/profile")).json()).user.name).toBe("EverLang QA");
  for (const invalid of [{ minutes: 121 }, { timezone: "invalid/zone" }, { admin: true }, { user_id: "other" }]) {
    expect((await a.put("/api/profile", { data: { ...preferences, ...invalid } })).status()).toBe(400);
  }
  expect((await (await a.get("/api/profile")).json()).profile.minutes).toBe(30);
  const lessons = await (await a.get("/api/sentences?limit=50")).json();
  expect(lessons.total).toBeGreaterThanOrEqual(100);
  const id = lessons.items[0]._id;
  expect(
    (
      await a.put("/api/drafts", {
        data: { sentenceId: id, text: "한국어를 공부한다", version: 0 },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await a.put("/api/drafts", {
        data: { sentenceId: id, text: "stale", version: 0 },
      })
    ).status(),
  ).toBe(409);
  const bd = await (await b.get("/api/drafts")).json();
  expect(bd.drafts).toHaveLength(0);
  const cardResponse = await a.post("/api/vocabulary", {
    data: {
      term: "꾸준하다",
      meaning: "đều đặn",
      context: "꾸준히 공부한다",
      kind: "word",
    },
  });
  expect(cardResponse.ok()).toBe(true);
  const card = (await cardResponse.json()).item;
  const action = {
    id: card.id,
    rating: 3,
    version: card.version,
    requestId: randomUUID(),
  };
  const reviews = await Promise.all([
    a.post("/api/reviews", { data: action }),
    a.post("/api/reviews", { data: { ...action, requestId: randomUUID() } }),
  ]);
  expect(reviews.map((r) => r.status()).sort()).toEqual([200, 409]);
  expect(
    (
      await b.post("/api/reviews", {
        data: { ...action, requestId: randomUUID() },
      })
    ).status(),
  ).toBe(404);
  expect((await b.get("/api/jobs?id=" + randomUUID())).status()).toBe(404);
  const d1 = await (await a.get("/api/dashboard")).json();
  const d2 = await (await a.get("/api/dashboard")).json();
  expect(d1.plan).toEqual(d2.plan);
  const task = d1.plan.tasks[0];
  expect(task).toBeTruthy();
  expect(
    (
      await a.patch("/api/dashboard", {
        data: {
          day: d1.plan.day,
          version: d1.plan.version,
          taskId: task.id,
          action: "done",
        },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await a.patch("/api/dashboard", {
        data: {
          day: d1.plan.day,
          version: d1.plan.version,
          taskId: task.id,
          action: "done",
        },
      })
    ).status(),
  ).toBe(409);
  expect((await b.get("/api/admin/content")).status()).toBe(403);
  if (process.env.E2E_EXTENDED_TESTS === "1") {
    const exams = await (await a.get("/api/exams")).json();
    expect(exams.items.length).toBeGreaterThan(0);
    const start = await a.post("/api/exams", {
      data: { examId: exams.items[0].id },
    });
    expect(start.ok()).toBe(true);
    const attemptId = (await start.json()).id;
    const initial = await (
      await a.get("/api/exams?attempt=" + attemptId)
    ).json();
    expect(initial.snapshot.questions[0].answer).toBeUndefined();
    expect((await b.get("/api/exams?attempt=" + attemptId)).status()).toBe(404);
    const answer = initial.snapshot.questions[0].options[0];
    const saved = await a.patch("/api/exams", {
      data: {
        id: attemptId,
        version: initial.version,
        answers: { r1: answer },
        submit: false,
      },
    });
    expect(saved.ok()).toBe(true);
    expect(
      (
        await a.patch("/api/exams", {
          data: {
            id: attemptId,
            version: initial.version,
            answers: {},
            submit: false,
          },
        })
      ).status(),
    ).toBe(409);
    const updated = await (
      await a.get("/api/exams?attempt=" + attemptId)
    ).json();
    expect(updated.answers.r1).toBe(answer);
    expect(
      (
        await a.patch("/api/exams", {
          data: {
            id: attemptId,
            version: updated.version,
            answers: updated.answers,
            submit: true,
          },
        })
      ).ok(),
    ).toBe(true);
    const done = await (await a.get("/api/exams?attempt=" + attemptId)).json();
    expect(done.result.objectiveScore).toBe(2);
    expect(done.snapshot.questions[0].answer).toBe(answer);
    expect((await a.get("/api/recordings")).ok()).toBe(true);
    const denied = await a.put("/api/drafts", {
      headers: { Origin: "https://untrusted.example" },
      data: { sentenceId: id, text: "bad", version: 1 },
    });
    expect(denied.status()).toBe(403);
    const profile = await (await a.get("/api/profile")).json();
    if (profile.user.admin) {
      const created = await a.post("/api/admin/content", {
        data: {
          topic: "Đời sống",
          level: "TOPIK 5",
          viText: "QA kiểm thử xuất bản",
          koSampleAnswer: "꾸준히 공부한다.",
          keyGrammar: ["-다"],
          keyVocab: ["공부하다"],
          source: "EverLang QA fixture",
          rights: "Authored test fixture",
        },
      });
      expect(created.ok()).toBe(true);
      let item = (await created.json()).item;
      expect(
        (
          await a.patch("/api/admin/content", {
            data: {
              id: item._id,
              version: item.contentVersion,
              action: "publish",
            },
          })
        ).status(),
      ).toBe(400);
      item = (
        await (
          await a.patch("/api/admin/content", {
            data: {
              id: item._id,
              version: item.contentVersion,
              action: "review",
            },
          })
        ).json()
      ).item;
      item = (
        await (
          await a.patch("/api/admin/content", {
            data: {
              id: item._id,
              version: item.contentVersion,
              action: "publish",
            },
          })
        ).json()
      ).item;
      expect(item.status).toBe("published");
    }
  }
  if (process.env.E2E_AI_TESTS === "1") {
    const submit = await a.post("/api/submissions/grade", {
      data: {
        sentenceId: id,
        userTranslation: lessons.items[0].koSampleAnswer.replace(/\p{P}/gu, ""),
        requestId: randomUUID(),
      },
    });
    expect(submit.ok()).toBe(true);
    let report = await submit.json();
    const jobId = report.jobId;
    if (submit.status() === 202) {
      for (let i = 0; i < 75; i++) {
        const job = await (await a.get("/api/jobs?id=" + jobId)).json();
        if (job.status === "failed") throw new Error(job.error);
        if (job.status === "completed") {
          report = job.report;
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(report.advancedRewrites).toHaveLength(3);
    const cached = await a.post("/api/submissions/grade", {
      data: {
        sentenceId: id,
        userTranslation: lessons.items[0].koSampleAnswer,
        requestId: randomUUID(),
      },
    });
    expect(cached.status()).toBe(200);
    expect((await cached.json()).submissionId).toBe(report.submissionId);
    if (jobId)
      expect((await b.get("/api/jobs?id=" + jobId)).status()).toBe(404);
    console.info(
      "Live AI job completed; punctuation variants share a cached report.",
    );
  }
  await page.context().addCookies((await a.storageState()).cookies);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/profile");
  await expect(page.getByLabel("Tên", { exact: true })).toHaveValue(preferences.name);
  await page.getByLabel("Tên", { exact: true }).fill("EverLang Updated QA");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu." })).toBeVisible();
  await expect(page.locator("header .user-link")).toContainText("EverLang Updated QA");
  await page.reload();
  await expect(page.getByLabel("Tên", { exact: true })).toHaveValue("EverLang Updated QA");
  await expect(page.getByLabel("Mật khẩu hiện tại")).toBeVisible();
  if (process.env.E2E_DOCUMENTATION_SCREENSHOTS === "1") {
    for (const [route, feature] of [
      ["/", "daily-dashboard"], ["/profile", "user-profile"], ["/practice", "translation-practice"],
      ["/vocabulary", "vocabulary-srs"], ["/library", "immersive-learning"], ["/exams", "exam-practice"],
    ]) {
      await page.goto(route);
      await expect(page.locator("header .user-link")).toContainText("EverLang Updated QA");
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      if (route === "/profile") await expect(page.getByLabel("Tên", { exact: true })).toHaveValue("EverLang Updated QA");
      if (route === "/") await expect(page.getByRole("heading", { name: "Lịch học hôm nay" })).toBeVisible();
      if (route === "/vocabulary") await expect(page.getByText("꾸준하다", { exact: true }).first()).toBeVisible();
      if (route === "/practice") await expect(page.getByPlaceholder("Nhập câu trả lời tiếng Hàn...").first()).toBeVisible();
      if (route === "/exams") await expect(page.getByRole("button", { name: /Bắt đầu/ }).first()).toBeVisible();
      await page.screenshot({ path: `documentation/features/${feature}/assets/screen-learner-desktop.png`, fullPage: true });
    }
  }
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Lịch học hôm nay" }),
  ).toBeVisible();
  await expect(page.getByText(d1.plan.day, { exact: true })).toBeVisible();
  await page.screenshot({
    path: ".local/everlang-dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".local/everlang-dashboard-mobile.png",
    fullPage: true,
  });
  await page.goto("/practice");
  await expect(
    page.getByRole("heading", { name: "Luyện dịch tiếng Hàn" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Nhập câu trả lời tiếng Hàn...").first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const logout = await a.post("/api/auth/sign-out", { data: {} });
  expect(logout.ok()).toBe(true);
  expect((await a.get("/api/profile")).status()).toBe(401);
  const reset=await a.post('/api/auth/request-password-reset',{data:{email:process.env.E2E_EMAIL_A||'everlang-qa-a@example.test',redirectTo:'/sign-in'}});expect(reset.ok()).toBe(true);
  const inbox=await (await request.get('http://localhost:8025/api/v1/messages')).json();let resetUrl='';
  for(const m of inbox.messages||[]){if(!m.To?.some((t:{Address:string})=>t.Address===(process.env.E2E_EMAIL_A||'everlang-qa-a@example.test')))continue;const detail=await (await request.get('http://localhost:8025/api/v1/message/'+m.ID)).json();if(detail.Subject?.includes('Đặt lại')||m.Subject?.includes('Đặt lại')){resetUrl=detail.Text?.match(/https?:\/\/[^\s]+/)?.[0]||'';break;}}
  expect(Boolean(resetUrl)).toBe(true);const redirect=await a.get(resetUrl);const token=new URL(redirect.url()).searchParams.get('token');expect(Boolean(token)).toBe(true);
  const nextPassword=randomUUID()+'bB2!';expect((await a.post('/api/auth/reset-password',{data:{token,newPassword:nextPassword}})).ok()).toBe(true);
  expect((await a.post('/api/auth/sign-in/email',{data:{email:process.env.E2E_EMAIL_A||'everlang-qa-a@example.test',password:nextPassword}})).ok()).toBe(true);
  await a.dispose();
  await b.dispose();
});
