---
name: prd-to-issue
description: Turn an agreed EverLang PRD into vertical-slice issue files and, when requested, GitHub issues with duplicate checks and local task mappings. Does not implement the issues or select sprint scope.
---

# PRD to issues

Read AGENTS.md, documentation/workflow/README.md, documentation/planning/README.md and the assigned feature PRD/design/contracts. Follow documentation/templates/workflow/issue.md. Resolve only material missing scope with the user; reuse settled decisions.

Start with a tracer bullet that produces an observable end-to-end result. Slice subsequent behavior across the layers it actually needs, with a success path and meaningful failure path. Define dependencies explicitly; shared schema/contract or conflicting files mean tasks are not independent. Migration/restore prerequisites can be separate risk-driven tasks. Do not auto-delegate or implement the generated list.

Map PRD REQ → existing PBI/task ID → local issue → acceptance/evidence. Keep work-items.json as the state source of truth; preserve IDs. If new product tasks are necessary, refine them there without committing a Proposed sprint or inventing remote ticket numbers. Run plan:sync and plan:check after tracking changes. Local issue bodies live at documentation/features/<feature-id>/issues/<task-id>.md and include stable marker everlang-task:<task-id>, dependencies, affected modules, test/rollback plan, readiness/stop conditions and human QA gate. No duplicated local status field.

## GitHub publication

Creating this skill or requesting local decomposition does not authorize remote writes. If the user requested GitHub publication, that is authorization to post the agreed issue scope; do not ask again merely as a ritual. Prepare complete local bodies first.

Discover connected GitHub tools, prefer them over browser/CLI when sufficient. Resolve owner/repo from the intended remote and confirm the accessible repository identity; do not print remote URLs containing credentials. Search open AND closed issues for the stable task marker and inspect matches before creating. Reuse/report a match; update an existing body only within the user's authorized scope. Verify pagination/completeness before claiming absence. If the connector is insufficient, explain briefly and use authenticated gh if available; use a real body file, never shell-interpolated Markdown.

Create sequentially in dependency order. After each successful response persist its actual URL/number in the local issue before moving on. Include dependency URLs once known. If a create times out or returns an ambiguous result, search/refetch the marker before retrying; never blindly duplicate. On access/service failure, retain local drafts and identify which issue remains unpublished. Do not fabricate remote IDs, assign other people, send comments/notifications, or close issues unless explicitly requested.

Run docs:check, plan:check and a separate review of REQ coverage/dependency cycles. Update HANDOFF with draft/published counts, actual links and verification limits. Report the issue list and dependency order; no automatic implementation, push, merge or deploy follows publication.
