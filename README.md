# knowHer

🩸 A warm, fearless period & cycle health companion. Track periods, chart ovulation the way a real practitioner teaches it, and plan life _in sync_ with your hormonal rhythm.

Mission: **"Body feeling light and menstruating stress-free."**

---

## Repository layout

```
/web      React + Vite + TypeScript PWA (mobile-first)
/api      Node + Express + TypeScript API (all cycle logic lives here)
/shared   Types shared by both apps (no runtime logic)
context/  Product, architecture, coding standards, progress
tasks/    Ordered build checklist (TASKLIST.md is what gets executed)
implementation/  Implementation plan + target Prisma schema
```

## Prerequisites

- Node 24 LTS (see `.nvmrc`) and npm
- Docker Desktop (local PostgreSQL only — production uses AWS RDS)

## Commands

Frontend (`/web`):

| Command           | What it does                                                               |
| ----------------- | -------------------------------------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:5173                                        |
| `npm run build`   | Production build                                                           |
| `npm run lint`    | Lint                                                                       |
| `npm run preview` | Serve the production build (PWA + service worker) at http://localhost:4173 |

Backend (`/api`):

| Command                  | What it does                           |
| ------------------------ | -------------------------------------- |
| `npm run dev`            | Dev server at http://localhost:4000    |
| `npm run build`          | Compile TypeScript                     |
| `npm run lint`           | Lint                                   |
| `npm test`               | Unit + integration tests (Vitest)      |
| `npm run migrate:dev`    | Create/apply a migration (development) |
| `npm run migrate:deploy` | Apply migrations (production)          |
| `npm run migrate:status` | Check migrations are in sync           |
| `npm run generate`       | Regenerate the Prisma client           |

## Environment

Each app reads its own env file. Copy the example, then fill in values:

```bash
cp api/.env.example api/.env && cp web/.env.example web/.env.local
```

The example files document every key and hold placeholders only. Real `.env*` files are gitignored; anything prefixed `VITE_` ships in the public web bundle, so it must never be a secret.

## Database migrations (rule: migrations only)

Schema changes go through Prisma migrations, never `prisma db push` and never hand-edited SQL against a live database:

| Command                  | When                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `npm run migrate:dev`    | Development. Edit `prisma/schema.prisma`, then run this to create + apply a migration and regenerate the client. |
| `npm run migrate:deploy` | Production / CI. Applies pending migrations only.                                                                |
| `npm run migrate:status` | Check the database is in sync before committing.                                                                 |

The generated client (`api/src/generated/`) is gitignored; `npm run build` regenerates it. Run `npm run generate` after cloning if you only need `npm run dev`.

## Local database

```bash
docker compose up -d db
```

Starts PostgreSQL 16 on `localhost:5433` (user/password/db all `knowher`). Host port 5433 is deliberate so it never clashes with a Postgres already installed on the machine. The matching `DATABASE_URL` is noted at the top of `docker-compose.yml`.

## Tech at a glance

React (Vite, TS, PWA, mobile-first) · Tailwind v4 + Framer Motion · Recharts · Node/Express · PostgreSQL + Prisma · AWS Cognito · AWS S3 · deployed on AWS. Temperatures in °F.

## Where to read next

- `CLAUDE.md` — golden rules and the full reading list
- `context/architecture.md` — system design and locked decisions D1–D8
- `tasks/TASKLIST.md` — the ordered build checklist
- `context/progress.md` — live build progress
