-- Additive: rollback application may leave these tables intact; do not drop learner data.
CREATE TABLE IF NOT EXISTS knowledge_state (
 user_id text NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
 entry_key text NOT NULL, revision integer NOT NULL CHECK(revision>0),
 bookmarked boolean NOT NULL DEFAULT false, note text NOT NULL DEFAULT '',
 section text NOT NULL DEFAULT '', read boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1 CHECK(version>0), updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,entry_key)
);
CREATE TABLE IF NOT EXISTS knowledge_attempts (
 id text PRIMARY KEY, user_id text NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
 request_id uuid NOT NULL, entry_key text NOT NULL, revision integer NOT NULL,
 answers jsonb NOT NULL, snapshot jsonb NOT NULL, result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,request_id)
);
CREATE INDEX IF NOT EXISTS knowledge_attempt_user ON knowledge_attempts(user_id,entry_key,created_at DESC);
