import { afterEach, expect, it, vi } from "vitest";
import type { Request } from "express";
vi.mock("@everlang/backend/redis", () => ({ redis: { get: async () => null, set: vi.fn() } }));
import { DictionaryService } from "../../apps/api/src/domains/dictionary.service";
afterEach(() => vi.unstubAllEnvs());
const viewer = { id: "qa", email: "qa@example.test", name: "QA", admin: false, emailVerified: true };
it("accepts a native Express relative URL without constructing an absolute request URL", async () => {
    vi.stubEnv("KRDICT_API_KEY", "");
    const result = await new DictionaryService().get({ url: "/api/dictionary?q=학교", originalUrl: "/api/dictionary?q=%ED%95%99%EA%B5%90" } as Request, viewer);
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ configured: false, items: [] });
});
it("invalid native dictionary query returns400 rather than500", async () => {
    const result = await new DictionaryService().get({ url: "/api/dictionary?q=abc", originalUrl: "/api/dictionary?q=abc" } as Request, viewer);
    expect(result.status).toBe(400);
});
