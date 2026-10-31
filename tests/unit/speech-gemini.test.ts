import { afterEach, describe, expect, it, vi } from "vitest";
import { transcribeGeminiWav } from "../../lib/speech/gemini";
import {
  heartbeatMatches,
  speechServiceReady,
} from "../../lib/speech/provider";
const budget = (value: unknown = 1) => ({
  eval: vi.fn().mockResolvedValue(value),
});
const response = (text = '{"transcript":"학교"}', finishReason = "STOP") =>
  Response.json({
    candidates: [{ finishReason, content: { parts: [{ text }] } }],
  });
afterEach(() => vi.unstubAllEnvs());
describe("Gemini free tier audio adapter", () => {
  it("requires key and matching provider heartbeat rather than claiming inference health", () => {
    vi.stubEnv("SPEECH_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(speechServiceReady()).toBe(false);
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    expect(heartbeatMatches('{"provider":"gemini"}')).toBe(true);
    expect(heartbeatMatches('{"provider":"whispercpp"}')).toBe(false);
    expect(heartbeatMatches("invalid")).toBe(false);
  });
  it("sends audio only to the fixed endpoint with header auth and no reference/user context", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    const transport = vi.fn<typeof fetch>().mockResolvedValue(response());
    const result = await transcribeGeminiWav(
      Buffer.from("test-audio"),
      budget(),
      transport,
    );
    expect(result.transcript).toBe("학교");
    const abbreviation = await transcribeGeminiWav(
      Buffer.alloc(1),
      budget(),
      vi.fn<typeof fetch>().mockResolvedValue(response('{"transcript":"AI"}')),
    );
    expect(abbreviation.transcript).toBe("AI");
    expect(result).not.toHaveProperty("score");
    const [url, init] = transport.mock.calls[0];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    );
    expect(String(url)).not.toContain("test-only");
    expect(init?.headers).toHaveProperty("x-goog-api-key", "test-only");
    const body = JSON.parse(String(init?.body));
    expect(body.contents[0].parts).toEqual([
      {
        inlineData: {
          mimeType: "audio/wav",
          data: Buffer.from("test-audio").toString("base64"),
        },
      },
    ]);
    expect(init?.redirect).toBe("error");
    expect(body.generationConfig).not.toHaveProperty("thinkingConfig");
  });
  it("fails closed before any egress on missing key, quota exhaustion or Redis failure", async () => {
    const transport = vi.fn<typeof fetch>();
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(
      transcribeGeminiWav(Buffer.alloc(1), budget(), transport),
    ).rejects.toThrow("cấu hình");
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    for (const n of [21, NaN, 0])
      await expect(
        transcribeGeminiWav(Buffer.alloc(1), budget(n), transport),
      ).rejects.toThrow("giới hạn");
    await expect(
      transcribeGeminiWav(
        Buffer.alloc(1),
        { eval: vi.fn().mockRejectedValue(new Error("private")) },
        transport,
      ),
    ).rejects.toThrow("chưa gửi audio");
    expect(transport).not.toHaveBeenCalled();
  });
  it("does not accept truncated, refused, empty or malformed provider results", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    for (const bad of [
      response("{}"),
      response('{"transcript":""}'),
      response('{"transcript":"학교"}', "MAX_TOKENS"),
      response('{"transcript":"학교","score":100}'),
      Response.json({ promptFeedback: { blockReason: "SAFETY" } }),
    ]) {
      await expect(
        transcribeGeminiWav(
          Buffer.alloc(1),
          budget(),
          vi.fn<typeof fetch>().mockResolvedValue(bad),
        ),
      ).rejects.toThrow("hợp lệ");
    }
  });
  it("redacts upstream errors, distinguishes retryable failures and never changes model on quota", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    for (const status of [400, 429, 503]) {
      const transport = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("private-key-echo", { status }));
      try {
        await transcribeGeminiWav(Buffer.alloc(1), budget(), transport);
        throw new Error("expected failure");
      } catch (e) {
        expect((e as Error).message).not.toContain("private-key-echo");
        expect(e).toHaveProperty("retryable", status >= 500);
      }
      expect(transport).toHaveBeenCalledTimes(1);
    }
    await expect(
      transcribeGeminiWav(
        Buffer.alloc(1),
        budget(),
        vi.fn<typeof fetch>().mockRejectedValue(new Error("private-key-echo")),
      ),
    ).rejects.toMatchObject({ retryable: true });
  });
});
