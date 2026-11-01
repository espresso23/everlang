# Diagram source and generation provenance — EverLang system design

2026-11-01; architecture snapshot `686d87c`. No credentials or private data supplied. The diagram is an overview of implemented topology, not live-provider verification.

Final assets: [PNG3840px](everlang-system-design.png), [SVG](everlang-system-design.svg), [editable Graphviz DOT](everlang-system-design.dot). Final topology rendered deterministically using Graphviz via @viz-js/viz3.31.0; PNG exported from SVG using existing sharp. Tool package installation stays in ignored .local/diagram-tools; no project dependency/runtime change.

The built-in image_gen tool was used for an initial visual draft (no CLI/API fallback). That draft was discarded after reviewing ambiguous/incorrect edge connections. The shipped image is a fresh vector diagram generated from the DOT source, not an edited AI raster. This preserves exact labels/endpoints and editable topology.

To rebuild with a local Graphviz installation from repository root:

```powershell
dot -Tsvg documentation/features/platform-operations/assets/everlang-system-design.dot -o documentation/features/platform-operations/assets/everlang-system-design.svg
dot -Tpng -Gdpi=144 documentation/features/platform-operations/assets/everlang-system-design.dot -o documentation/features/platform-operations/assets/everlang-system-design.png
```

Graphviz PNG dimensions vary with font/DPI; the delivered PNG is3840×1538. SVG is resolution-independent; Segoe UI falls back to viewer fonts. The DOT file is the editable source for node/edge changes. Shared packages are code imports, not network services; detailed auth/grading/speech walkthroughs are in shared architecture.

## Initial AI draft prompt (draft not shipped)

```text
Use case: infographic-diagram. Create one polished, technically precise SYSTEM DESIGN DIAGRAM for the existing EverLang language-learning project, for its engineering documentation. Flat vector-like technical infographic, large sharp text, generous spacing, white/paper background, dark ink typography, cobalt blue core components, teal databases, amber dashed optional integrations. Wide landscape aspect ratio, high resolution, clean orthogonal arrows, readable at full screen. Not a UI mockup, no decorative clipart, no invented infrastructure or logos. Title: "EverLang — System Design". Subtitle: "Native NestJS backend • Architecture snapshot 2026-11-01". All text in English for clarity, short labels.

UPPER MAIN DIAGRAM, organized left to right in four well-separated lanes:
1. "CLIENT & ENTRY": card "Browser" with sublabels "Learner / Admin", "Access JWT in RAM", "HttpOnly refresh cookie". Browser connects via a clearly labeled "HTTPS / same origin" arrow to card "Caddy gateway". Gateway splits into two explicitly labeled routes: "/" to "Next.js Web :3001" with "apps/web • UI only", and "/api/*" to "NestJS API :4000" with "apps/api". API replies back through gateway, no browser-direct database arrows. Next.js card represents UI delivery; subsequent authenticated API requests originate from the Browser, via gateway.
2. "APPLICATION": prominent NestJS API card, containing three separated internal strips: "JWT guard • RBAC • Ownership"; "Auth / Profile / Learning / Content / Exams"; "Global exception filter • Request logging". Below it, thin shared-code card "Shared packages" with "contracts: browser-safe types" and "backend: data / queue / providers". The shared packages card is CODE ORGANIZATION, NOT an HTTP service: use faint dotted dependency lines or no arrows; never show HTTP requests to it.
3. "DATA & ASYNC": three database cards vertically:
"PostgreSQL + pgvector" / "Users • Sessions • Progress • FSRS" / "Durable jobs • Reports • Tutor vectors";
"MongoDB" / "Versioned system learning content";
"Redis + BullMQ" / "Cache • Rate limits • Two job queues".
Connect Nest API to each database with solid labeled arrows "SQL", "Content reads / writes", and "Cache / enqueue". Redis must NOT be labeled the permanent learning-progress source.
Below the Redis card put two SEPARATE worker cards: "Nest Grading Worker" / "everlang-grading", and "Nest Speech Worker [optional]" / "everlang-speech". Queue-to-worker arrows mean jobs consumed. Draw clear worker-to-PostgreSQL arrows "Persist result". Near speech worker put card "Private speech_media volume"; API and speech worker both connect to it, label "Owner-only audio". Show grading worker calls OpenRouter; speech worker uses Whisper.cpp OR Gemini, never both providers simultaneously.
4. "INTEGRATIONS / OPTIONAL": amber dashed-outline group with three compact cards: "OpenRouter" / "Grading • Tutor • AI drafts"; "Whisper.cpp OR Gemini" / "Speech transcription"; "Google OAuth • SMTP / Mailpit • KRdict" / "Sign-in • Email • Dictionary". Native API connects to third card with dashed arrow; grading worker to OpenRouter with dashed arrow; API also to OpenRouter for synchronous Tutor/drafts; speech worker to ASR options with dashed arrow. Small separate optional card "S3 + Google STT" / "Recordings feature" with dashed API link if space permits. Label this entire lane "Configured as needed — live verification varies". Do not imply that all cloud services or speech profiles are currently enabled.

BOTTOM BAND, distinct from the main architecture: three numbered flow summaries, with short simple arrows and exact text:
"01 AUTH" : "Sign in → JWT + refresh cookie → Bearer requests → Guard + active session"
"02 GRADING" : "POST → PG job → Queue → Worker → PG result ← API polling"
"03 SPEECH" : "Consent + upload → Private media + PG → Speech queue → ASR → PG → Bearer audio"
A thin footer strip: "Tracing: requestId → queue metadata → worker jobId / attempt • Redacted JSON logs"
And a small legend: "Solid = core traffic   Dashed = optional integration   Dotted = code dependency".
Small factual note: "Refresh rotates; reuse revokes session family. Client never connects directly to data stores."
Prioritize accurate endpoint/component relationships, unambiguous arrowheads, readable labels, no overlapping lines or text. No Kubernetes, no Kafka, no invented public ports, no Better Auth, no Next.js API handlers, no cloud-provider success badges. This diagram describes code topology, not proof that every integration is live.
```

## ORM revision2026-11-01

DOT/SVG/PNG updated from runtime source: TypeORM at API/workers→PostgreSQL, Mongoose at API→MongoDB; rate limits move from Redis to PostgreSQL. Earlier generation prompt retained as provenance; current canonical DOT governs actual image.

## PostgreSQL-only revision2026-11-01

Canonical DOT removes Mongo node/edge; PostgreSQL contains versioned content and legacy archive. Previous prompts are historical provenance. SVG/PNG rendered deterministically from DOT; no new AI diagram inference.
