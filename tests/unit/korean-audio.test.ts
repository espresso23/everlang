import { afterEach, describe, expect, it, vi } from "vitest";
import { playKorean, stopKorean } from "../../lib/korean-audio";
type FakeUtterance = {
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  lang: string;
  voice: unknown;
};
function platform(voices: { lang: string }[] = [{ lang: "ko-KR" }]) {
  const spoken: FakeUtterance[] = [];
  const synth = {
    getVoices: vi.fn(() => voices),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
  };
  vi.stubGlobal("window", { speechSynthesis: synth });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      onend = null;
      onerror = null;
      voice = null;
      lang = "";
      rate = 1;
      constructor(public text: string) {}
    },
  );
  return { synth, spoken };
}
afterEach(() => {
  stopKorean();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("shared Korean platform audio lifecycle", () => {
  it("chooses Korean voice and resolves completed playback without claiming human quality", async () => {
    const { synth, spoken } = platform([{ lang: "en-US" }, { lang: "ko" }]);
    const p = playKorean("배");
    expect(spoken[0].voice).toEqual({ lang: "ko" });
    expect(spoken[0].lang).toBe("ko-KR");
    spoken[0].onend?.();
    await p;
    expect(synth.speak).toHaveBeenCalledTimes(1);
  });
  it("settles canceled speech even when the engine emits no cancel event and old timers cannot stop new speech", async () => {
    vi.useFakeTimers();
    const { synth, spoken } = platform();
    const first = playKorean("가");
    const second = playKorean("나");
    await first;
    await vi.advanceTimersByTimeAsync(20000);
    spoken[1].onend?.();
    await second;
    const cancellations = synth.cancel.mock.calls.length;
    await vi.advanceTimersByTimeAsync(20000);
    expect(synth.cancel).toHaveBeenCalledTimes(cancellations);
    // A late callback from the canceled engine must not disturb the completed replacement.
    spoken[0].onerror?.({ error: "network" });
    expect(synth.cancel).toHaveBeenCalledTimes(cancellations);
  });
  it("reports missing Korean voice and times out stalled speech with no dangling timer", async () => {
    await expect(
      (platform([{ lang: "en-US" }]), playKorean("배")),
    ).rejects.toThrow("giọng tiếng Hàn");
    vi.useFakeTimers();
    const { synth } = platform();
    const result = playKorean("배").catch((e) => e);
    await vi.advanceTimersByTimeAsync(30000);
    expect((await result).message).toContain("chưa phản hồi");
    expect(synth.cancel).toHaveBeenCalledTimes(2);
  });
  it("does not speak after navigation cancels a pending voice lookup", async () => {
    vi.useFakeTimers();
    const { synth } = platform([]);
    const pending = playKorean("배");
    stopKorean();
    await vi.advanceTimersByTimeAsync(801);
    await pending;
    expect(synth.speak).not.toHaveBeenCalled();
    expect(synth.removeEventListener).toHaveBeenCalled();
  });
});
