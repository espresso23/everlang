ALTER TABLE speech_attempts
  ADD COLUMN provider text NOT NULL DEFAULT 'whispercpp'
    CHECK (provider IN ('whispercpp','gemini')),
  ADD COLUMN consent_version text NOT NULL DEFAULT 'speech-v1';
