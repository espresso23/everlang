"use client";
let generation = 0;
let active: { stop: () => void } | undefined;
export function stopKorean() {
  generation++;
  active?.stop();
  active = undefined;
  if (typeof window !== "undefined" && window.speechSynthesis)
    window.speechSynthesis.cancel();
}
export async function playKorean(text: string) {
  stopKorean();
  const request = generation;
  if (typeof window === "undefined" || !window.speechSynthesis)
    throw new Error(
      "Thiết bị chưa hỗ trợ giọng đọc. Bạn vẫn có thể học bằng văn bản.",
    );
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  if (!voices.length) {
    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        synth.removeEventListener("voiceschanged", done);
        resolve();
      };
      const timer = setTimeout(done, 800);
      synth.addEventListener("voiceschanged", done, { once: true });
    });
    if (request !== generation) return;
    voices = synth.getVoices();
  }
  const voice = voices.find((v) => /^ko(?:[-_]|$)/i.test(v.lang));
  if (!voice)
    throw new Error(
      "Chưa tìm thấy giọng tiếng Hàn trên thiết bị. Hãy cài giọng ko-KR; nội dung đọc vẫn khả dụng.",
    );
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = "ko-KR";
  utterance.rate = 0.88;
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const playback = { stop: () => finish() };
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (active === playback) active = undefined;
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(() => {
      finish(new Error("Giọng đọc chưa phản hồi. Hãy thử lại."));
      if (request === generation) synth.cancel();
    }, 30000);
    active = playback;
    utterance.onend = () => finish();
    utterance.onerror = (event) =>
      finish(
        event.error === "interrupted" || event.error === "canceled"
          ? undefined
          : new Error(
              "Chưa phát được giọng đọc. Bạn có thể thử lại hoặc tiếp tục đọc.",
            ),
      );
    try {
      synth.speak(utterance);
    } catch {
      finish(
        new Error(
          "Chưa phát được giọng đọc. Bạn có thể thử lại hoặc tiếp tục đọc.",
        ),
      );
    }
  });
}
