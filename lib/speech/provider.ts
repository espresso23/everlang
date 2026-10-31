export type SpeechProvider = "whispercpp" | "gemini";
export const SPEECH_CONSENT_VERSION = "speech-v2";
export const GEMINI_SPEECH_MODEL = "gemini-3.8-flash";

export function selectedSpeechProvider(): SpeechProvider | null {
  const value = process.env.SPEECH_PROVIDER;
  return value === "whispercpp" || value === "gemini" ? value : null;
}
export function speechServiceReady() {
  const provider = selectedSpeechProvider();
  return Boolean(
    provider && (provider !== "gemini" || process.env.GEMINI_API_KEY?.trim()),
  );
}
export function heartbeatMatches(heartbeat: string | null) {
  if (!heartbeat || !speechServiceReady()) return false;
  try {
    return JSON.parse(heartbeat).provider === selectedSpeechProvider();
  } catch {
    return false;
  }
}
