# knowHer — Architecture

How the system is put together and why. Complements the PRD (what) and coding-standards (how code is written). Reflects the locked decisions of 2026-09: retention deferred, engine API-only, cycle membership derived from date ranges.

---

## 1. System overview

```
Browser (PWA)  ──JWT──▶  API (Express, EC2)  ──Prisma──▶  PostgreSQL (RDS)
     │                        │
     ├──login/signup──▶  AWS Cognito ◀──JWKS verify──┘
     └──static assets──  S3 + CloudFront (web bundle)
                          S3 (content images — pending decision 11.0.6)
```

Two deployable units, one database:

- **`/web`** — React + Vite + TS PWA, built to static files, served from S3 behind CloudFront. Mobile-first, bottom nav (Home · Log · Learn · Profile).
- **`/api`** — Node + Express + TS on EC2 (systemd service behind nginx with TLS via certbot). All business logic and all cycle math live here.
- **`/shared`** — types only (`ApiResponse<T>`, DTOs, symptom vocabulary). No runtime logic.

## 2. Layering (API)

```
routes/        thin: Zod-validate input → call service → wrap in { success, data, error }
middleware/    auth (Cognito JWT verify via JWKS), error handler, request logging (no health data)
services/      business logic: cycle intervals, log upsert, dashboard assembly, export/delete
domain/cycle/  PURE rule engine: (logs, rules) → assessment. No DB, no HTTP, no Date.now()
schemas/       Zod schemas per resource (single source of input validation)
prisma/        schema + migrations (migrations only, never db push)
```

The volatile parts — `domain/cycle/rules.ts` (`CYCLE_RULES`), `domain/cycle/copy.ts` (state copy map) — are the only files that change when Sivi tunes the method. Everything else is stable plumbing.

Frontend layering mirrors it: `pages/` → `hooks/` (React Query) → `lib/api/` (typed client) → API. No cycle math anywhere in `/web`; screens render what the API returns, including its copy strings.

## 3. Core architectural decisions

**D1 — Calendar dates, client-chosen.** Every user-facing date (`DailyLog.date`, cycle boundaries) is a plain `YYYY-MM-DD` local calendar date picked on the client. The server never derives "today" from a UTC clock for user data. Stored as `@db.Date`. Corollary: any read endpoint whose answer depends on "today" (`/dashboard`, `/trends`) takes a required, Zod-validated `?today=YYYY-MM-DD` from the client.

**D2 — Cycles are intervals; logs are unowned.** `DailyLog` has no `cycleId`. A log belongs to the cycle whose `[startDate, nextStartDate)` contains its date, resolved at query time in `services/cycles.ts` (one helper: `logsForCycle(userId, cycle)`). Editing a period start edits one row and can never orphan logs. Backfilling a forgotten period whose start falls **inside** an existing cycle's interval is legitimate: `startCycle` splits that cycle (close it at `newStart − 1`, recompute its snapshot, create the new cycle) rather than rejecting. The overlap guard rejects only true duplicates (a start on an existing start date). Optionally hardened later with a Postgres `daterange` exclusion constraint via raw migration.

**D3 — Cycle boundaries are explicit user actions, not inference.** Logging heavy flow does not silently create a cycle. When the user logs flow ≥ light (spotting alone never prompts) and no cycle covers that date, the UI asks "Is this the start of your period?" — yes → `POST /cycles { startDate }`, which closes the previous cycle (`endDate = startDate − 1 day`). Declined prompts leave the flow log in place as an orphan bleeding day: excluded from cycle stats, surfaced later by a gentle reconciliation nudge ("you logged bleeding on the 12th — was that a period?"). Deterministic, no guessing.

**D4 — Derived values: compute live, snapshot on close.** For the *current* cycle, assessments (coverline, ovulation, peak, luteal, phase) are computed on read by running the engine over ≤ ~45 logs — cheap, always fresh, backfill-safe. When a cycle *closes*, the assessment is persisted onto the `Cycle` row as a snapshot; editing logs inside a closed cycle's range re-runs and re-persists it. Precedence rule for Trends: a `Cycle` row is authoritative while its raw logs exist; a `CycleSummary` counts only for cycles whose raw logs were pruned — dedupe on `(userId, startDate)`, never count a cycle twice. `expectedOvulation` is never stored — always computed on read (formula: `startDate + max(avgCycleLength − 14, minFollicular)`, labelled estimate, suppressed under the irregularity fallback).

**D5 — Engine stays server-side.** Offline mode = queue log writes (upsert-by-date makes sync last-write-wins) + show the last-fetched dashboard, clearly dated. Fresh assessments require a connection. Revisit only if offline-first becomes a headline feature.

**D6 — Retention deferred.** `CycleSummary` schema ships now; the deletion job ships post-launch after the automatic-vs-opt-in decision (before any user reaches ~6 cycles).

**D7 — Roles in the database, not Cognito groups.** `User.role` (`user | author`). One place to check, no Cognito console coupling; `requireRole('author')` middleware reads the DB user attached by auth middleware.

**D8 — Account deletion ordering.** 1) disable the Cognito user (can't log back in) → 2) delete all DB rows in one transaction → 3) delete the Cognito user. If step 3 fails, write a row to a tiny `PendingCognitoDeletion` table (added by migration in Task 12) retried on API boot and daily — no job framework needed; the account is already inert. Author accounts with published posts are blocked from deletion with clear copy until posts are removed or reassigned (schema `onDelete: Restrict`).

## 4. API surface

| Method & path | Auth | Task |
|---|---|---|
| `GET /health` | public | 1 |
| `GET /me` · `PATCH /me` | user | 3, 5 |
| `POST /onboarding` | user | 5 |
| `PUT /logs` (upsert by date) · `GET /logs?from&to` | user | 6 |
| `POST /cycles` (period start) · `PATCH /cycles/:id` (adjust/end) · `GET /cycles` | user | 6 |
| `GET /cycles/:id/assessment` | user | 7 |
| `GET /dashboard` | user | 8 |
| `GET /history?month=YYYY-MM` | user | 9 |
| `GET /trends` | user | 10 |
| `GET /knowledge` · `GET /blog` · `GET /blog/:slug` | user | 11 |
| `POST /blog` · `PATCH /blog/:id` · `POST /blog/:id/(un)publish` | author | 11 |
| `GET /account/export` · `DELETE /account` | user | 12 |

All protected routes: verify Cognito JWT (JWKS, `aws-jwt-verify`), attach `userId` from `sub` (upsert `User` on first sight), never trust a client-sent userId. Response envelope `{ success, data, error }` everywhere. No health data in URLs (all filters via query on non-identifying params or body) or logs.

## 5. Environments & deploy

- **dev** — local: Postgres in Docker, `npm run dev` both apps, Cognito dev user pool.
- **prod** — RDS (private subnet, encrypted), EC2 (SG allows only ALB/nginx), S3+CloudFront for web.
- **CI (GitHub Actions)** — on every push/PR: lint + build (web & api) + engine tests. Deploy jobs: web = build → S3 sync → CloudFront invalidation; api = SSM/ssh → pull → build → `migrate:deploy` → reload via pm2 (zero-downtime) or accept the seconds-long systemd restart for MVP. Secrets in GitHub environments; `.env.example` documents every key.

## 5b. Production hardening (part of Task 1/12 ACs, not optional extras)

- **CORS**: API allows exactly the CloudFront origin (env-configured); no wildcard.
- **helmet** + JSON body-size limit (~100 kB) + basic rate limiting (`express-rate-limit`, stricter bucket on auth-adjacent routes).
- **RDS**: automated backups ON with point-in-time recovery, 7–14 day window. Losing health data once would end the product's credibility — this is a launch blocker, not polish.
- **Error monitoring**: Sentry (or similar) on both apps from Task 1, with scrubbing configured so no health fields ever leave in an event payload.
- **Markdown safety**: author/admin markdown rendered with `react-markdown` + `rehype-sanitize` — author content is still untrusted input.

## 6. Env vars

`/api`: `DATABASE_URL`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `AWS_REGION`, `PORT`, (later) `S3_BUCKET`, `VAPID_*`.
`/web`: `VITE_API_URL`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_AWS_REGION`.
