# Tech stack — 2026-11-01

Phiên bản khóa bởi [lockfile](../../package-lock.json); dependencies sở hữu theo workspace.

| Lớp | Hiện thực |
|---|---|
| Web | Next16.4.3/React19/TypeScript; App Router UI, Inter self-host, Editorial tokens |
| API | Nest12.3.2 ESM/Express; native controllers/services, global guard/filter/interceptor; Swagger /api/docs |
| Worker | Nest ApplicationContext + @nestjs/bullmq12/BullMQ6.5, WorkerHost grading và speech |
| Auth | @nestjs/jwt RS256, node crypto scrypt tương thích hash cũ; native Google jose/PKCE, Nodemailer SMTP |
| SQL | PostgreSQL17/pgvector, node-postgres; numbered SQL migrations, không Drizzle |
| Học liệu | PostgreSQL/TypeORM + JSONB; versioned sentence/exam/knowledge/vocabulary catalogue |
| Queue/cache | Redis7/ioredis/BullMQ; PostgreSQL durable jobs/state |
| Learning | ts-fsrs6.0.0 FSRS-7 retention0.9; shared contracts browser-safe |
| Provider | OpenRouter/Zod/jsonrepair; dictionary; optional Google STT/S3; explicit Whisper/Gemini speech |
| Runtime | Node24, npm workspaces, Docker multi-target, Caddy same-origin gateway |
| Verification | Vitest5, Playwright1.64, ESLint9, workspace typecheck/build, docs/plan/legacy gates |

`apps/web` không phụ thuộc server database/provider packages. `packages/backend` CommonJS, API/worker ESM NodeNext, contracts CommonJS/browser-safe. Không Better Auth hay Next backend runtime. Provider cloud và Google thật cần evidence riêng; build không chứng minh credentials hoạt động.
