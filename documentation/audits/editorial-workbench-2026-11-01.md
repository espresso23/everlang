# Editorial workbench integration audit — 2026-11-01

Branch feature/editorial-content-workbench; basef59cdc2; PB-043-T01/#11; existing #9 shell/role gates and #10 skill included in owner merge-all authorization. Separate source/UX review after implementation, no source claims from provider mocks.

| Contract | Result/evidence |
|---|---|
| EW-01 auth→API→TypeORM→whole-dataset filter/count/page | PASS native isolated PG10migrations,210knowledge/60catalogue/60sentences; pages100/100/10 distinct; filters105drafts, literal .* no match, invalidlimit200→400, both other modules2pages25unique. |
| EW-02 explicit draft metadata version checks and partial failures | PASS browser selected2drafts:1success/1conflict, success deselected; server native CAS409, published learner unchanged; previous/next calls existing dirty guard. |
| EW-03 bounded dry-run/import | PASS invalidrow disables commit/no writes; valid import createdraft; native sentence sameimportkey→sameID/duplicate, editedcollision409; knowledge duplicate409. Server validates commit, no auto-review. |
| EW-04 read-only student snapshot→confirm | PASS publicEntry projection, reveal/localcheck no attempts/SRS writes; exact setkey/revision fetch; cancel0mutations; stale publish409 staysdialog, native validpublish200 reveals tolearner with answers hidden. RealcatalogUI publish dialog→server→published heading PASS. |
| EW-05 permissions/regressions | PASS native learner403 all3admin APIs, unpublished404; real knowledge2account notes/attempt/concurrency/reader/SRS regression; realcatalog homograph/pinned revisions/quota/legacy/clock regression. |

Meaningful red/green: olddeployedUI had no pageddesk; native reviewed-sentence edit returned reviewed until resetdraft fix; visual responsive input overflow corrected; keyboard Escape focus failed before restoring invoker in dialog cleanup. Test infrastructure: initial API startup race rerun after readiness, sharedcatalog QAemail collision isolated; oldcatalog selector changed to new semantic table row (assertions preserved). One stale selector run interrupted to fix locator, not reported as product pass.

Tests use owned PG everlang_editorial_qa_20261101 on isolated container/port15434, owned candidate API/web/gateway; synthetic accounts and content only. Mailpit exclusively disposable QA to verify existing test emails, not runtime config/service. API no cloud keys, speech disabled, providerCalls0. Main database not used as test fixture.

Source review: preserve default learner sentence ordering bycreated_at while explicit admin sortupdated; deterministic tie revision/id; PostgreSQL parameters bind search/filters; maxpage100; published immutable; reviewed edit resets draft; conflicts do not overwrite data. CAS remains backend, UI preview alone never authorizes publish. NoDDL/queue/provider changes.

Limits: fixture UI role tests are not upstream Google live; Korean ground-truth/corpus rights, hardwareTTS/ASR/accessibility/production release remain NOT VERIFIED in originalfeatures. JSON import only, no CSV mapping; cross-row work intentionally partial with report, not atomic. Column selections explicitcurrentpage/snapshots, no selectallfiltered implication.

Final command/results and merge checkpoint recorded below after final image checks. Images: content-authoring/assets/editorial-{1440,390,320}.png, editorial-student-preview.png; knowledge and catalog real regressions regenerated synthetic screenshots. Backup/restore N/A: no migration or production content writes. Rollback source, keep database unchanged.

Final PASS:88unit/19files, lint/workspace typecheck, fullDockerAPI/worker/web, nativePG210/60/60 probe,11unique browser scenarios after isolating reused QAaccounts/content and updating oldcatalog list locator. Lastcombinedrun10passed +1duplicate old QAidiom title failure; failedknowledge rerun after isolatedQAknowledge reset PASS9.7s. Final role/workbench8/8 PASS19.5s; deployed main sign-in smoke1/1 PASS3.3s; ready/queueAvailable true. [Structured results](../features/content-authoring/assets/editorial-verification.json). OwnedQAresources/Mailpitimage removed; main volumes retained. Source review complete; PB-043-T01 Done/Pass per owner authorization, #11 completed after main integration. Content/provider/human-release gates outside issue remain open.
