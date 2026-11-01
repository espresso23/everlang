import { EntitySchema } from "typeorm";
export interface ContentRow {
    id: string;
    key: string | null;
    revision: number | null;
    source_id: string | null;
    status: string;
    version: number;
    document: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}
export const contentTables = ["content_sentences", "content_exams", "knowledge_entries", "vocabulary_catalog"] as const;
export type ContentTable = (typeof contentTables)[number];
export const contentEntities = Object.fromEntries(contentTables.map(name => [name, new EntitySchema<ContentRow>({
        name, tableName: name,
        columns: {
            id: { type: "text", primary: true }, key: { type: "text", nullable: true }, revision: { type: "integer", nullable: true },
            source_id: { type: "text", nullable: true }, status: { type: "text" }, version: { type: "integer" },
            document: { type: "jsonb" }, created_at: { type: "timestamptz", default: () => "now()" }, updated_at: { type: "timestamptz", default: () => "now()" },
        },
    })])) as Record<ContentTable, EntitySchema<ContentRow>>;
export const legacyDocuments = new EntitySchema<{
    collection: string;
    id: string;
    document: Record<string, unknown>;
}>({
    name: "legacy_documents", columns: { collection: { type: "text", primary: true }, id: { type: "text", primary: true }, document: { type: "jsonb" } },
});
