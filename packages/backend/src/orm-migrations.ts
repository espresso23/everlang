import { readFileSync } from "node:fs";
import path from "node:path";
import { Migration, MigrationExecutor, Table, type DataSource, type MigrationInterface, type QueryRunner, } from "typeorm";
import { Entities } from "./entities";
import { contentTables } from "./content-entities";
export const historicalFiles = [
    "001_beta.sql",
    "002_vectors.sql",
    "003_exam_concurrency.sql",
    "004_knowledge.sql",
    "005_local_speech.sql",
    "006_speech_provider.sql",
    "007_vocabulary_catalog.sql",
    "008_nest_auth.sql",
] as const;
function historical(index: number) {
    return class implements MigrationInterface {
        name = `Historical${index + 1}${1730000000000 + index}`;
        async up(runner: QueryRunner) {
            // Immutable, trusted schema bootstrap only. Never interpolate user input.
            await runner.query(readFileSync(path.join(process.cwd(), "migrations", historicalFiles[index]), "utf8"));
        }
        async down() {
            throw new Error("Historical learner-data migrations cannot be reverted destructively; restore a verified snapshot");
        }
    };
}
export const historicalMigrations = historicalFiles.map((_, index) => historical(index));
export class RateLimitFallback1730000000008 implements MigrationInterface {
    async up(runner: QueryRunner) {
        await runner.createTable(new Table({
            name: "rate_limit_buckets",
            columns: [
                { name: "bucket_key", type: "text", isPrimary: true },
                { name: "count", type: "integer", default: 0 },
                { name: "expires_at", type: "timestamptz" },
            ],
            indices: [
                { name: "rate_limit_bucket_expiry", columnNames: ["expires_at"] },
            ],
        }));
    }
    async down() {
        throw new Error("Use a forward migration to change fallback storage");
    }
}
export class PostgreSQLContent1730000000009 implements MigrationInterface {
    async up(runner: QueryRunner) {
        for (const table of contentTables) {
            await runner.query(`CREATE TABLE "${table}" (
        id text PRIMARY KEY, key text, revision integer, source_id text, status text NOT NULL,
        version integer NOT NULL CHECK(version>0), document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'),
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        CHECK(status IN ('draft','reviewed','published')), CHECK(revision IS NULL OR revision>0),
        UNIQUE(key,revision), UNIQUE(source_id)
      )`);
            await runner.query(`CREATE INDEX ON "${table}" (status,key,revision DESC)`);
            await runner.query(`CREATE INDEX ON "${table}" (updated_at DESC)`);
            await runner.query(`CREATE INDEX ON "${table}" USING gin(document jsonb_path_ops)`);
        }
        await runner.query("CREATE TABLE legacy_documents(collection text NOT NULL,id text NOT NULL,document jsonb NOT NULL,PRIMARY KEY(collection,id))");
    }
    async down() { throw new Error("Preserve migrated content; use verified snapshot and forward migration"); }
}
export const ormMigrations = [
    ...historicalMigrations,
    RateLimitFallback1730000000008,
    PostgreSQLContent1730000000009,
];
export async function migrateOrm(source: DataSource) {
    const runner = source.createQueryRunner();
    await runner.connect();
    try {
        await runner.query("SELECT pg_advisory_lock(814921)");
        const executor = new MigrationExecutor(source, runner);
        executor.transaction = "each";
        await executor.showMigrations(); // Creates TypeORM's own history table using its native schema builder.
        const completed = await executor.getExecutedMigrations();
        const expected = [
            ...historicalMigrations.map((MigrationClass) => new MigrationClass().name),
            "RateLimitFallback1730000000008",
            "PostgreSQLContent1730000000009",
        ];
        if ([...completed]
            .sort((a, b) => a.timestamp - b.timestamp)
            .some((row, index) => row.name !== expected[index]))
            throw new Error("Cannot run non-prefix or unknown ORM migration history");
        if (completed.length > 0 &&
            completed.length < historicalFiles.length &&
            (await runner.hasTable("schema_migrations"))) {
            const old = await runner.manager
                .getRepository(Entities.schema_migrations)
                .find();
            if (old.length > completed.length)
                throw new Error("ORM history is incomplete relative to historical migrations; repair history before proceeding");
        }
        if (completed.length === 0 &&
            !(await runner.hasTable("schema_migrations")) &&
            (await runner.hasTable("users")))
            throw new Error("Cannot migrate populated database without a trusted migration history");
        if (completed.length === 0 &&
            (await runner.hasTable("schema_migrations"))) {
            const old = await runner.manager
                .getRepository(Entities.schema_migrations)
                .find({ order: { name: "ASC" } });
            const names = old.map((row) => row.name);
            if (names.some((name, index) => name !== historicalFiles[index]))
                throw new Error("Cannot adopt non-prefix or unknown historical migration records");
            // On a fully migrated install, confirm the rename/token boundary before adopting history.
            if (names.length === historicalFiles.length &&
                (!(await runner.hasTable("users")) ||
                    !(await runner.hasTable("auth_refresh_sessions")) ||
                    (await runner.hasTable("auth_user"))))
                throw new Error("Historical migration history does not match the authentication schema");
            await runner.startTransaction();
            try {
                for (let index = 0; index < names.length; index++) {
                    const instance = new historicalMigrations[index]();
                    await executor.insertMigration(new Migration(undefined, 1730000000000 + index, instance.name, instance));
                }
                await runner.commitTransaction();
            }
            catch (error) {
                await runner.rollbackTransaction();
                throw error;
            }
        }
        return await executor.executePendingMigrations();
    }
    finally {
        try {
            await runner.query("SELECT pg_advisory_unlock(814921)");
        }
        finally {
            await runner.release();
        }
    }
}
