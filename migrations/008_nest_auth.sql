ALTER TABLE auth_user RENAME TO users;
ALTER TABLE auth_account RENAME TO auth_identities;
DROP TABLE auth_session;
DROP TABLE auth_verification;
ALTER TABLE auth_identities DROP COLUMN access_token, DROP COLUMN refresh_token, DROP COLUMN id_token,
  DROP COLUMN access_token_expires_at, DROP COLUMN refresh_token_expires_at, DROP COLUMN scope;
CREATE UNIQUE INDEX auth_identity_provider_subject ON auth_identities(provider_id, account_id);
CREATE TABLE auth_refresh_sessions (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE INDEX auth_refresh_sessions_user ON auth_refresh_sessions(user_id);
CREATE TABLE auth_refresh_tokens (
  token_hash text PRIMARY KEY, session_id uuid NOT NULL REFERENCES auth_refresh_sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), used_at timestamptz
);
CREATE INDEX auth_refresh_tokens_session ON auth_refresh_tokens(session_id);
CREATE TABLE auth_one_time_tokens (
  token_hash text PRIMARY KEY, user_id text REFERENCES users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK(purpose IN ('verify','reset','google-login','google-link')),
  payload jsonb NOT NULL DEFAULT '{}', expires_at timestamptz NOT NULL
);
