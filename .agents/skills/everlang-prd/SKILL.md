---
name: everlang-prd
description: Refine an EverLang feature through grill-me and write its canonical PRD before implementation. Use for new product scope or material requirement changes, not routine execution of an agreed issue.
---

# EverLang PRD

Work in the EverLang repository identified by the user. Read AGENTS.md, documentation/workflow/README.md and the relevant existing feature/planning documents. Inspect facts in code instead of asking the user to restate them.

Use the available grill-me skill for unresolved material decisions. Ask one decision at a time, recommend one answer and offer at most one strong alternative. Keep a settled/open/waiting map. Existing authorization and decisions remain valid; do not introduce a new approval ritual. If grill-me is unavailable, disclose that and perform the same focused interview directly. Never record silence as agreement.

Write the destination PRD in documentation/features/<feature-id>/README.md using documentation/templates/feature/README.md. Record the actual interview conclusions beside the feature using documentation/templates/workflow/interview.md. Do not create a second competing PRD file. Include user/problem, measurable outcome, non-goals, stable REQ IDs, observable acceptance, assumptions, dependencies, failure cases and unresolved decisions with their implementation impact.

For a new feature, prepare all five canonical docs before code; mark future routes/symbols planned, not existing. For existing features, update only affected requirements and explicitly retain legacy verification limits. Technical contracts belong in system-design/functions/ui rather than duplicated PRD prose.

Deliver a brief of settled decisions and remaining blockers. A request to refine/write a PRD does not authorize coding, posting GitHub issues or starting the backlog. If implementation was already explicitly assigned and scope is settled, continue within that authorization. Update HANDOFF for project changes.
