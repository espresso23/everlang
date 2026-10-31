CREATE TABLE IF NOT EXISTS speech_attempts (
 id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
 request_id uuid NOT NULL, fingerprint text NOT NULL, file_key text NOT NULL,
 mime text NOT NULL, reference text NOT NULL DEFAULT '', consent_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL CHECK(status IN ('staging','queued','active','completed','failed','deleted')),
 transcript text, error text, model text, engine text, elapsed_ms integer, duration_seconds double precision,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz, audio_removed boolean NOT NULL DEFAULT false,
 UNIQUE(user_id,request_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS speech_one_pending ON speech_attempts(user_id)
 WHERE status IN ('staging','queued','active') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS speech_history ON speech_attempts(user_id,created_at DESC);
