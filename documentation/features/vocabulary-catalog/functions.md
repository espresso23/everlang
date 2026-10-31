# Function contracts — implemented, audit pending

| Code + symbol/route | Contract |
|---|---|
| [catalog contract](../../../lib/vocabulary-catalog-contract.ts): catalogTopics/catalogKey/senseSchema/setSchema/catalogContentSchema/catalogPublic/catalogLearningBody | Taxonomy22 nodes/v1, ko/vocabulary/level; strict source/rights/examples, one sense per set pin; public projection no reviewer; upload learning identity/reference strict, optional attach ID+version paired. |
| [Mongo model](../../../lib/models/VocabularyCatalog.ts): VocabularyCatalog | vocabulary_catalog unique(key,revision), status/kind index; mixed content validated at server API/seed. |
| [content service](../../../lib/vocabulary-catalog.ts): getCatalog/catalogSetDetail/listCatalog/transitionCatalog | Published-only exact/latest, set pin resolution, latest-before-filter pagination30; q also searches pinned published sense term/meaning. CAS admin transitions, immutable pub/fork, review explicit. Content only accepted with edit action (no substituted content on review/publish). |
| [learning service](../../../lib/catalog-learning.ts): catalogDay/catalogLearning/saveCatalogLearning/saveCatalogPreferences | PG owner/private progress; user advisory transaction serializes new/day and prefs; profileTZ local day/DST;0–30 global preference, intro unique user/sense, attach not counted. Duplicate saves keep card/due/log/state. |
| [TTS](../../../lib/korean-audio.ts): playKorean | Hợp đồng dùng chung ở [shared/audio](../../shared/audio.md), không phải audio đã duyệt hoặc điểm phát âm. |
| [public API](../../../app/api/word-sets/route.ts): GET /api/word-sets | Verified session, bounded q/topic/level/offset; list {items,total,offset,limit,topics}, detail key/revision {set,senses}. |
| [learning API](../../../app/api/word-sets/learn/route.ts): GET/POST/PUT | GET key/revision → budget/preferences/progress/cards/legacy; POST resolves server snapshot and membership, actions save/known/skipped/reset+version; PUT newPerDay/version CAS. |
| [admin API](../../../app/api/admin/word-sets/route.ts): GET/POST/PATCH | admin role; revisions50/page, create draft, strict CAS action and human reviewConfirmed; errors preserve form input. |
| [learner](../../../app/word-sets/page.tsx): WordSets/Page | Search/filter/paginate, pinned detail and state, reveal, TTS/error, speech entry, source-revision notice, preference/learn/attach/CAS. CSS [word-sets.css](../../../app/word-sets/word-sets.css). |
| [admin](../../../app/admin/word-sets/page.tsx): blank/WordSetsAdmin | Typed sense/set editor, examples/collocations, references search published, explicit review/publish/fork, dirty select/beforeunload guard. |
| [migration007](../../../migrations/007_vocabulary_catalog.sql) | Add sense_key/snapshot, manual and catalog partial uniqueness, progress/preferences/introductions, no reset or second SRS. Bridge image mandatory for rollback. |
| [draft data](../../../data/vocabulary-drafts.ts): vocabularyDrafts / [seed CLI](../../../scripts/seed-vocabulary-catalog.ts) |30 original AI-assisted sense drafts/23 draft sets, explicit idempotent upsert insert-only incl timestamps; no auto-review/publication. |
| [unit](../../../tests/unit/vocabulary-catalog.test.ts), [integration](../../../tests/e2e/vocabulary-catalog.spec.ts) | Schemas/pins/TZ/seed identities vs actual Mongo/PG/auth/FSRS/quota/bridge/browser; test-only accounts via [shared helper](../../shared/testing.md). |

Error400invalid,401/403session/role,404unpublished/nonmember,409CAS/source pin/unique mapping,429new/day. Source snapshot is immutable provenance; user can edit personal card fields without changing canonical content. Existing manual cards are not guessed into a sense; explicit attach requires same term/kind/owner/version and retains scheduling/log/notes while bumping version. Existing catalog duplicate ignores stale state version and preserves current state rather than overwriting another tab.

Catalogue learning GET returns source_revision for existing SRS snapshots; UI warns if lesson newer. No client score/meaning/userId accepted. Post quota applies only genuinely new catalog senses; reading/known/skipped and mapping existing manual learning remain available. Changing profileTZ recomputes local-day view of introduction timestamps, not lifetime identity. Content revision does not introduce same sense again.

Admin GET có nhánh key/revision trả {item,references} cho label term/meaning/status đúng pinned version; paginated list giữ contract. Lookup public q dùng equality localField/foreignField key (index prefix được khai báo) trước kiểm pinned revision, bound maxTimeMS5s; execution-plan/large-corpus benchmark chưa verified.

Recall integration: catalogRecallContext trong contract chỉ che dịch Việt của context khớp đúng ví dụ snapshot cho đến reveal; không đoán/sửa context cá nhân. Save mới ghi contextKO, snapshot đầy đủ. Vocabulary review UI dùng helper và shared playKorean; cancellation không báo lỗi. Đây là sửa lỗi answer leakage trong flow học→SRS trước final gate.

Scoped UI/keyboard/text-spacing/dirty-link workflow: [vocabulary-catalog-ui.spec.ts](../../../tests/e2e/vocabulary-catalog-ui.spec.ts).
