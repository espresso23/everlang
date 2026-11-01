import { apiFetch } from "./auth";
export async function request<T = Record<string, unknown>>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const r = await apiFetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const p = await r.json();
  if (!r.ok) throw new Error(p.error || `HTTP ${r.status}`);
  return p;
}
export function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.88;
  window.speechSynthesis.speak(u);
}
