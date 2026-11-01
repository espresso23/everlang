export type SpeechAttemptView = {
  id: string; status: string; transcript: string | null; error: string | null;
  reference: string; createdAt: string; updatedAt?: string; elapsedMs: number | null;
  durationSeconds: number | null; provider: 'whispercpp' | 'gemini'; consentVersion: string;
  model: string | null; engine: string | null; audioRemoved: boolean;
};
