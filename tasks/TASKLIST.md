# knowHer — Detailed Task List (execute in order)

How to use this: work **top to bottom**. Do ONE numbered item at a time (e.g. Task 1.2.3). After each, run its acceptance check (AC), mark it `[x]` here, AND record it in `@context/progress.md`. Do not pull later work forward. If an item needs something not yet built, stop and flag it.

Numbering: **Task N** = phase, **Task N.M** = milestone, **Task N.M.i** = the individual item you execute.

Conventions:
- `[web]` frontend · `[api]` backend · `[db]` database · `[infra]` config/tooling · `[test]` tests
- Each item is intended to be small (roughly one focused session of work).
- "AC" = acceptance criteria (how you know it's done).

Legend for status: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Task 1 — SCAFFOLDING

### Task 1.1 — Repo & tooling
- [x] **1.1.1** `[infra]` Create root repo with `/web`, `/api`, `/shared`, root `README.md`, `.gitignore`. AC: folders exist, git initialized.
- [x] **1.1.2** `[infra]` Add root `.editorconfig` and Prettier config shared by both apps. AC: `prettier --check` runs.
- [x] **1.1.3** `[infra]` Create `.env.example` in `/api` and `/web` with placeholder keys (DB, Cognito, S3, API URL). AC: no real secrets; documented.
- [~] **1.1.4** `[infra]` Add GitHub Actions CI: lint + build (web & api) + engine tests on every push/PR. AC: pipeline green on main.

### Task 1.2 — Backend skeleton `[api]`
- [x] **1.2.1** Init Node + Express + TypeScript (strict). AC: `npm run build` compiles.
- [ ] **1.2.2** Add `npm run dev` (ts-node/tsx, port 4000) and `npm run lint`. AC: dev server boots.
- [ ] **1.2.3** Add `{ success, data, error }` response helper + typed wrapper. AC: helper unit-importable.
- [ ] **1.2.4** Implement `GET /health` → `{ success:true, data:{status:"ok"} }`. AC: 200 in browser/curl.
- [ ] **1.2.5** Add centralized error-handling middleware. AC: thrown error returns shaped JSON, no stack leak.
- [ ] **1.2.6** Production hardening (architecture §5b): CORS locked to `WEB_ORIGIN` (no wildcard), `helmet`, JSON body limit (~100 kB), `express-rate-limit` baseline. AC: request from a non-allowed origin gets no CORS headers; oversize body → 413; security headers present.
- [ ] **1.2.7** `[infra]` Error monitoring (Sentry or similar) on api + web with scrubbing so no health fields ever leave in an event. **Human checkpoint:** blocked until the founder provides DSNs or decides to skip error monitoring for MVP. Never mock.

### Task 1.3 — Frontend skeleton `[web]`
- [ ] **1.3.1** Init React + Vite + TypeScript (strict). AC: `npm run build` compiles.
- [ ] **1.3.2** Install & configure Tailwind v4 via `@theme` in `globals.css` with brand tokens (primary #B22222 etc). AC: a tokened color renders.
- [ ] **1.3.3** Install React Router; add routes `/`, `/log`, `/learn`, `/profile` with placeholder pages. AC: routes navigate.
- [ ] **1.3.4** Build **mobile-first bottom nav** (Home · Log · Learn · Profile); desktop = centered narrow column. AC: nav works on mobile viewport.
- [ ] **1.3.5** Install Framer Motion; add one subtle page transition. AC: transition visible.
- [ ] **1.3.6** Create typed API client (`web/src/lib/api/`) with base URL from env + health call on Home. AC: Home shows API health status.

### Task 1.4 — Shared types & PWA
- [ ] **1.4.1** `[shared]` Add `ApiResponse<T>` type; import in both apps. AC: both compile using it.
- [ ] **1.4.2** `[web]` Add PWA manifest + icons + service worker (app-shell cache). AC: app is installable; Lighthouse PWA installable check passes.

**Task 1 done when:** both apps run via `npm run dev`, health-check works end-to-end, shell + nav render, PWA installable, both builds pass.

---

## Task 2 — DATABASE

### Task 2.1 — Prisma setup `[db]`
- [ ] **2.1.1** Install & init Prisma in `/api`; set `DATABASE_URL`. AC: `prisma` CLI runs.
- [ ] **2.1.2** Add scripts `migrate:dev`, `migrate:deploy`, `migrate:status`. AC: scripts run.
- [ ] **2.1.3** Document: migrations only, never `db push` (in README). AC: note present.
- [ ] **2.1.4** `[infra]` Document the date rule: `DailyLog.date` and all cycle boundary dates are plain local **calendar dates** (`YYYY-MM-DD`) chosen client-side — never derived from a UTC timestamp server-side. Zod validates the shape; Prisma uses `@db.Date`. AC: rule added to coding-standards + schema comment.

### Task 2.2 — Schema `[db]`
- [ ] **2.2.1** Define enums: `Flow`, `CervicalMucus(dry|sticky|watery|eggwhite)`, `CervixPosition(F|M|S)`. AC: schema validates.
- [ ] **2.2.2** Define `User` model (per PRD §7). AC: validates.
- [ ] **2.2.3** Define `Cycle` model (incl. coverlineF, ovulationDay, peakDay, lutealLength, isAnovulatory, expectedOvulation, confidenceNote). AC: validates.
- [ ] **2.2.4** Define `DailyLog` model (raw fields incl. bbtF, tempTakenAt, isDisturbed, disturbedReason, mucus, cervix, mood, energy, symptoms json). Keyed by `userId+date`; **no `cycleId` FK** — cycle membership is derived from `Cycle` date ranges at query time. AC: validates.
- [ ] **2.2.5** Define `CycleSummary` model (incl. symptomAggregate, energyAggregate). AC: validates.
- [ ] **2.2.6** Define `BlogPost` + `KnowledgeArticle` models. AC: validates.
- [ ] **2.2.7** Add relations + indexes (`DailyLog(userId,date)` unique, `Cycle(userId,startDate)`). AC: validates.

### Task 2.3 — Migrate & seed `[db]`
- [ ] **2.3.1** Run first `migrate:dev`; commit migration. AC: DB has tables; `migrate:status` in sync.
- [ ] **2.3.2** Write seed: a few KnowledgeArticles + 1 BlogPost (no users). AC: `npm run seed` populates.

**Task 2 done when:** schema migrated cleanly, client generates, seed runs.

---

## Task 3 — AUTH (AWS Cognito)

### Task 3.1 — Cognito + API guard `[api]`
- [ ] **3.1.1** Document Cognito user pool setup (email+password) in README/.env.example. AC: steps written.
- [ ] **3.1.2** Add JWT-verify middleware (validate Cognito token, attach userId from `sub`). AC: invalid token → 401.
- [ ] **3.1.3** Add `requireAuth` guard usable per-route. AC: guarded test route rejects anon.
- [ ] **3.1.4** On first authed request, upsert `User` by `cognitoSub`. AC: row created once.
- [ ] **3.1.5** Implement `GET /me` (returns/creates profile). AC: returns user JSON.

### Task 3.2 — Frontend auth `[web]`
- [ ] **3.2.1** Add auth SDK/config; sign-up UI (on-brand, mobile-first). AC: can create account.
- [ ] **3.2.2** Log-in UI + store token; attach token to API client. AC: `/me` succeeds after login.
- [ ] **3.2.3** Log-out; clear token/state. AC: returns to login.
- [ ] **3.2.4** Route guard: anon → login; authed → shell. AC: guarded routes protected.
- [ ] **3.2.5** Loading + error states on auth forms (toasts). AC: bad creds show friendly error.

**Task 3 done when:** full sign up → login → guarded home → logout works; protected API enforced.

---

## Task 4 — CYCLE RULE ENGINE (pure, tested)

> No DB, no HTTP, no UI in this module. Lives in `api/src/domain/cycle/`.

### Task 4.1 — Structure & config `[api]`
- [ ] **4.1.1** Create `domain/cycle/` with `index.ts`, `rules.ts`, `copy.ts`, `types.ts`. AC: imports compile.
- [ ] **4.1.2** Define `CYCLE_RULES` config (coverlineWindow=6, consecutiveRises=3, minDataPoints=4, excludeDisturbed=true, invalidateFalseShift=true) with comments. AC: single source of tunables.
- [ ] **4.1.3** Define input/output types (`CycleLog`, `CycleAssessment`). AC: types exported.

### Task 4.2 — Pure functions `[api]`
- [ ] **4.2.1** `computeCoverline(logs, rules)` → °F + days used | null. AC: returns value on clean fixture.
- [ ] **4.2.2** `detectOvulation(logs, rules)` → day | null using **3-over-6**; mucus+drop as corroboration flag. AC: correct day on clean fixture.
- [ ] **4.2.3** `detectPeakDay(logs)` → last egg-white day; confirmed only after 2–3 non-eggwhite days. AC: correct on fixture.
- [ ] **4.2.4** `computeLutealLength(logs, ovulationDay)`. AC: correct count.
- [ ] **4.2.5** `assessCycle(logs, rules)` → full summary `{coverlineF, ovulationDay, peakDay, lutealLength, isAnovulatory, confidence, flags[]}`. AC: composes the above.

### Task 4.3 — Edge cases `[api]`
- [ ] **4.3.1** Anovulatory (no shift) → `isAnovulatory:true`, no throw. AC: fixture passes.
- [ ] **4.3.2** Missing days: compute if ≥ minDataPoints else null + "low_data" flag. AC: fixture passes.
- [ ] **4.3.3** Disturbed readings excluded from coverline window per config. AC: fixture passes.
- [ ] **4.3.4** False shift (cross then drop) invalidated; scan continues. AC: fixture passes.
- [ ] **4.3.5** Signal disagreement (mucus vs temp) → both in `flags`. AC: fixture passes.

### Task 4.4 — Copy & tests `[test]`
- [ ] **4.4.0** **Gate:** get Sivi's sign-off on the fixture set (input cycle data → expected coverline / ovulation day / peak day) BEFORE writing tests. This turns her method into the spec. AC: approved fixtures checked into the repo.
- [ ] **4.4.1** `copy.ts` content map for states (anovulatory, low_data, disagreement). AC: no inline state strings in logic.
- [ ] **4.4.2** Unit tests + fixtures: clean, anovulatory, disturbed, low-data, false-shift. AC: all green.
- [ ] **4.4.3** Test that changing a `CYCLE_RULES` value changes output. AC: proves configurability.

**Task 4 done when:** all fixtures pass, engine has zero DB/HTTP imports, rules editable in one place.

---

## Task 5 — ONBOARDING

### Task 5.1 — API `[api]`
- [ ] **5.1.1** `PATCH /me` / `POST /onboarding` saves profile, conditions, goals, trackingBBT (Zod-validated). AC: persists.
- [ ] **5.1.2** If last-period date given → create first `Cycle`; if "not sure" → open cycle / honest start. AC: cycle row correct per input.

### Task 5.2 — Flow UI `[web]`
- [ ] **5.2.1** Step 1 Welcome (tone). AC: renders, advances.
- [ ] **5.2.2** Step 2 Profile (name, age band). AC: captured.
- [ ] **5.2.3** Step 3 Period history with **"not sure"** option. AC: skip path works.
- [ ] **5.2.4** Step 4 Health context (PCOD/PMDD/Endo/none/unsure). AC: captured.
- [ ] **5.2.5** Step 5 Goals (multi-select). AC: captured.
- [ ] **5.2.6** Step 6 (conditional) BBT/mucus setup if ovulation goal chosen. AC: shows only when relevant.
- [ ] **5.2.7** Step 7 Confirmation → dashboard. AC: lands on Home.
- [ ] **5.2.8** Progress indicator, back nav, Framer transitions. AC: smooth on mobile.
- [ ] **5.2.9** Returning users skip onboarding. AC: completed users go straight to app.

**Task 5 done when:** new user finishes onboarding, data persists, first cycle (or honest start) exists.

---

## Task 6 — DAILY LOG + PERIOD TRACKER

### Task 6.1 — Log API `[api]`
- [ ] **6.1.1** `POST/PUT /logs` upsert by userId+date (all fields, Zod). AC: create + update by date works.
- [ ] **6.1.2** `GET /logs?from&to`. AC: returns range.
- [ ] **6.1.3** Allow backfill/edit of any past date. AC: past date writes succeed.

### Task 6.2 — Period→cycle logic `[api]`
- [ ] **6.2.1** Period **start** creates new `Cycle` interval + closes prior (endDate, length). Logs are never reassigned — membership is derived from date ranges. AC: boundaries correct.
- [ ] **6.2.2** Editing a start date updates the cycle interval(s) only. AC: no overlapping intervals; range queries return the right logs.
- [ ] **6.2.3** `[test]` Unit tests for cycle-boundary logic (start mid-history, edit start date, back-to-back periods). AC: green.

### Task 6.3 — Daily Log UI `[web]`
- [ ] **6.3.1** Bottom **drawer/sheet** for today: mood, energy, symptoms. AC: saves.
- [ ] **6.3.2** Flow control shown on bleeding days. AC: conditional render.
- [ ] **6.3.3** BBT (°F) + time taken + "unusual reading" toggle — only if trackingBBT. AC: gated correctly.
- [ ] **6.3.4** Mucus type picker (dry→sticky→watery→eggwhite) with reference hint — only if tracking. AC: gated + hint.
- [ ] **6.3.5** Cervix position (F/M/S) — only if tracking. AC: gated.
- [ ] **6.3.6** Date switcher to backfill past days. AC: can log yesterday.
- [ ] **6.3.7** Save/edit states + toasts. AC: friendly feedback.

**Task 6 done when:** user logs today + past days; period start manages cycles; tracker fields gated to trackers.

---

## Task 7 — CYCLE TRACKER UI

### Task 7.1 — Assess API `[api]`
- [ ] **7.1.1** `GET /cycles/:id/assessment` runs `assessCycle` on logs fetched by the cycle's date range. AC: returns summary object.

### Task 7.2 — Chart `[web]`
- [ ] **7.2.1** Recharts BBT chart: X=cycle day, Y=°F scaled for the ~0.4°F shift. AC: temps plot.
- [ ] **7.2.2** Draw **coverline** as reference line when present. AC: line appears on ovulatory fixture.
- [ ] **7.2.3** Mark ovulation day, peak day, shade luteal phase. AC: markers correct.
- [ ] **7.2.4** Mucus symbols row aligned to cycle days (Sivi's symbols). AC: aligned.

### Task 7.3 — Honest states `[web]`
- [ ] **7.3.1** Anovulatory → calm message (from copy map). AC: no error styling.
- [ ] **7.3.2** Low data → "keep logging" message. AC: shows under threshold.
- [ ] **7.3.3** Signal disagreement → show both. AC: message renders.
- [ ] **7.3.4** Verify: no cycle math in this screen (only calls API). AC: review passes.

**Task 7 done when:** ovulatory cycle shows full chart; anovulatory/low-data show honest states; UI does no math.

---

## Task 8 — DASHBOARD

- [ ] **8.0.1** `[api]` `GET /dashboard`: current phase, expected-ovulation estimate (formula), phase→insight. AC: returns fields.
- [ ] **8.0.2** `[web]` Today card: cycle day + phase + warm insight (copy map). AC: renders for normal cycle.
- [ ] **8.0.3** `[web]` Expected ovulation date, labelled as estimate. AC: label present.
- [ ] **8.0.4** `[web]` Quick link into today's Daily Log. AC: navigates.
- [ ] **8.0.5** `[web]` Honest fallback for long/irregular/insufficient history. AC: shows instead of asserting phase.

**Task 8 done when:** dashboard shows correct phase+insight normally and honest fallback otherwise.

---

## Task 9 — CYCLE HISTORY (calendar)

- [ ] **9.0.1** `[api]` `GET /history?month` → logged days + markers. AC: returns data.
- [ ] **9.0.2** `[web]` Month calendar, mobile-first, period/spotting symbols. AC: renders real data.
- [ ] **9.0.3** `[web]` Tap day → read-only entry + edit shortcut. AC: opens entry.
- [ ] **9.0.4** `[web]` Month navigation; **no predicted days**. AC: no forecast shown anywhere.

**Task 9 done when:** calendar shows only real logs; day detail works; zero predictions on calendar.

---

## Task 10 — TRENDS

- [ ] **10.0.1** `[api]` `GET /trends` from `CycleSummary` (+ recent logs): cycle length, luteal length, symptom freq, energy by phase. AC: returns series.
- [ ] **10.0.2** `[web]` Cycle length trend chart. AC: renders.
- [ ] **10.0.3** `[web]` Luteal length trend. AC: renders.
- [ ] **10.0.4** `[web]` Symptom pattern view. AC: renders.
- [ ] **10.0.5** `[web]` Energy-by-phase view; warm framing. AC: renders, non-clinical tone.

**Task 10 done when:** trends render from summaries+recent logs and survive raw-log deletion in principle.

---

## Task 11 — KNOWLEDGE TAB + ADMIN

- [ ] **11.0.1** `[api]` `GET /knowledge`, `GET /blog`, `GET /blog/:slug` (+ audience filter). AC: return content.
- [ ] **11.0.2** `[web]` Learn tab: sections Basics · From Sivi · For Supporters; markdown render; mobile reading view. AC: browsable.
- [ ] **11.0.3** `[api]` Author role + role check; BlogPost create/edit/publish/draft endpoints. AC: non-author blocked.
- [ ] **11.0.4** `[web]` Admin panel (role-gated) with markdown editor + publish/unpublish. AC: author publishes a post.
- [ ] **11.0.5** Verify published post appears publicly; drafts don't. AC: visibility correct.
- [ ] **11.0.6** Decide S3's role: add blog/knowledge image upload (presigned URLs) here, or drop S3 from the stack entirely. AC: decision recorded; if kept, an image renders in a published post.

**Task 11 done when:** readers browse by section; an author publishes a live post; non-authors can't access admin.

---

## Task 12 — ACCOUNT & PRIVACY

- [ ] **12.0.1** `[api]` `GET /account/export` → full user data JSON (and/or ZIP). AC: downloads complete data.
- [ ] **12.0.2** `[web]` Export button in Profile. AC: triggers download.
- [ ] **12.0.3** `[api]` `DELETE /account` → cascade delete + remove Cognito user. AC: all rows gone.
- [ ] **12.0.4** `[web]` Delete flow with confirmation; logs out after. AC: account removed, session cleared.
> **Retention job: DEFERRED post-launch.** The `CycleSummary` schema + aggregates ship in Task 2, but the raw-log deletion job does not ship in MVP. Decide **automatic vs opt-in** after launch and before any user reaches ~6 cycles (revisit around month 4–5). The export (12.0.1) must clearly state what it contains.

### Deferred (post-launch)
- [ ] **12.1.1** `[api]` Retention job: cycles older than window → write/verify `CycleSummary` (with aggregates) then delete raw `DailyLog`. Idempotent, logged, never deletes before summary exists. Respect the automatic-vs-opt-in decision. AC: old cycle compressed, trends still work.
- [ ] **12.1.2** `[test]` Test retention idempotency + trend survival. AC: green.

**Task 12 done when:** export and delete work end-to-end (retention intentionally deferred).

---

## Task 13 — PWA POLISH & DAILY NUDGE

- [ ] **13.0.1** `[api]` Push infra: VAPID keys, store push subscriptions, scheduled worker fires the nudge at each user's chosen local time. AC: test push delivered.
- [ ] **13.0.2** `[web]` Opt-in nudge UI + subscription; time set in Profile; respect opt-out. Note: iOS requires 16.4+ **and** the PWA installed to home screen — set expectations in-app. AC: fires at chosen time on a subscribed device.
- [ ] **13.0.3** `[web]` Offline: queue daily logs (upsert-by-date makes sync last-write-wins), sync when online; cache shell + **last-fetched** dashboard. Fresh assessments require a connection (engine is server-side by design). AC: offline log syncs later; stale dashboard clearly dated.
- [ ] **13.0.4** `[web]` Loading skeletons, empty states, toast pass. AC: no raw spinners/blank states.
- [ ] **13.0.5** `[web]` Framer Motion polish pass. AC: consistent motion.
- [ ] **13.0.6** `[web]` Accessibility + touch-target audit (mobile). AC: targets ≥44px, labels present.

**Task 13 done when:** nudge works, offline logging syncs, app feels smooth and installable.

---

## CROSS-CUTTING (verify continuously, not a phase)
- [ ] Health-safety rules honored everywhere (no diagnosis, retrospective ovulation only, no "safe" signal, calm anovulatory). 
- [ ] Cycle rules stay ONLY in `domain/cycle/` (volatility separation intact).
- [ ] No health data in URLs or logs. Zod on every input. Cognito verified on every protected route.
- [ ] Every commit: lint + build pass; engine changes carry tests.
