import { afterEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  decodeSpeech,
  speechFileKey,
  speechFingerprint,
  speechBody,
  speechView,
  type SpeechRow,
} from "@everlang/backend/speech/contract";
import { speechMediaPath } from "@everlang/backend/speech/storage";
import { pcmIsQuiet } from "@everlang/backend/speech/transcribe";
import { chooseSpeechBackend } from "@everlang/backend/speech/runtime";

function wav(amplitude = 0, rate = 16000) {
  const buffer = Buffer.alloc(44 + 32000);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(32000, 40);
  for (let offset = 44; offset < buffer.length; offset += 2)
    buffer.writeInt16LE(amplitude, offset);
  return buffer;
}
afterEach(() => vi.unstubAllEnvs());
describe("private local ASR boundaries", () => {
  it("only selects the optimized backend when every required CPU flag is present", () => {
    expect(chooseSpeechBackend("flags : sse avx avx2 fma f16c")).toBe("avx2");
    expect(chooseSpeechBackend("flags : avx2 f16c")).toBe("portable");
    expect(chooseSpeechBackend("flags : avx2 fma4 f16c")).toBe("portable");
    expect(chooseSpeechBackend("")).toBe("portable");
  });
  it("requires matching file signatures and rejects malformed/oversized data", () => {
    const bytes = wav();
    expect(decodeSpeech(bytes.toString("base64"), "audio/wav").format).toBe(
      "wav",
    );
    expect(() => decodeSpeech(bytes.toString("base64"), "audio/mp4")).toThrow();
    expect(() => decodeSpeech("not audio", "audio/wav")).toThrow();
    expect(() =>
      decodeSpeech(Buffer.alloc(3000001).toString("base64"), "audio/wav"),
    ).toThrow("3MB");
  });
  it("keeps identity/path/score client fields outside the accepted upload contract", () => {
    const payload = {
      requestId: randomUUID(),
      audio: wav().toString("base64"),
      mime: "audio/wav",
      reference: "안녕하세요",
      consent: true,
      provider: "whispercpp",
      consentVersion: "speech-v2",
    };
    expect(speechBody.safeParse(payload).success).toBe(true);
    expect(
      speechBody.safeParse({
        ...payload,
        user_id: "other",
        path: "/private",
        pronunciationScore: 100,
      }).success,
    ).toBe(false);
    expect(speechBody.safeParse({ ...payload, consent: false }).success).toBe(
      false,
    );
  });
  it("namespaces server paths by account and never accepts traversal or absolute file paths", () => {
    const id = randomUUID();
    const key = speechFileKey("a", id, "wav");
    expect(speechFileKey("b", id, "wav")).not.toBe(key);
    vi.stubEnv("SPEECH_MEDIA_ROOT", path.resolve(".local/speech-unit"));
    expect(speechMediaPath(key)).toBe(path.resolve(".local/speech-unit", key));
    for (const unsafe of [
      "../recording.wav",
      "C:/Users/private.wav",
      "/etc/passwd",
      key + "/../../other",
    ])
      expect(() => speechMediaPath(unsafe)).toThrow();
  });
  it("binds idempotency to the actual bytes and chosen reference/mime", () => {
    const bytes = wav();
    expect(speechFingerprint(bytes, "audio/wav", "가요")).toBe(
      speechFingerprint(Buffer.from(bytes), "audio/wav", "가요"),
    );
    expect(speechFingerprint(bytes, "audio/wav", "가요")).not.toBe(
      speechFingerprint(bytes, "audio/wav", "와요"),
    );
    expect(speechFingerprint(bytes, "audio/wav", "가요")).not.toBe(
      speechFingerprint(wav(100), "audio/wav", "가요"),
    );
  });
  it("rejects quiet/invalid normalized PCM without pretending the energy gate recognizes speech", () => {
    expect(pcmIsQuiet(wav())).toBe(true);
    expect(pcmIsQuiet(wav(4000))).toBe(false); // Non-silent energy, not a speech-quality assertion.
    expect(() => pcmIsQuiet(wav(4000, 8000))).toThrow();
    const malformed = wav();
    malformed.writeUInt32LE(999999, 40);
    expect(() => pcmIsQuiet(malformed)).toThrow();
  });
  it("never returns storage paths, identity or a fabricated pronunciation score in a job view", () => {
    const view = speechView({
      id: randomUUID(),
      status: "failed",
      transcript: null,
      error: "Try again",
      user_id: "private",
      file_key: "private-path",
    } as SpeechRow);
    expect(view.status).toBe("failed");
    expect(view.transcript).toBeNull();
    expect(view).not.toHaveProperty("file_key");
    expect(view).not.toHaveProperty("user_id");
    expect(view).not.toHaveProperty("pronunciationScore");
  });
});
