# knowHer — Build Progress

Living status file. **Update this whenever a task item is started or finished.**
The detailed items live in `@tasks/TASKLIST.md`; this file is the at-a-glance tracker + log.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done

Last updated: 2026-09-24

---

## Needed from the founder (blocking items — the build continues around them)
- [ ] **4.4.0 Sivi session** — take `implementation/cycle-engine-plan.md` §11 (10 questions) and `implementation/cycle-engine-evidence.md` §11 (rule proposals) to Sivi. Her answers become fixture expectations; ask whether a de-identified copy of her sample cycle may be checked in as `sivi-sample`. Until then the engine runs the adopted defaults and 4.4.2 stays [~].
- [ ] **Evidence-file decisions (founder)** — luteal prior 13 + personal mean, FIGO irregularity by age band, coverage floor before an anovulatory verdict, `minValidTemps` derived (9), `plausibleRangeF` + `implausible_reading`, `rulesVersion` column on `Cycle` (schema change), "around day N" wording. Each is one rules key + one fixture once decided.
- [ ] **1.2.7 Sentry** — provide DSNs for api + web, or decide to skip error monitoring for MVP.
- [ ] **11.0.6 S3** — keep (blog/knowledge image uploads via presigned URLs) or drop from the stack.
- [ ] **12.0.3 Cognito admin credentials** — `DELETE /account` must disable then delete the Cognito user (D8). The API needs IAM credentials (or an instance role) allowed `cognito-idp:AdminDisableUser` + `AdminDeleteUser` on the pool. Until provided, the DB side of deletion ships and the Cognito step is a documented stub that fails closed.
- [ ] **13.0.1 VAPID** — approve generating the web-push key pair.
- [ ] **AWS cleanup** — delete app clients `knowher-web` and `knowher-web-spa` (unused; the second one's secret was pasted in chat). `knowher-web-public` is the live one.
- [ ] **Git cleanup** — delete merged branches `feature/repo-tooling`, `feature/api-skeleton`, `feature/scaffolding`, `feature/database`, `feature/auth`, `feature/cycle-engine`, `feature/onboarding` on your say-so.

---

## Currently working on
- Task: **6.3.1** — the daily-log bottom sheet (UI). The Task 6 API side (6.1.x, 6.2.x) is done and verified against the local DB.
- Branch: `feature/daily-log`. Uncommitted — awaiting founder OK.
- Notes: 4.4.0 (Sivi gate) and 1.2.7 (Sentry DSNs) remain open; neither blocks Task 6.

## Phase status (high level)
- [x] Task 1 — Scaffolding & app shell (1.2.7 Sentry deferred to founder checkpoint)
- [x] Task 2 — Database schema & migrations
- [x] Task 3 — Auth (Cognito)
- [~] Task 4 — Cycle rule engine (pure + tests) — code + synthetic fixtures done; 4.4.0 Sivi gate open
- [x] Task 5 — Onboarding
- [~] Task 6 — Daily Log + Period Tracker (API done; UI 6.3.x next)
- [ ] Task 7 — Cycle Tracker UI
- [ ] Task 8 — Dashboard
- [ ] Task 9 — Cycle History (calendar)
- [ ] Task 10 — Trends
- [ ] Task 11 — Knowledge Tab + Admin
- [ ] Task 12 — Account & Privacy
- [ ] Task 13 — PWA polish & daily nudge

---

## Detailed item status
> Mirror of TASKLIST.md items. Tick here as you complete each. Only Task 1 is expanded to show the format; add rows for each task as you reach it (or copy the full list from TASKLIST.md).

### Task 1 — Scaffolding
- [x] 1.1.1 root repo + folders
- [x] 1.1.2 editorconfig + prettier
- [x] 1.1.3 .env.example (both apps)
- [x] 1.1.4 GitHub Actions CI (green on main at 2c042d2)
- [x] 1.2.1 Express+TS init
- [x] 1.2.2 dev + lint scripts
- [x] 1.2.3 response helper
- [x] 1.2.4 GET /health
- [x] 1.2.5 error middleware
- [x] 1.2.6 hardening (CORS / helmet / body limit / rate limit)
- [ ] 1.2.7 Sentry — blocked on founder DSNs (checkpoint)
- [x] 1.3.1 React+Vite+TS init
- [x] 1.3.2 Tailwind v4 + tokens
- [x] 1.3.3 router + placeholder routes
- [x] 1.3.4 mobile-first bottom nav
- [x] 1.3.5 Framer Motion transition
- [x] 1.3.6 typed API client + health on Home
- [x] 1.4.1 shared ApiResponse type
- [x] 1.4.2 PWA manifest + SW

### Task 2 — Database
- [x] 2.1.1 Prisma 7 init (prisma.config.ts, pg adapter, client singleton)
- [x] 2.1.2 migrate:dev / migrate:deploy / migrate:status (+ generate, seed) scripts
- [x] 2.1.3 migrations-only rule documented in README
- [x] 2.1.4 date rule: coding-standards (already present) + schema header/field comments
- [x] 2.2.1 enums (Flow, CervicalMucus, CervixPosition + AgeBand, Condition, Goal, Role, Audience)
- [x] 2.2.2 User
- [x] 2.2.3 Cycle (expectedOvulation intentionally NOT a column — computed on read, D4)
- [x] 2.2.4 DailyLog (no cycleId — D2; symptoms String[] per implementation plan)
- [x] 2.2.5 CycleSummary
- [x] 2.2.6 BlogPost + KnowledgeArticle
- [x] 2.2.7 relations + indexes (DailyLog(userId,date) unique, Cycle(userId,startDate), CycleSummary(userId,cycleStartDate) unique)
- [x] 2.3.1 migration 20260918024515_init applied; migrate:status in sync
- [x] 2.3.2 seed: 6 KnowledgeArticles + 1 draft BlogPost (placeholder author); idempotent

### Task 3 — Auth
- [x] 3.1.1 Cognito setup steps in README + .env.example
- [x] 3.1.2 JWT-verify middleware (aws-jwt-verify, access token) — missing/garbage token → 401 verified
- [x] 3.1.3 requireAuth guard — GET /me rejects anon (tests + curl)
- [x] 3.1.4 upsert User by cognitoSub — exactly one row after repeated /me calls (verified in Postgres)
- [x] 3.1.5 GET /me — 200 with profile DTO using a real Cognito access token
- [x] 3.2.1 sign-up UI (+ confirm password, confirm-code step) — founder created a real account
- [x] 3.2.2 log-in UI + Bearer token on API client — /me succeeds after login; email shown from ID token
- [x] 3.2.3 sign-out (Profile) — clears session, returns to /login (founder verified)
- [x] 3.2.4 route guard — anon → /login; authed → shell (Profile renders inside shell)
- [x] 3.2.5 loading/error states — wrong password shows the friendly toast; pool misconfig errors surface plainly

### Task 4 — Cycle rule engine (spec: implementation/cycle-engine-plan.md)
- [x] 4.1.1 domain/cycle/ (index, rules, copy, types) + purity test + ESLint import guard
- [x] 4.1.2 CYCLE_RULES (typed interface, frozen, withRules() for overrides)
- [x] 4.1.3 CycleLog / CycleInput / CycleAssessment / ChartPoint / Flag types
- [x] 4.2.1 temps.ts (integer hundredths) + coverline.ts (window, candidate, dip) + computeCoverline
- [x] 4.2.2 shift.ts detectThermalShift — 3-over-6, false-shift invalidation, pending, confirmation day
- [x] 4.2.3 peak.ts detectPeakDay — last egg-white, confirmed after peakConfirmDays logged non-egg-white days
- [x] 4.2.4 luteal.ts — lutealDayFor / computeLutealLength / lutealDayToday
- [x] 4.2.5 assess.ts + series.ts — flags, confidence tiers, chart rows
- [x] 4.3.1 anovulatory fixture
- [x] 4.3.2 low-data fixture (not anovulatory; peak still found)
- [x] 4.3.3 disturbed fixtures ×3 (excluded → same verdict; included → no shift; day-13 case moves the window — Sivi Q2/Q9)
- [x] 4.3.4 false-shift fixture
- [x] 4.3.5 disagreement fixture
- [x] 4.3.6 live-pending fixtures ×3 + prefix-invariance tests (nothing provisional, ever)
- [ ] 4.4.0 **Sivi gate** — founder checkpoint
- [x] 4.4.1 copy.ts (all flags, confidence tiers, phases, fallbacks) + inline-prose guard test
- [~] 4.4.2 all fixtures green (18 fixtures, 48 tests) — expectations final only after 4.4.0
- [x] 4.4.3 config-flip fixtures (consecutiveRises=4 confirms a day later; with a day-20 dip it does not; control confirms)

### Task 5 — Onboarding
- [x] 5.1.1 PATCH /me + POST /onboarding (Zod) — profile, conditions, goals, tracking flags persist; onboardedAt set once
- [x] 5.1.2 lastPeriodStart + today → first open Cycle in one transaction; absent date = "not sure", no cycle
- [x] 5.2.1 Welcome step
- [x] 5.2.2 Profile step (name, age band)
- [x] 5.2.3 Period history step with the "not sure" path
- [x] 5.2.4 Health context step
- [x] 5.2.5 Goals step (multi-select)
- [x] 5.2.6 Conditional BBT/mucus step (only for the ovulation goal)
- [x] 5.2.7 Confirmation step → single submit → Home
- [x] 5.2.8 Progress indicator, back nav, Framer transitions (reduced-motion respected)
- [x] 5.2.9 Returning users skip onboarding (RequireAuth redirect + Navigate out of the flow)

### Task 6 — Daily Log + Period Tracker
- [x] 6.1.1 PUT /logs upsert by (userId, date)
- [x] 6.1.2 GET /logs?from&to
- [x] 6.1.3 backfill/edit of past dates (same upsert; bounded at 365 days back)
- [x] 6.2.1 startCycle closes the previous cycle and splits on backfill
- [x] 6.2.2 editCycleStart moves intervals only — logs are never reassigned
- [x] 6.2.3 pure interval-planner unit tests (17)
- [ ] 6.3.1–6.3.7 daily-log UI

_(Add Task 7+ items here as you reach them — pull them from TASKLIST.md.)_

---

## Change log
> One line per completed item or notable decision. Newest at top.
- 2026-09-24 — 6.2.x done: boundary arithmetic extracted into `services/cycle-intervals.ts` as pure planners (`planStart`, `planEditStart`) so every edge case is unit-testable without a database — CI has no Postgres, and DB-backed tests would have gone untested there. `services/cycles.ts` now only applies plans: it owns `logsForCycle` (the one place membership is resolved, D2), `toEngineInput` (cycle day from the interval start; Decimal → number at the boundary), `assess`, and `refreshSnapshot` (closed cycles only — live ones are computed on read, D4). Snapshot writes happen outside the boundary transaction, so a derived-data failure can never undo the boundary the user just recorded. Backfilling a start inside existing history splits that cycle and the new half inherits the end of the interval it split, instead of being left open in the middle; only an exact duplicate start date is refused (409). Routes: GET/POST /cycles, PATCH /cycles/:id. A log write inside a closed cycle's range now refreshes that cycle's snapshot. 17 planner tests — one of which caught a real inverted sort comparator that picked the *earliest* neighbouring cycle instead of the latest once three cycles existed. DB smoke test covered split, derived membership, duplicate refusal, start edit and a live assessment.
- 2026-09-24 — 6.1.x done: `/shared/vocab.ts` (MOODS, SYMPTOMS, energy bounds) is the controlled vocabulary both apps and Zod share. `schemas/logs.ts` validates the whole day: every field optional except the date (a day with only a mood is a real day), null means "clear this" while absent means "leave alone", `today` bounds the date (no future days, 365 days of backfill), tempTakenAt is a local HH:mm, a disturbed *reason* requires the flag (the engine only reads the flag), and bbtF is two-decimal-checked with a tolerance because 97.65 * 100 is 9764.999999999998 in binary floating point — an exact test would have rejected real readings. `services/logs.ts` upserts on (userId, date), so saving, editing, backfilling and an offline replay are all one operation (last-write-wins, D5). PUT /logs + GET /logs?from&to. 14 schema tests; DB smoke test confirmed partial edits preserve untouched fields, null clears one field only, and bbtF round-trips exactly as a number.
- 2026-09-24 — Task 5 UI (5.2.1–5.2.9) built. `hooks/useOnboarding.ts` holds the whole flow in a reducer and writes once at the end, so an abandoned onboarding leaves nothing behind; it also owns the condition-exclusivity toggle (picking a real condition drops none/unsure and vice versa, mirroring the API refine), drops the tracking answers if the ovulation goal is unpicked, and exposes `buildRequest` (omits every "not sure" field; `lastPeriodStart` and `today` travel together or not at all). `pages/onboarding/copy.ts` is the single home for option labels and the "why we ask" lines. Steps under `pages/onboarding/steps/` share a `StepLayout`; the tracking step is conditional on the ovulation goal and states plainly that ovulation is confirmed *after* the fact. `components/ui/ChoiceList.tsx` is a new primitive — real radio/checkbox inputs, 48px rows, focus ring on the whole row via `has-focus-visible:` (verified in the built CSS). Container: progress bar (role=progressbar + live step count), back nav, Framer step transitions honouring prefers-reduced-motion, one mutation that seeds the React Query `me` cache and lands on Home. Routing: `/onboarding` sits inside RequireAuth but outside AppShell (no bottom nav mid-flow); RequireAuth now waits for /me and redirects an un-onboarded user in, and the page redirects a finished one out (5.2.9). `lib/dates.ts` (web) supplies the user's own `today` — the server never derives it (D1). Verified: both builds + both lints + repo prettier green, 83 api tests green, /onboarding serves 200 and both write routes answer 401 anonymously. Founder confirmed the click-through in the browser on 2026-09-24.
- 2026-09-24 — 5.1.2 done: `lib/dates.ts` (api) is the new home for plain-calendar-date helpers — dates are carried as UTC midnight so a Postgres `date` round-trips exactly and no local offset or DST transition can shift a day (12 tests, incl. the 2026-11-01 DST case). `onboardingSchema` gained optional `lastPeriodStart` + `today`, with refines: a date requires the client's own `today` (the server must not invent one, D1), cannot be in the future, and cannot be more than `MAX_LAST_PERIOD_AGE_DAYS` (365) back. New `services/onboarding.ts` (completeOnboarding moved out of users.ts) does the profile write and the first-cycle creation in one transaction, so nobody ends up onboarded-but-cycleless; the cycle is left open with no endDate (the next period start closes it, D3) and a re-submit neither duplicates the cycle nor moves onboardedAt. "Not sure" = the field is simply absent: no cycle, no invented start date. Smoke-tested all three paths against the local DB.
- 2026-09-24 — 5.1.1 done: zod 4 added to /api; `src/schemas/users.ts` is the single source of profile input validation (AGE_BANDS / CONDITIONS / GOALS mirroring the Prisma enums, `none`/`unsure` refined as exclusive of real conditions, duplicate-free arrays, avgCycleLength 15–90 and avgPeriodLength 1–15 kept deliberately wide for irregular cycles, displayName trimmed 1–40). `updateProfileSchema` = strict partial, rejects an empty body and anything the client must not set (role, id, onboardedAt); `onboardingSchema` = strict, requires displayName + ageBand, defaults the rest, and treats absent cycle lengths as "not sure". `lib/validate.ts` parseBody → AppError 400 `invalid_input` naming fields only, never the submitted values (health data). services/users.ts gained updateProfile + completeOnboarding (onboardedAt preserved on resubmit). Routes: PATCH /me in routes/me.ts, POST /onboarding in routes/onboarding.ts, both behind requireAuth, both returning the toProfile DTO. 68 api tests green (14 schema, 3 parseBody, 3 guard-order), lint + build clean, service path smoke-tested against the local DB. Known: a bare re-submit of POST /onboarding resets the defaulted fields — correct for a whole-form submit, and the web guard routes onboarded users away from the flow.
- 2026-09-17 — `implementation/cycle-engine-evidence.md` (literature review, status proposal) arrived from the founder's other session. Contains no workbook data. Its rule proposals (peakConfirmDays 3, disagreementToleranceDays 3, defaultLutealAssumption 13 + personal mean, FIGO irregularity by age band, coverage floor before an anovulatory verdict, minValidTemps derived = 9, plausibleRangeF + implausible_reading, rulesVersion on snapshots, 'around day N' wording) are NOT applied — each is tagged for Sivi or the founder and joins the 4.4.0 agenda.
- 2026-09-17 — Task 4 engine built per cycle-engine-plan.md (adopted; phase/estimate deferred to Task 8). api/src/domain/cycle/: temps (integer hundredths, grid snap), coverline (window by readings or calendar days, candidate = snapped max + offset, dip annotation), shift (scan; run walks all readings so a disturbed one breaks it; false-shift slides the window; live → pending; optional dip anchor), peak, luteal, series (Temp Count / Luteal / Peak Count rows), assess (flags in fixed order, confidence tiers), copy (all keys), index. Guard rails: purity test (no Date/prisma/express), inline-prose scanner (assess/shift/peak/luteal/series/coverline hold no sentences), ESLint no-restricted-imports on the folder. 18 typed fixtures + invariants (determinism, order-independence, retrospective prefix test, chart rows). Finding: the plan's 'disturbed' claim was wrong for its own numbers — excluding day 13 pulls a lower reading into the window and moves ovulation to day 15; kept as its own fixture for Sivi (Q2/Q9). 48 api tests green.
- 2026-09-17 — Task 3 verified end to end against the dev pool us-east-2 (SPA app client without a secret — the wizard's default "Traditional web application" type generates one, which the browser SDK cannot use; a probe with ForgotPassword on a nonexistent address reveals a secret requirement). Sign-up → email code → login → /me (one User row) → Profile (email from ID token) → sign-out → wrong-password toast → login all confirmed by the founder in the browser pane. Added confirm-password field. Two dead app clients (knowher-web, knowher-web-spa) remain in the pool; the latter's secret was pasted in chat — delete both.
- 2026-09-17 — Task 3 code built ahead of the checkpoint. api: CONFIG.cognito (lazy), middleware/auth.ts `requireAuth` (aws-jwt-verify access-token verifier built on first use; Bearer parse → verify → upsert User by sub → req.user; any failure → 401 `unauthorized`, token never logged), services/users.ts (upsert + toProfile DTO), GET /me, src/types/express.d.ts, shared `UserProfile` + enum unions; vitest.config.ts carries placeholder pool IDs so the verifier can be constructed for parse-rejection tests (no network); 18 tests green. web: amazon-cognito-identity-js pool factory (null → honest "not set up" screen, never a fake login), AuthProvider (session restore, SRP sign-in, sign-up + confirm + resend, sign-out) with the context object in auth-context.ts for fast refresh, API client attaches a fresh access token per request via setAccessTokenProvider, /login + /signup pages, RequireAuth guard (anon → /login with return path), Profile shows /me + sign-out, sonner toasts, ui/Button + ui/Field primitives. Vite `define: { global: 'globalThis' }` fixes the SDK's Node `global` reference. Bundle now 608 kB (190 kB gzip) — revisit code-splitting in Task 13.
- 2026-09-17 — 3.1.1 done: README section "Auth: AWS Cognito user pool" (SPA app client, email-only sign-in, SRP + refresh flows, IDs → both env files); .env.example comments point to it.
- 2026-09-17 — Task 2 done. Local DB: system PostgreSQL 17 owns 5432, so the compose container now publishes on host port 5433 (compose, .env.example, README updated). Prisma **7.10** (CLI `latest` tag is an 8.0 RC — pinned to 7): `prisma.config.ts` holds the datasource URL, generator `prisma-client` → `api/src/generated/` (gitignored, `npm run build` regenerates), client via `@prisma/adapter-pg`. Schema = implementation/schema.prisma verbatim (models/fields/enums identical), built in 7 validated steps. Migration `init` applied; DATE / numeric(5,2) / unique + index DDL verified in Postgres. Seed (`npm run seed` → `prisma db seed` → tsx prisma/seed.ts): 6 articles (basics ×2, cycle ×3, supporters ×1) + 1 draft post by a seed-only author; runs twice unchanged. CI: api job sets a placeholder DATABASE_URL so `prisma generate` loads; CONFIG.databaseUrl is a lazy getter so HTTP tests need no DB. Known: `npm audit` reports mysql2 (transitive of the prisma CLI, dev-only, unused).
- 2026-09-17 — 1.1.4 done: CI green on main (Prettier + web lint/build + api lint/build/test) at 2c042d2. Task 1 complete.
- 2026-09-17 — 1.4.2 done: vite-plugin-pwa (autoUpdate, app-shell precache), manifest (standalone, theme #B22222, 192/512/maskable icons — placeholder art), SW verified active on the production preview.
- 2026-09-17 — 1.4.1 done: /shared/types.ts (ApiResponse<T>, ApiError) imported by api (respond.ts; tsconfig rootDir '..' so dist = dist/api/src + dist/shared) and web (@shared alias).
- 2026-09-17 — 1.3.6 done: web/src/lib/api/client.ts (typed fetch, envelope unwrap, VITE_API_URL) + health.ts + useHealth (React Query); Home shows "Connected · ok" against the running api.
- 2026-09-17 — 1.3.5 done: framer-motion PageTransition (fade + lift, useOutlet so the exiting page keeps its content, prefers-reduced-motion → instant).
- 2026-09-17 — 1.3.4 done: BottomNav (Home · Log · Learn · Profile), fixed bottom, 56px targets, safe-area padding, aria-current via NavLink; shell = centered max-w-md column.
- 2026-09-17 — 1.3.3 done: react-router-dom 7, createBrowserRouter with AppShell layout + /, /log, /learn, /profile placeholder pages.
- 2026-09-17 — 1.3.2 done: Tailwind v4 via @tailwindcss/vite; brand tokens in src/app/globals.css @theme (primary/accent/bg-soft/ink/calm/muted, radius-card).
- 2026-09-17 — 1.3.1 done: /web React 19 + Vite 8 + TS 5.9 strict (tsc -b), ESLint 10 flat config (react-hooks, react-refresh, prettier); npm run build + lint green.
- 2026-09-17 — 1.2.6 done: helmet, CORS locked to WEB_ORIGIN (array form → no headers for other origins), express.json 100kb limit → 413 envelope, express-rate-limit 300/15min → 429 envelope; CONFIG in src/config.ts; integration tests.
- 2026-09-17 — 1.2.5 done: AppError + errorHandler/notFoundHandler (AppError → status/code, body-parser errors → 413/400, anything else → 500 internal_error, no stack/message leak); tests incl. async throw.
- 2026-09-17 — 1.2.4 done: GET /health → { success:true, data:{ status:'ok' } } (routes/health.ts); verified 200 in browser.
- 2026-09-17 — 1.2.3 done: api/src/lib/respond.ts — ok()/fail() + ApiResponse<T> envelope type; Vitest 5 added with `npm test` (4 unit tests green); tests excluded from tsc build. Project moved to Node 24 LTS (.nvmrc, engines, @types/node 24, README, plan) because Node 20 is EOL and Vitest 5 needs ≥ 22.
- 2026-09-17 — 1.2.2 done: `npm run dev` (tsx watch, boots on :4000 in <1 s) + `npm run lint` (ESLint 10 flat config, typescript-eslint 8, eslint-config-prettier; no-any / no-unused / no-var enforced). TypeScript pinned to 5.9.3 because typescript-eslint requires TS < 6.1.
- 2026-09-17 — 1.2.1 done: /api with Express 5.2, TypeScript 7.0 (strict, NodeNext, noUnused*), dotenv 18; src/app.ts (createApp) + src/index.ts (bootstrap, PORT env); `npm run build` compiles to dist/.
- 2026-09-17 — 1.1.4 in progress: .github/workflows/ci.yml (Prettier job + web/api matrix: lint, build, api tests) on every push/PR; remote origin added and main + feature/repo-tooling pushed.
- 2026-09-17 — 1.1.3 done: api/.env.example (PORT, WEB_ORIGIN, DATABASE_URL, AWS_REGION, COGNITO_*; SENTRY/S3/VAPID commented for later) + web/.env.example (VITE_API_URL, VITE_AWS_REGION, VITE_COGNITO_*); README Environment section.
- 2026-09-17 — 1.1.2 done: root .editorconfig, .prettierrc (singleQuote, printWidth 100), .prettierignore (founder docs + prisma excluded), root package.json with prettier 3.9.8 pinned + format/format:check scripts; README + compose reformatted.
- 2026-09-17 — 1.1.1 done: git init (main) + branch feature/repo-tooling; /web /api /shared; README; .gitignore; .nvmrc; docker-compose.yml (Postgres 16, local only).
- (start) Project docs + task list created.
