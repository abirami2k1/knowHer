# knowHer

🩸 A warm, fearless period & cycle health companion. Track periods, chart ovulation the way a real practitioner teaches it, and plan life *in sync* with your hormonal rhythm.

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

- Node 20 LTS (see `.nvmrc`) and npm
- Docker Desktop (local PostgreSQL only — production uses AWS RDS)

## Commands

Frontend (`/web`):

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Production build |
| `npm run lint` | Lint |

Backend (`/api`):

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:4000 |
| `npm run build` | Compile TypeScript |
| `npm run migrate:dev` | Create/apply a migration (development) |
| `npm run migrate:deploy` | Apply migrations (production) |

## Local database

```bash
docker compose up -d db
```

Starts PostgreSQL 16 on `localhost:5432` (user/password/db all `knowher`). The matching `DATABASE_URL` is noted at the top of `docker-compose.yml`.

## Tech at a glance

React (Vite, TS, PWA, mobile-first) · Tailwind v4 + Framer Motion · Recharts · Node/Express · PostgreSQL + Prisma · AWS Cognito · AWS S3 · deployed on AWS. Temperatures in °F.

## Where to read next

- `CLAUDE.md` — golden rules and the full reading list
- `context/architecture.md` — system design and locked decisions D1–D8
- `tasks/TASKLIST.md` — the ordered build checklist
- `context/progress.md` — live build progress
