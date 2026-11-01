# Admin learning CMS benchmark — 2026-11-01

Scope: research/source audit, not implemented redesign, not exhaustive market coverage. Skills everlang-ux-ui + everlang-ba. Repo branch changed externally during research to chore/everlang-ux-ui-skill with pre-existing edits; preserved all, no switch/reset/commit.

## Evidence ledger

All accessed2026-11-01. Official docs/public product pages only; authenticated third-party admin and actual bulk workflows NOT VERIFIED. No competitor lesson copying or live data mutation.

| Source | URL | Observed public evidence | Limit |
|---|---|---|---|
| Moodle Question banks | https://docs.moodle.org/503/en/Question_banks | Categories, status/type/date/keyword filters, columns, history/version/usage, bulk move/delete | Documentation, not hands-on admin |
| Open edX libraries | https://docs.openedx.org/en/release-verawood/educators/concepts/instructional_design/content_libraries.html | Reusable library components and collections | Documentation |
| Open edX sync | https://docs.openedx.org/en/latest/educators/how-tos/course_development/sync_a_library_update_to_your_course.html | Published update, compare old/new, accept/ignore changes | Documentation |
| Strapi Content Manager | https://docs.strapi.io/cms/features/content-manager | Search/filter/sort, configurable list columns and bulk actions | Some workflows/history are plan-dependent; not selecting a vendor |
| Directus collections | https://directus.com/docs/guides/content/explore | Filters, batch edits and saved views/bookmarks; draft mode restricts batch operations | Not every operation supported on every version mode |
| Directus imports | https://directus.com/docs/guides/content/import-export | CSV/JSON import/export, field matching/error handling | EverLang still needs domain validation |
| Directus versions | https://directus.com/docs/guides/content/content-versioning | Draft/version vs published, revisions | No claim it matches EverLang immutable revisions automatically |
| NIKL KLP grammar | https://klp.korean.go.kr/kcenter/search/dgrammar.do | Grammar category/initial consonant/level navigation, numbered forms | Public discovery UI, not internal CMS |
| NIKL KLP vocabulary FAQ | https://klp.korean.go.kr/kcenter/faq.do | Vocabulary by level, semantic relations/categories/topic/function and Excel download | Public taxonomy, not admin batching |
| Nuri KSI | https://nuri.iksi.or.kr/front/page/siteguide/learning/roadmap/main.do?language=ko | Separate teacher/learner resources, textbooks/guides and learning roadmap | Internal authoring not accessible |
| Online KSI guide | https://www.iksi.or.kr/lms/main/userGuide.do | Public course/user guide and Nuri material link | Not an admin manual |

## EverLang static findings

- High: admin-knowledge.service.ts KnowledgeService admin GET actually AdminKnowledgeService.get returns knowledgeStore.list({limit:200}).items only; KnowledgeAdmin loads /api/admin/knowledge without paging. Beyond200revisions inaccessible through this list. Not proven current corpus exceeds200.
- High at scale: AdminContentService.get returns sentences.list().items only, no request paging arguments or response totals; Admin maps list without pager. Full store/API/UI contract needs paging, not client slice.
- Medium: WordSetsAdmin has offset50/total/previous/next already. Counts versions, not necessarily distinct learning entries. Cross-module consistency missing.
- Medium: long editors + per-item review/publish; no bulk work queue/import-preview workflow observed in inspected admin modules. Existing workflow/CAS/pinned references must be preserved.
- Source-only review in this research. Existing #9 images show overview layout, not proof of all CMS interactions. #9 fixed role/navigation, not an editorial productivity increment.

## Proposed design (not implementation)

Recommend custom editorial workspace on current Nest/TypeORM/PostgreSQL. Alternative adopt Directus/Strapi admin adapter after a domain-contract spike; direct writes must not bypass CAS/review/publish/pinned references. No automatic ORM/schema/vendor migration from this report.

- Content library as main work surface: tab type, search, status/level/topic/rights filters, stable sorting, server pagination25/50/100, row selection, totals. Query state in URL. Group versions by stable key by default; expand history separately.
- List → full editor with content/examples/exercises/media/metadata sections, student preview, next/previous in filtered queue, preserve filters/selection and unsaved edits. Desktop list + detail; mobile dedicated editor with explicit return, avoid narrow split view.
- Review queue: missing source/rights, missing examples/answers/audio, edited since reviewed, ready to publish. Show actual validation findings, never automatic quality certification.
- Batch metadata changes/import/export first; publish reviewed versions only after explicit preview. Selection binds explicit IDs+versions, not changing filters; stale conflicts per item, result summary, retry failed only. No blanket auto-review of Korean ground truth.
- Korean-specific metadata: lemma/sense/POS/hanja/register/collocations, grammar conjugation/constraints/confusable forms, ko–vi examples/accepted variants, corpus/source/rights and audio-to-transcript. Reuse existing catalog fields rather than duplicate schema. TOPIK level is a taxonomy label, not proof of mastery.
- Reuse graph: entry→exercise→set/lesson; show usage before changes, preserve pinned learner snapshots/FSRS. New revision does not silently rewrite history.

## Observable delivery proposals, unscheduled

1. Tracer bullet knowledge library: >200 QA records; server page+filter+sort+total; open/edit/save/back preserves query and selected row; concurrency409 preserves draft; learner still published-only. Then reuse mechanics for sentence/catalogue lists.
2. Editorial throughput: import50drafts with dry-run/per-row errors/idempotent rerun; batch selected draft metadata, reviewer queue + next-item, publish only explicitly approved compatible versions; partial conflicts do not lose successful results.

These are proposed increments, not Ready issues or sprint commitments. Refine PRD/task mapping before implementation. Validate using owner session processing20items: completion, errors, lost work, context recovery; no fabricated time-savings metric. Physical devices, keyboard/screenreader and performance with realistic corpus need actual implementation verification.
