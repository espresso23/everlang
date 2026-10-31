import { expect, type APIRequestContext } from "@playwright/test";

export async function verifiedAccount(
  client: APIRequestContext,
  mail: APIRequestContext,
  baseURL: string,
  email: string,
  password: string,
  callbackURL = "/",
) {
  expect(
    (
      await client.post("/api/auth/sign-up/email", {
        data: { name: "Catalogue QA", email, password, callbackURL },
      })
    ).ok(),
  ).toBe(true);
  let link = "";
  for (let i = 0; i < 30 && !link; i++) {
    const inbox = await (
      await mail.get("http://localhost:8025/api/v1/messages")
    ).json();
    for (const message of inbox.messages || []) {
      if (!message.To?.some((to: { Address: string }) => to.Address === email))
        continue;
      const detail = await (
        await mail.get("http://localhost:8025/api/v1/message/" + message.ID)
      ).json();
      const candidate: string =
        detail.Text?.match(
          /https?:\/\/[^\s]+\/api\/auth\/verify-email\?[^\s]+/,
        )?.[0] || "";
      if (candidate && new URL(candidate).origin === new URL(baseURL).origin) {
        link = candidate;
        break;
      }
    }
    if (!link) await new Promise((resolve) => setTimeout(resolve, 200));
  }
  expect(
    Boolean(link),
    "A local verification link for this test origin is required",
  ).toBe(true);
  expect((await client.get(link)).ok()).toBe(true);
  expect(
    (
      await client.post("/api/auth/sign-in/email", {
        data: { email, password },
      })
    ).ok(),
  ).toBe(true);
}
