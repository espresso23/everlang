import { installJwtContext } from "./helpers/jwt-context";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function silentWav(seconds = 1) {
  const data = Buffer.alloc(44 + 32000 * seconds);
  data.write("RIFF", 0);
  data.writeUInt32LE(data.length - 8, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(16000, 24);
  data.writeUInt32LE(32000, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(data.length - 44, 40);
  return data;
}
test(
  process.env.E2E_SPEECH_DISABLED === "1"
    ? "disabled speech service preserves browser preview without upload"
    : process.env.E2E_SPEECH_ALLOW_FAILURE === "1"
      ? "real API availability and failure UI probe (does not certify ASR quality)"
      : "real configured ASR, private audio, retries, no-speech, duration and browser import",
  async ({ playwright, request, browser, baseURL }) => {
    test.skip(
      process.env.E2E_SPEECH !== "1",
      "Disposable accounts, speech profile and an approved local test fixture required.",
    );
    test.setTimeout(300000);
    const wav =
      process.env.E2E_KOREAN_WAV ||
      ".local/speech-fixtures/korean-sentence.wav";
    expect(
      fs.existsSync(wav),
      "Korean fixture exists; do not substitute fabricated provider output",
    ).toBe(true);
    const a = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Origin: baseURL! },
    });
    const b = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Origin: baseURL! },
    });
    const password = randomUUID() + "aA1!";
    async function signup(client: APIRequestContext, email: string) {
    installJwtContext(client,baseURL!);
      expect(
        (
          await client.post("/api/auth/sign-up/email", {
            data: {
              name: "Speech QA",
              email,
              password,
              callbackURL: "/speech",
            },
          })
        ).ok(),
      ).toBe(true);
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
      expect(Boolean(link)).toBe(true);
      await client.get(link);
      expect(
        (
          await client.post("/api/auth/sign-in/email", {
            data: { email, password },
          })
        ).ok(),
      ).toBe(true);
    }
    async function waitFor(id: string, client = a) {
      let item: Record<string, unknown> = {};
      await expect
        .poll(
          async () => {
            item = (await (await client.get(`/api/speech?id=${id}`)).json())
              .item;
            return item.status;
          },
          { timeout: 150000, intervals: [500, 1000, 2000] },
        )
        .toMatch(/completed|failed/);
      return item;
    }
    try {
      await signup(a, "speech-qa-a@example.test");
      await signup(b, "speech-qa-b@example.test");
      expect(
        (
          await request.get("/api/speech", { headers: { "x-user-id": "a" } })
        ).status(),
      ).toBe(401);
      const capabilities = (await (await a.get("/api/speech")).json())
        .capabilities;
      if (process.env.E2E_SPEECH_DISABLED === "1") {
        expect(capabilities.configured).toBe(false);
        expect(capabilities.workerOnline).toBe(false);
        expect(
          (
            await a.post("/api/speech", {
              data: {
                audio: fs.readFileSync(wav).toString("base64"),
                mime: "audio/wav",
                requestId: randomUUID(),
                reference: "학교",
                provider: "whispercpp",
                consentVersion: capabilities.consentVersion,
                consent: true,
              },
            })
          ).status(),
        ).toBe(503);
        const context = await browser.newContext({
          baseURL,
          storageState: await a.storageState(),
        });
        const page = await context.newPage();
        await page.goto("/library");
        await page.locator('a[href="/speech"]').click();
        await expect(
          page.getByText("Dịch vụ nhận dạng chưa cấu hình."),
        ).toBeVisible();
        await page
          .getByLabel("Hoặc nhập audio WAV, WebM, M4A")
          .setInputFiles(path.resolve(wav));
        await page.getByRole("checkbox").check();
        await expect(
          page.getByRole("button", { name: "Gửi nhận dạng" }),
        ).toBeDisabled();
        const player = page.getByLabel("Nghe bản thu trên thiết bị");
        await expect
          .poll(() =>
            player.evaluate((element: HTMLAudioElement) => element.duration),
          )
          .toBeGreaterThan(0);
        await page.evaluate(() => {
          const state = { calls: 0, reject: () => {} };
          Object.assign(window, { speechMicTest: state });
          navigator.mediaDevices.getUserMedia = () =>
            new Promise<MediaStream>((_, reject) => {
              state.calls++;
              state.reject = () =>
                reject(new DOMException("test-denied", "NotAllowedError"));
            });
        });
        await page.getByRole("button", { name: "Bắt đầu thu âm" }).click();
        await expect(
          page.getByRole("button", { name: "Đang mở microphone…" }),
        ).toBeDisabled();
        await page.evaluate(() => {
          const state = (
            window as unknown as {
              speechMicTest: { calls: number; reject: () => void };
            }
          ).speechMicTest;
          if (state.calls !== 1)
            throw new Error("Duplicate microphone acquisition");
          state.reject();
        });
        await expect(
          page.getByRole("button", { name: "Bắt đầu thu âm" }),
        ).toBeEnabled();
        await expect(
          page.getByLabel("Nghe bản thu trên thiết bị"),
        ).toBeVisible();
        await context.close();
        return;
      }
      expect(capabilities.configured).toBe(true);
      expect(capabilities.workerOnline).toBe(true);
      expect(capabilities.pronunciationAssessment).toBe(false);
      const payload = {
        audio: fs.readFileSync(wav).toString("base64"),
        mime: "audio/wav",
        reference: "이 문장은 말하지 않았어요",
        requestId: randomUUID(),
        consent: true,
        provider: capabilities.provider,
        consentVersion: capabilities.consentVersion,
      };
      for (const extra of [
        { consent: false },
        { user_id: "other" },
        { audio: "invalid audio" },
      ])
        expect(
          (
            await a.post("/api/speech", { data: { ...payload, ...extra } })
          ).status(),
        ).toBe(400);
      expect(
        (
          await a.post("/api/speech", {
            data: {
              ...payload,
              provider:
                capabilities.provider === "gemini" ? "whispercpp" : "gemini",
            },
          })
        ).status(),
      ).toBe(409);
      expect(
        (
          await a.post("/api/speech", {
            data: { ...payload, consentVersion: "speech-v1" },
          })
        ).status(),
      ).toBe(400);
      const [first, second] = await Promise.all([
        a.post("/api/speech", { data: payload }),
        a.post("/api/speech", { data: payload }),
      ]);
      expect(first.status()).toBe(202);
      expect(second.status()).toBe(202);
      const created = (await first.json()).item;
      expect((await second.json()).item.id).toBe(created.id);
      expect(
        (
          await a.post("/api/speech", {
            data: { ...payload, reference: "changed" },
          })
        ).status(),
      ).toBe(409);
      expect((await b.get(`/api/speech?id=${created.id}`)).status()).toBe(404);
      expect((await b.get(`/api/speech/audio?id=${created.id}`)).status()).toBe(
        404,
      );
      expect(
        (await b.delete("/api/speech", { data: { id: created.id } })).status(),
      ).toBe(404);
      const result = await waitFor(created.id);
      if (
        process.env.E2E_SPEECH_ALLOW_FAILURE === "1" &&
        result.status === "failed"
      ) {
        expect(result.transcript).toBeNull();
        expect(String(result.error).length).toBeGreaterThan(0);
        expect(result).not.toHaveProperty("pronunciationScore");
        const context = await browser.newContext({
          baseURL,
          storageState: await a.storageState(),
          viewport: { width: 1440, height: 1000 },
        });
        const page = await context.newPage();
        await page.goto("/speech");
        await expect(
          page.getByText("Nhận dạng bởi Google", { exact: false }),
        ).toBeVisible();
        await page
          .getByLabel("Hoặc nhập audio WAV, WebM, M4A")
          .setInputFiles(path.resolve(wav));
        await expect(page.getByRole("checkbox")).toHaveAccessibleName(/Google/);
        await expect(
          page.getByRole("button", { name: "Gửi nhận dạng" }),
        ).toBeDisabled();
        const player = page.getByLabel("Nghe bản ghi đã gửi").first();
        await player.evaluate((element: HTMLAudioElement) => element.load());
        await expect
          .poll(() =>
            player.evaluate((element: HTMLAudioElement) => element.duration),
          )
          .toBeGreaterThan(0);
        await player.evaluate(async (element: HTMLAudioElement) => {
          element.muted = true;
          await element.play();
        });
        await expect
          .poll(() =>
            player.evaluate((element: HTMLAudioElement) => element.currentTime),
          )
          .toBeGreaterThan(0);
        await player.evaluate((element: HTMLAudioElement) => element.pause());
        await page.screenshot({
          path: "documentation/features/self-hosted-speech/assets/api-unavailable-desktop.png",
          fullPage: true,
        });
        await page.setViewportSize({ width: 320, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: "documentation/features/self-hosted-speech/assets/api-unavailable-mobile.png",
          fullPage: true,
        });
        await context.close();
        expect(
          (
            await a.delete("/api/speech", { data: { id: created.id } })
          ).status(),
        ).toBe(200);
        console.log(
          JSON.stringify({
            probe: "API availability",
            provider: capabilities.provider,
            result: "failed",
            safeError: result.error,
            qualityVerified: false,
          }),
        );
        return;
      }
      expect(result.status, "Actual configured Korean ASR must succeed").toBe(
        "completed",
      );
      expect(String(result.transcript)).toContain("한국어");
      expect(String(result.transcript)).not.toContain("말하지 않았어요");
      expect(result.model).toBe(
        capabilities.provider === "gemini"
          ? "gemini-3.8-flash"
          : "base-multilingual",
      );
      expect(result.engine).toBe(
        capabilities.provider === "gemini"
          ? "gemini-api/generateContent-v1beta"
          : "whisper.cpp/v1.9.5",
      );
      expect(result).not.toHaveProperty("pronunciationScore");
      expect(result).not.toHaveProperty("file_key");
      const privateAudio = await a.get(`/api/speech/audio?id=${created.id}`);
      expect(privateAudio.status()).toBe(200);
      expect(privateAudio.headers()["cache-control"]).toContain("no-store");
      expect(
        Buffer.compare(await privateAudio.body(), fs.readFileSync(wav)),
      ).toBe(0);
      expect((await (await b.get("/api/speech")).json()).items).toHaveLength(0);
      const silence = await a.post("/api/speech", {
        data: {
          ...payload,
          audio: silentWav().toString("base64"),
          requestId: randomUUID(),
        },
      });
      expect(silence.status()).toBe(202);
      const quiet = await waitFor((await silence.json()).item.id);
      expect(quiet.status).toBe("failed");
      expect(quiet.transcript).toBeNull();
      expect(String(quiet.error)).toContain("im lặng");
      const long = await b.post("/api/speech", {
        data: {
          ...payload,
          audio: silentWav(21).toString("base64"),
          requestId: randomUUID(),
        },
      });
      expect(long.status()).toBe(202);
      const duration = await waitFor((await long.json()).item.id, b);
      expect(duration.status).toBe("failed");
      expect(String(duration.error)).toContain("20 giây");
      const streamFile = ".local/speech-fixtures/korean-stream.webm";
      expect(
        fs.existsSync(streamFile),
        "A real streaming WebM fixture is required",
      ).toBe(true);
      const stream = await b.post("/api/speech", {
        data: {
          ...payload,
          audio: fs.readFileSync(streamFile).toString("base64"),
          mime: "audio/webm",
          requestId: randomUUID(),
        },
      });
      expect(stream.status()).toBe(202);
      const streamId = (await stream.json()).item.id;
      const streamed = await waitFor(streamId, b);
      expect(
        streamed.status,
        "WebM without container Duration still decodes safely",
      ).toBe("completed");
      expect(String(streamed.transcript)).toContain("한국어");
      expect((await a.get(`/api/speech?id=${streamId}`)).status()).toBe(404);
      // UI uses the real uploaded private result, not a mocked provider response.
      const context = await browser.newContext({
        baseURL,
        storageState: await a.storageState(),
        viewport: { width: 1440, height: 1000 },
      });
      const page = await context.newPage();
      await page.goto("/library");
      await page.locator('a[href="/speech"]').click();
      await expect(
        page.getByRole("heading", { name: "Luyện nói với bản ghi riêng" }),
      ).toBeVisible();
      await expect(page.locator(".speech-transcript").first()).toContainText(
        "한국어",
      );
      await page
        .getByLabel("Hoặc nhập audio WAV, WebM, M4A")
        .setInputFiles(path.resolve(wav));
      await expect(
        page.getByRole("button", { name: "Gửi nhận dạng" }),
      ).toBeDisabled();
      await expect(page.getByLabel("Nghe bản thu trên thiết bị")).toBeVisible();
      const savedPlayer = page.getByLabel("Nghe bản ghi đã gửi").last();
      await savedPlayer.evaluate((element: HTMLAudioElement) => element.load());
      await expect
        .poll(() =>
          savedPlayer.evaluate((element: HTMLAudioElement) => element.duration),
        )
        .toBeGreaterThan(0);
      await savedPlayer.evaluate(async (element: HTMLAudioElement) => {
        element.muted = true;
        await element.play();
      });
      await expect
        .poll(() =>
          savedPlayer.evaluate(
            (element: HTMLAudioElement) => element.currentTime,
          ),
        )
        .toBeGreaterThan(0);
      await savedPlayer.evaluate((element: HTMLAudioElement) =>
        element.pause(),
      );
      await page.screenshot({
        path: "documentation/features/self-hosted-speech/assets/speech-desktop.png",
        fullPage: true,
      });
      await page.setViewportSize({ width: 320, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: "documentation/features/self-hosted-speech/assets/speech-mobile.png",
        fullPage: true,
      });
      await context.close();
      expect(
        (await a.delete("/api/speech", { data: { id: created.id } })).status(),
      ).toBe(200);
      expect((await a.get(`/api/speech/audio?id=${created.id}`)).status()).toBe(
        404,
      );
      expect((await a.get(`/api/speech?id=${created.id}`)).status()).toBe(404);
      expect((await a.post("/api/speech", { data: payload })).status()).toBe(
        410,
      );
      // Delete every remaining fixture through the public owner API before deleting QA accounts.
      for (const item of (await (await a.get("/api/speech")).json()).items)
        expect(
          (await a.delete("/api/speech", { data: { id: item.id } })).status(),
        ).toBe(200);
      if (process.env.E2E_SPEECH_BACKUP === "1") {
        fs.writeFileSync(
          ".local/speech-fixtures/backup-attempt-id.txt",
          streamId,
        );
        for (const item of (await (await b.get("/api/speech")).json()).items)
          if (item.id !== streamId)
            expect(
              (
                await b.delete("/api/speech", { data: { id: item.id } })
              ).status(),
            ).toBe(200);
      } else {
        for (const item of (await (await b.get("/api/speech")).json()).items)
          expect(
            (await b.delete("/api/speech", { data: { id: item.id } })).status(),
          ).toBe(200);
      }
    } finally {
      await a.dispose();
      await b.dispose();
    }
  },
);
