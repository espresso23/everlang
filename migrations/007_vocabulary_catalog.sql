-- Deploy targetless-conflict bridge before this migration; pre-bridge rollback is incompatible.
ALTER TABLE vocabulary ADD COLUMN sense_key text NOT NULL DEFAULT '',
  ADD COLUMN content_snapshot jsonb;
ALTER TABLE vocabulary DROP CONSTRAINT vocabulary_user_id_term_kind_key;
CREATE UNIQUE INDEX vocabulary_manual_identity ON vocabulary(user_id,term,kind) WHERE sense_key='';
CREATE UNIQUE INDEX vocabulary_sense_identity ON vocabulary(user_id,sense_key) WHERE sense_key<>'';
CREATE TABLE catalog_progress (
 user_id text NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
 sense_key text NOT NULL, revision integer NOT NULL,
 set_key text NOT NULL, status text NOT NULL CHECK(status IN ('learning','known','skipped','unmarked')),
 version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,sense_key)
);
CREATE TABLE catalog_preferences (
 user_id text PRIMARY KEY REFERENCES auth_user(id) ON DELETE CASCADE,
 new_per_day integer NOT NULL DEFAULT 10 CHECK(new_per_day BETWEEN 0 AND 30),
 version integer NOT NULL DEFAULT 1
);
CREATE TABLE catalog_introductions (
 user_id text NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
 sense_key text NOT NULL, counted boolean NOT NULL DEFAULT true,
 introduced_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,sense_key)
);
CREATE INDEX catalog_introductions_day ON catalog_introductions(user_id,introduced_at) WHERE counted;
