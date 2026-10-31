# Audit tích hợp — vocabulary catalog ↔ authoring ↔ SRS ↔ speech

2026-10-31 · feature/topic-vocabulary-catalog. [Catalog audit](../features/vocabulary-catalog/audit.md) · [SRS](../features/vocabulary-srs/audit.md) · [authoring](../features/content-authoring/audit.md) · [speech](../features/self-hosted-speech/audit.md).

| Kết nối | Kết quả | Bằng chứng |
|---|---|---|
| Admin UI → server session/admin → Mongo draft/review/pub → learner published projection | PASS | Actual2-account workflow, explicit review, CAS, source/ref pin; [test](../../tests/e2e/vocabulary-catalog.spec.ts). Không auto-review owner drafts. |
| Learner → session → membership/pinned Mongo → PG advisory transaction → vocabulary FSRS | PASS | Server snapshot, owner/private state, daily quota/races, duplicate keeps card/due/log, explicit legacy attach; same comprehensive test. |
| New migration ↔ legacy vocabulary endpoints | PASS phạm vi | Bridge deployed before007; backup/restore metadata; actual legacy POST/duplicate/GET with partial indexes. Old pre-bridge POST incompatible, rollback requires bridge/newer. |
| Saved example → SRS front/back → shared TTS coordinator | PASS contract | Vietnamese answer hidden until reveal, personal custom context preserved; unit59 and browser recall. Korean physical voice NOT VERIFIED. |
| Catalog → /speech | PASS navigation only | Provider disabled main; existing speech audit retains Google timeout and no pronunciation score. Link does not claim assessment readiness. |
| Mongo unavailable → no PG write → editor/learner feedback | PASS | Actual isolated outage candidate500, retained input/no fake data; service-error screenshot. |
| Shared shell typography → mobile text spacing | PASS phạm vi | Normal320 + text-spacing PASS sau font-only fix same760px breakpoint; scoped actual UI test8.8s. |

No new queue/media provider in catalog. Existing grading/speech worker behavior not changed; no second SRS. Hardware/quality/corpus/reviewer release gates remain open. [Detailed commands/evidence](../features/vocabulary-catalog/assets/verification.md). Full self-study goal remains active.
