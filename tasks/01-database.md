# Task 2 — Database Schema & Migrations

**Goal:** PostgreSQL via Prisma with the full draft schema, using migrations only.

## Task 2.1 Prisma setup
- Install/init Prisma in `/api`. Configure `DATABASE_URL` from env.
- Enable strict migration workflow. NEVER `db push`.

## Task 2.2 Models (from PRD §7)
- `User, Cycle, DailyLog, CycleSummary, BlogPost, KnowledgeArticle` with fields as in the PRD.
- Enums: flow, cervicalMucus (dry|sticky|watery|eggwhite), cervixPosition (F|M|S).
- Relations: User→Cycle→DailyLog; User→CycleSummary; User→BlogPost (author).
- Indexes: `DailyLog(userId,date)` unique, `Cycle(userId,startDate)`. **No `cycleId` on DailyLog** — cycle membership is derived from date ranges (architecture D2). Target schema: `../implementation/schema.prisma`.

## Task 2.3 First migration
- `migrate dev` to create it. Commit the migration file.

## Task 2.4 Seed script
- Minimal seed: a few KnowledgeArticles and one BlogPost so later UI has data. No real users.

## Acceptance
- Migration applies cleanly; `migrate status` in sync; seed runs; Prisma client generates and imports in `/api`.
