import {
  EntitySchema,
  type ObjectLiteral,
  type EntitySchemaOptions,
} from "typeorm";

// Column names and PostgreSQL constraints intentionally match the existing database.
// Schema synchronization is disabled; metadata never rewrites learner data.
export interface AuthIdentitiesEntity {
  id: string;
  account_id: string;
  provider_id: string;
  user_id: string;
  password: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthOneTimeTokensEntity {
  token_hash: string;
  user_id: string | null;
  purpose: string;
  payload: Record<string, unknown> | unknown[];
  expires_at: Date;
}

export interface AuthRefreshSessionsEntity {
  id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
}

export interface AuthRefreshTokensEntity {
  token_hash: string;
  session_id: string;
  created_at: Date;
  used_at: Date | null;
}

export interface CatalogIntroductionsEntity {
  user_id: string;
  sense_key: string;
  counted: boolean;
  introduced_at: Date;
}

export interface CatalogPreferencesEntity {
  user_id: string;
  new_per_day: number;
  version: number;
}

export interface CatalogProgressEntity {
  user_id: string;
  sense_key: string;
  revision: number;
  set_key: string;
  status: string;
  version: number;
  updated_at: Date;
}

export interface DailyPlansEntity {
  user_id: string;
  day: string;
  timezone: string;
  tasks: Record<string, unknown> | unknown[];
  version: number;
  completed: boolean;
}

export interface DraftsEntity {
  user_id: string;
  sentence_id: string;
  text: string;
  version: number;
  updated_at: Date;
}

export interface ExamAttemptsEntity {
  id: string;
  user_id: string;
  exam_id: string;
  snapshot: Record<string, unknown> | unknown[];
  answers: Record<string, unknown> | unknown[];
  started_at: Date;
  deadline: Date;
  submitted_at: Date | null;
  result: Record<string, unknown> | unknown[] | null;
  version: number;
}

export interface FavoritesEntity {
  user_id: string;
  sentence_id: string;
  created_at: Date;
}

export interface KnowledgeAttemptsEntity {
  id: string;
  user_id: string;
  request_id: string;
  entry_key: string;
  revision: number;
  answers: Record<string, unknown> | unknown[];
  snapshot: Record<string, unknown> | unknown[];
  result: Record<string, unknown> | unknown[];
  created_at: Date;
}

export interface KnowledgeStateEntity {
  user_id: string;
  entry_key: string;
  revision: number;
  bookmarked: boolean;
  note: string;
  section: string;
  read: boolean;
  version: number;
  updated_at: Date;
}

export interface LegacyImportsEntity {
  legacy_id: string;
  user_id: string;
  imported_at: Date;
}

export interface ProfilesEntity {
  user_id: string;
  level: string;
  goal: string;
  minutes: number;
  timezone: string;
}

export interface RecordingsEntity {
  id: string;
  user_id: string;
  object_key: string;
  transcript: string | null;
  feedback: Record<string, unknown> | unknown[] | null;
  created_at: Date;
}

export interface ReviewLogsEntity {
  id: string;
  user_id: string;
  card_id: string;
  rating: number;
  log: Record<string, unknown> | unknown[];
  reviewed_at: Date;
}

export interface SchemaMigrationsEntity {
  name: string;
  applied_at: Date | null;
}

export interface SpeechAttemptsEntity {
  id: string;
  user_id: string;
  request_id: string;
  fingerprint: string;
  file_key: string;
  mime: string;
  reference: string;
  consent_at: Date;
  status: string;
  transcript: string | null;
  error: string | null;
  model: string | null;
  engine: string | null;
  elapsed_ms: number | null;
  duration_seconds: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  audio_removed: boolean;
  provider: string;
  consent_version: string;
}

export interface StudyDaysEntity {
  user_id: string;
  day: string;
}

export interface SubmissionsEntity {
  id: string;
  user_id: string;
  sentence_id: string;
  translation: string;
  snapshot: Record<string, unknown> | unknown[];
  report: Record<string, unknown> | unknown[] | null;
  status: string;
  error: string | null;
  dedup_key: string;
  model: string;
  prompt_version: string;
  rubric_version: string;
  created_at: Date;
  completed_at: Date | null;
}

export interface TutorChunksEntity {
  id: string;
  content_id: string;
  content_version: number;
  text: string;
  embedding: number[] | null;
}

export interface UsersEntity {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface VocabularyEntity {
  id: string;
  user_id: string;
  term: string;
  meaning: string;
  context: string;
  note: string;
  source_id: string | null;
  kind: string;
  suspended: boolean;
  card: Record<string, unknown> | unknown[];
  due: Date;
  version: number;
  algorithm: string;
  created_at: Date;
  sense_key: string;
  content_snapshot: Record<string, unknown> | unknown[] | null;
}

export interface RateLimitBucketEntity {
  bucket_key: string;
  count: number;
  expires_at: Date;
}
function entity<T extends ObjectLiteral>(options: EntitySchemaOptions<T>) {
  return new EntitySchema<T>(options);
}

export const Entities = {
  rate_limit_buckets: entity<RateLimitBucketEntity>({
    name: "rate_limit_buckets",
    tableName: "rate_limit_buckets",
    columns: {
      bucket_key: { type: "text", primary: true },
      count: { type: "integer", default: 0 },
      expires_at: { type: "timestamptz" },
    },
    indices: [{ name: "rate_limit_bucket_expiry", columns: ["expires_at"] }],
  }),
  auth_identities: entity<AuthIdentitiesEntity>({
    name: "auth_identities",
    tableName: "auth_identities",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "auth_account_pkey",
      },
      account_id: { type: "text", nullable: false },
      provider_id: { type: "text", nullable: false },
      user_id: { type: "text", nullable: false },
      password: { type: "text", nullable: true },
      created_at: {
        type: "timestamp",
        nullable: false,
        default: () => "now()",
      },
      updated_at: {
        type: "timestamp",
        nullable: false,
        default: () => "now()",
      },
    },
    uniques: [
      {
        name: "auth_account_provider_id_account_id_key",
        columns: ["provider_id", "account_id"],
      },
    ],
    foreignKeys: [
      {
        name: "auth_account_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "auth_identity_provider_subject",
        columns: ["provider_id", "account_id"],
        unique: true,
      },
    ],
  }),
  auth_one_time_tokens: entity<AuthOneTimeTokensEntity>({
    name: "auth_one_time_tokens",
    tableName: "auth_one_time_tokens",
    columns: {
      token_hash: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "auth_one_time_tokens_pkey",
      },
      user_id: { type: "text", nullable: true },
      purpose: { type: "text", nullable: false },
      payload: { type: "jsonb", nullable: false, default: () => "'{}'::jsonb" },
      expires_at: { type: "timestamptz", nullable: false },
    },
    checks: [
      {
        name: "auth_one_time_tokens_purpose_check",
        expression:
          "(purpose = ANY (ARRAY['verify'::text, 'reset'::text, 'google-login'::text, 'google-link'::text]))",
      },
    ],
    foreignKeys: [
      {
        name: "auth_one_time_tokens_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  auth_refresh_sessions: entity<AuthRefreshSessionsEntity>({
    name: "auth_refresh_sessions",
    tableName: "auth_refresh_sessions",
    columns: {
      id: {
        type: "uuid",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "auth_refresh_sessions_pkey",
      },
      user_id: { type: "text", nullable: false },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      expires_at: { type: "timestamptz", nullable: false },
      revoked_at: { type: "timestamptz", nullable: true },
    },
    foreignKeys: [
      {
        name: "auth_refresh_sessions_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [{ name: "auth_refresh_sessions_user", columns: ["user_id"] }],
  }),
  auth_refresh_tokens: entity<AuthRefreshTokensEntity>({
    name: "auth_refresh_tokens",
    tableName: "auth_refresh_tokens",
    columns: {
      token_hash: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "auth_refresh_tokens_pkey",
      },
      session_id: { type: "uuid", nullable: false },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      used_at: { type: "timestamptz", nullable: true },
    },
    foreignKeys: [
      {
        name: "auth_refresh_tokens_session_id_fkey",
        target: "auth_refresh_sessions",
        columnNames: ["session_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [{ name: "auth_refresh_tokens_session", columns: ["session_id"] }],
  }),
  catalog_introductions: entity<CatalogIntroductionsEntity>({
    name: "catalog_introductions",
    tableName: "catalog_introductions",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "catalog_introductions_pkey",
      },
      sense_key: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "catalog_introductions_pkey",
      },
      counted: { type: "boolean", nullable: false, default: () => "true" },
      introduced_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    foreignKeys: [
      {
        name: "catalog_introductions_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "catalog_introductions_day",
        columns: ["user_id", "introduced_at"],
        where: "counted",
      },
    ],
  }),
  catalog_preferences: entity<CatalogPreferencesEntity>({
    name: "catalog_preferences",
    tableName: "catalog_preferences",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "catalog_preferences_pkey",
      },
      new_per_day: { type: "integer", nullable: false, default: () => "10" },
      version: { type: "integer", nullable: false, default: () => "1" },
    },
    checks: [
      {
        name: "catalog_preferences_new_per_day_check",
        expression: "((new_per_day >= 0) AND (new_per_day <= 30))",
      },
    ],
    foreignKeys: [
      {
        name: "catalog_preferences_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  catalog_progress: entity<CatalogProgressEntity>({
    name: "catalog_progress",
    tableName: "catalog_progress",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "catalog_progress_pkey",
      },
      sense_key: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "catalog_progress_pkey",
      },
      revision: { type: "integer", nullable: false },
      set_key: { type: "text", nullable: false },
      status: { type: "text", nullable: false },
      version: { type: "integer", nullable: false, default: () => "1" },
      updated_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    checks: [
      {
        name: "catalog_progress_status_check",
        expression:
          "(status = ANY (ARRAY['learning'::text, 'known'::text, 'skipped'::text, 'unmarked'::text]))",
      },
    ],
    foreignKeys: [
      {
        name: "catalog_progress_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  daily_plans: entity<DailyPlansEntity>({
    name: "daily_plans",
    tableName: "daily_plans",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "daily_plans_pkey",
      },
      day: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "daily_plans_pkey",
      },
      timezone: { type: "text", nullable: false },
      tasks: { type: "jsonb", nullable: false },
      version: { type: "integer", nullable: false, default: () => "1" },
      completed: { type: "boolean", nullable: false, default: () => "false" },
    },
    foreignKeys: [
      {
        name: "daily_plans_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  drafts: entity<DraftsEntity>({
    name: "drafts",
    tableName: "drafts",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "drafts_pkey",
      },
      sentence_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "drafts_pkey",
      },
      text: { type: "text", nullable: false },
      version: { type: "integer", nullable: false, default: () => "1" },
      updated_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    foreignKeys: [
      {
        name: "drafts_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  exam_attempts: entity<ExamAttemptsEntity>({
    name: "exam_attempts",
    tableName: "exam_attempts",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "exam_attempts_pkey",
      },
      user_id: { type: "text", nullable: false },
      exam_id: { type: "text", nullable: false },
      snapshot: { type: "jsonb", nullable: false },
      answers: { type: "jsonb", nullable: false, default: () => "'{}'::jsonb" },
      started_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      deadline: { type: "timestamptz", nullable: false },
      submitted_at: { type: "timestamptz", nullable: true },
      result: { type: "jsonb", nullable: true },
      version: { type: "integer", nullable: false, default: () => "1" },
    },
    foreignKeys: [
      {
        name: "exam_attempts_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "exam_attempts_user",
        columns: ["user_id", "started_at"],
        synchronize: false,
      },
      {
        name: "one_active_exam_per_user",
        columns: ["user_id", "exam_id"],
        unique: true,
        where: "(submitted_at IS NULL)",
      },
    ],
  }),
  favorites: entity<FavoritesEntity>({
    name: "favorites",
    tableName: "favorites",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "favorites_pkey",
      },
      sentence_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "favorites_pkey",
      },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    foreignKeys: [
      {
        name: "favorites_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  knowledge_attempts: entity<KnowledgeAttemptsEntity>({
    name: "knowledge_attempts",
    tableName: "knowledge_attempts",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "knowledge_attempts_pkey",
      },
      user_id: { type: "text", nullable: false },
      request_id: { type: "uuid", nullable: false },
      entry_key: { type: "text", nullable: false },
      revision: { type: "integer", nullable: false },
      answers: { type: "jsonb", nullable: false },
      snapshot: { type: "jsonb", nullable: false },
      result: { type: "jsonb", nullable: false },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    uniques: [
      {
        name: "knowledge_attempts_user_id_request_id_key",
        columns: ["user_id", "request_id"],
      },
    ],
    foreignKeys: [
      {
        name: "knowledge_attempts_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "knowledge_attempt_user",
        columns: ["user_id", "entry_key", "created_at"],
        synchronize: false,
      },
    ],
  }),
  knowledge_state: entity<KnowledgeStateEntity>({
    name: "knowledge_state",
    tableName: "knowledge_state",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "knowledge_state_pkey",
      },
      entry_key: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "knowledge_state_pkey",
      },
      revision: { type: "integer", nullable: false },
      bookmarked: { type: "boolean", nullable: false, default: () => "false" },
      note: { type: "text", nullable: false, default: () => "''::text" },
      section: { type: "text", nullable: false, default: () => "''::text" },
      read: { type: "boolean", nullable: false, default: () => "false" },
      version: { type: "integer", nullable: false, default: () => "1" },
      updated_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    checks: [
      { name: "knowledge_state_revision_check", expression: "(revision > 0)" },
      { name: "knowledge_state_version_check", expression: "(version > 0)" },
    ],
    foreignKeys: [
      {
        name: "knowledge_state_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  legacy_imports: entity<LegacyImportsEntity>({
    name: "legacy_imports",
    tableName: "legacy_imports",
    columns: {
      legacy_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "legacy_imports_pkey",
      },
      user_id: { type: "text", nullable: false },
      imported_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    foreignKeys: [
      {
        name: "legacy_imports_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
      },
    ],
  }),
  profiles: entity<ProfilesEntity>({
    name: "profiles",
    tableName: "profiles",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "profiles_pkey",
      },
      level: {
        type: "text",
        nullable: false,
        default: () => "'Trung c\u1ea5p'::text",
      },
      goal: {
        type: "text",
        nullable: false,
        default: () => "'T\u1ef1 h\u1ecdc ti\u1ebfng H\u00e0n'::text",
      },
      minutes: { type: "integer", nullable: false, default: () => "20" },
      timezone: {
        type: "text",
        nullable: false,
        default: () => "'Asia/Ho_Chi_Minh'::text",
      },
    },
    checks: [
      {
        name: "profiles_minutes_check",
        expression: "((minutes >= 5) AND (minutes <= 120))",
      },
    ],
    foreignKeys: [
      {
        name: "profiles_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  recordings: entity<RecordingsEntity>({
    name: "recordings",
    tableName: "recordings",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "recordings_pkey",
      },
      user_id: { type: "text", nullable: false },
      object_key: { type: "text", nullable: false },
      transcript: { type: "text", nullable: true },
      feedback: { type: "jsonb", nullable: true },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    foreignKeys: [
      {
        name: "recordings_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  review_logs: entity<ReviewLogsEntity>({
    name: "review_logs",
    tableName: "review_logs",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "review_logs_pkey",
      },
      user_id: { type: "text", nullable: false },
      card_id: { type: "text", nullable: false },
      rating: { type: "integer", nullable: false },
      log: { type: "jsonb", nullable: false },
      reviewed_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
    },
    checks: [
      {
        name: "review_logs_rating_check",
        expression: "((rating >= 1) AND (rating <= 4))",
      },
    ],
    foreignKeys: [
      {
        name: "review_logs_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
      {
        name: "review_logs_card_id_fkey",
        target: "vocabulary",
        columnNames: ["card_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  schema_migrations: entity<SchemaMigrationsEntity>({
    name: "schema_migrations",
    tableName: "schema_migrations",
    columns: {
      name: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "schema_migrations_pkey",
      },
      applied_at: {
        type: "timestamptz",
        nullable: true,
        default: () => "now()",
      },
    },
  }),
  speech_attempts: entity<SpeechAttemptsEntity>({
    name: "speech_attempts",
    tableName: "speech_attempts",
    columns: {
      id: {
        type: "uuid",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "speech_attempts_pkey",
      },
      user_id: { type: "text", nullable: false },
      request_id: { type: "uuid", nullable: false },
      fingerprint: { type: "text", nullable: false },
      file_key: { type: "text", nullable: false },
      mime: { type: "text", nullable: false },
      reference: { type: "text", nullable: false, default: () => "''::text" },
      consent_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      status: { type: "text", nullable: false },
      transcript: { type: "text", nullable: true },
      error: { type: "text", nullable: true },
      model: { type: "text", nullable: true },
      engine: { type: "text", nullable: true },
      elapsed_ms: { type: "integer", nullable: true },
      duration_seconds: { type: "double precision", nullable: true },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      updated_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      deleted_at: { type: "timestamptz", nullable: true },
      audio_removed: {
        type: "boolean",
        nullable: false,
        default: () => "false",
      },
      provider: {
        type: "text",
        nullable: false,
        default: () => "'whispercpp'::text",
      },
      consent_version: {
        type: "text",
        nullable: false,
        default: () => "'speech-v1'::text",
      },
    },
    checks: [
      {
        name: "speech_attempts_status_check",
        expression:
          "(status = ANY (ARRAY['staging'::text, 'queued'::text, 'active'::text, 'completed'::text, 'failed'::text, 'deleted'::text]))",
      },
      {
        name: "speech_attempts_provider_check",
        expression:
          "(provider = ANY (ARRAY['whispercpp'::text, 'gemini'::text]))",
      },
    ],
    uniques: [
      {
        name: "speech_attempts_user_id_request_id_key",
        columns: ["user_id", "request_id"],
      },
    ],
    foreignKeys: [
      {
        name: "speech_attempts_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "speech_one_pending",
        columns: ["user_id"],
        unique: true,
        where:
          "((status = ANY (ARRAY['staging'::text, 'queued'::text, 'active'::text])) AND (deleted_at IS NULL))",
      },
      {
        name: "speech_history",
        columns: ["user_id", "created_at"],
        synchronize: false,
      },
    ],
  }),
  study_days: entity<StudyDaysEntity>({
    name: "study_days",
    tableName: "study_days",
    columns: {
      user_id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "study_days_pkey",
      },
      day: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "study_days_pkey",
      },
    },
    foreignKeys: [
      {
        name: "study_days_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
  }),
  submissions: entity<SubmissionsEntity>({
    name: "submissions",
    tableName: "submissions",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "submissions_pkey",
      },
      user_id: { type: "text", nullable: false },
      sentence_id: { type: "text", nullable: false },
      translation: { type: "text", nullable: false },
      snapshot: { type: "jsonb", nullable: false },
      report: { type: "jsonb", nullable: true },
      status: {
        type: "text",
        nullable: false,
        default: () => "'queued'::text",
      },
      error: { type: "text", nullable: true },
      dedup_key: { type: "text", nullable: false },
      model: { type: "text", nullable: false },
      prompt_version: { type: "text", nullable: false },
      rubric_version: { type: "text", nullable: false },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      completed_at: { type: "timestamptz", nullable: true },
    },
    checks: [
      {
        name: "submissions_status_check",
        expression:
          "(status = ANY (ARRAY['queued'::text, 'active'::text, 'completed'::text, 'failed'::text]))",
      },
    ],
    uniques: [{ name: "submissions_dedup_key_key", columns: ["dedup_key"] }],
    foreignKeys: [
      {
        name: "submissions_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "submissions_user_date",
        columns: ["user_id", "created_at"],
        synchronize: false,
      },
    ],
  }),
  tutor_chunks: entity<TutorChunksEntity>({
    name: "tutor_chunks",
    tableName: "tutor_chunks",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "tutor_chunks_pkey",
      },
      content_id: { type: "text", nullable: false },
      content_version: { type: "integer", nullable: false },
      text: { type: "text", nullable: false },
      embedding: { type: "vector", nullable: true, length: 1536 },
    },
  }),
  users: entity<UsersEntity>({
    name: "users",
    tableName: "users",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "auth_user_pkey",
      },
      name: { type: "text", nullable: false },
      email: { type: "text", nullable: false },
      email_verified: {
        type: "boolean",
        nullable: false,
        default: () => "false",
      },
      image: { type: "text", nullable: true },
      created_at: {
        type: "timestamp",
        nullable: false,
        default: () => "now()",
      },
      updated_at: {
        type: "timestamp",
        nullable: false,
        default: () => "now()",
      },
    },
    uniques: [{ name: "auth_user_email_key", columns: ["email"] }],
  }),
  vocabulary: entity<VocabularyEntity>({
    name: "vocabulary",
    tableName: "vocabulary",
    columns: {
      id: {
        type: "text",
        nullable: false,
        primary: true,
        primaryKeyConstraintName: "vocabulary_pkey",
      },
      user_id: { type: "text", nullable: false },
      term: { type: "text", nullable: false },
      meaning: { type: "text", nullable: false },
      context: { type: "text", nullable: false, default: () => "''::text" },
      note: { type: "text", nullable: false, default: () => "''::text" },
      source_id: { type: "text", nullable: true },
      kind: { type: "text", nullable: false, default: () => "'word'::text" },
      suspended: { type: "boolean", nullable: false, default: () => "false" },
      card: { type: "jsonb", nullable: false },
      due: { type: "timestamptz", nullable: false },
      version: { type: "integer", nullable: false, default: () => "1" },
      algorithm: { type: "text", nullable: false },
      created_at: {
        type: "timestamptz",
        nullable: false,
        default: () => "now()",
      },
      sense_key: { type: "text", nullable: false, default: () => "''::text" },
      content_snapshot: { type: "jsonb", nullable: true },
    },
    foreignKeys: [
      {
        name: "vocabulary_user_id_fkey",
        target: "users",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      },
    ],
    indices: [
      {
        name: "vocabulary_due",
        columns: ["user_id", "due"],
        where: "(NOT suspended)",
      },
      {
        name: "vocabulary_manual_identity",
        columns: ["user_id", "term", "kind"],
        unique: true,
        where: "(sense_key = ''::text)",
      },
      {
        name: "vocabulary_sense_identity",
        columns: ["user_id", "sense_key"],
        unique: true,
        where: "(sense_key <> ''::text)",
      },
    ],
  }),
} as const;

export const ormEntities = Object.values(Entities);
