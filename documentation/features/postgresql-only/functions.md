# Function map — implemented, verification ongoing

| Behavior | Code/symbol | Evidence |
|---|---|---|
| Sentence browse/search/seed/CAS; exam persistence | [content-store](../../../packages/backend/src/content-store.ts): sentences, exams, contentRow | [PG integration](../../../tests/integration/postgresql-content.ts) |
| Revision get/list/latest published/reference/CAS | same module: RevisionStore, knowledgeStore, catalogStore | PG integration + existing knowledge/catalogue E2E |
| Learner selection/search/pinned set | [knowledge](../../../packages/backend/src/knowledge.ts): getKnowledge/listKnowledge/publicKnowledge/knowledgeTitles; [catalogue](../../../packages/backend/src/vocabulary-catalog.ts): getCatalog/listCatalog/catalogSetDetail/transitionCatalog | Latest-before-search and pinned fixture; E2E |
| Mapped SQL constraints and migration | [entities](../../../packages/backend/src/content-entities.ts): contentEntities/legacyDocuments; [migrations](../../../packages/backend/src/orm-migrations.ts): PostgreSQLContent1730000000009 | Fresh/restored PG probe |
| Archive/preservation/idempotent conflict rollback | [importer](../../../packages/backend/src/content-import.ts): normalizeBson/documentHash/operationalDocument/importContentSnapshot; [CLI](../../../scripts/import-mongo-snapshot.ts) | Per-collection source/hash; rollback probe |
| Explicit legacy ownership import | [CLI](../../../scripts/import-records.ts) | [fixture](../../../tests/integration/orm-import-fixture.mjs) |

API routes remain in apps/api/src/domains: SentencesService, AdminContentService, AdminKnowledgeService, AdminWordSetsService, ExamsService, DashboardService, UserFavoritesService and TutorService consume store. Seeds never auto-publish new knowledge/catalogue. Readiness only checks PG/Redis. Backup excludes runtime Mongo; retained source artifacts stay private.
