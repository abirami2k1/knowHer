# knowHer — Build Progress

Living status file. **Update this whenever a task item is started or finished.**
The detailed items live in `@tasks/TASKLIST.md`; this file is the at-a-glance tracker + log.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done

Last updated: 2026-10-09

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
- Task: **13.0.1** — push infra. Blocked on the 13.0.1 VAPID checkpoint (approve generating the key pair); 13.0.3–13.0.6 do not need it.
- Branch: `feature/account` (Task 12, awaiting commit approval). Task 11 is merged and pushed (6254500).
- Notes: 12.0.3 code is complete but its AC (Cognito user actually removed) needs the founder's IAM credentials — until then deletion fails closed. 11.0.6, 4.4.0 and 1.2.7 remain open.

## Phase status (high level)
- [x] Task 1 — Scaffolding & app shell (1.2.7 Sentry deferred to founder checkpoint)
- [x] Task 2 — Database schema & migrations
- [x] Task 3 — Auth (Cognito)
- [~] Task 4 — Cycle rule engine (pure + tests) — code + synthetic fixtures done; 4.4.0 Sivi gate open
- [x] Task 5 — Onboarding
- [x] Task 6 — Daily Log + Period Tracker (founder browser click-through pending)
- [x] Task 7 — Cycle Tracker UI (founder browser look pending)
- [x] Task 8 — Dashboard (founder browser look pending)
- [x] Task 9 — Cycle History (calendar)
- [x] Task 10 — Trends (founder browser look pending)
- [~] Task 11 — Knowledge Tab + Admin (11.0.6 S3 decision open; founder browser look pending)
- [~] Task 12 — Account & Privacy (12.0.3 Cognito step awaits IAM credentials; retention deferred)
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
- [x] 6.3.1 bottom sheet for the day (mood, energy, symptoms)
- [x] 6.3.2 flow control (always available; it is what triggers the period-start ask)
- [x] 6.3.3 BBT + time + unusual-reading toggle, gated on trackingBBT
- [x] 6.3.4 mucus picker with reference hints, gated on trackingMucus
- [x] 6.3.5 cervix position, gated on trackingMucus
- [x] 6.3.6 date switcher for backfill (no future days)
- [x] 6.3.7 save/edit states + toasts

### Task 7 — Cycle Tracker UI
- [x] 7.1.1 GET /cycles/:id/assessment (engine on read + chart rows + copy)
- [x] 7.2.1 Recharts BBT chart, Y domain scaled for the ~0.4°F shift
- [x] 7.2.2 coverline as a reference line
- [x] 7.2.3 ovulation + peak markers, luteal shading
- [x] 7.2.4 mucus symbol row aligned by cycle day
- [x] 7.3.1–7.3.3 anovulatory / low-data / disagreement states, all from the API's copy map
- [x] 7.3.4 no cycle math on the screen — only chart scaling

### Task 8 — Dashboard
- [x] 8.0.1 GET /dashboard?today= (phase, estimate, insight)
- [x] 8.0.2 today card: cycle day + phase + insight, from the copy map
- [x] 8.0.3 expected ovulation, labelled an estimate and never shown under a fallback
- [x] 8.0.4 quick links into the daily log and the chart
- [x] 8.0.5 honest fallback for long / irregular / no-cycle

### Task 9 — Cycle History (calendar)
- [x] 9.0.1 GET /history?month — logged days only
- [x] 9.0.2 month calendar, mobile-first, flow-weighted day cells
- [x] 9.0.3 tap a day → read-only sheet + edit shortcut (/log?date=)
- [x] 9.0.4 month navigation; no predicted days anywhere

### Task 10 — Trends
- [x] 10.0.1 GET /trends?today= — closed-cycle lengths + luteal (Cycle ∪ CycleSummary, deduped), energy by phase, symptom patterns
- [x] 10.0.2 cycle length trend chart (typical line, range)
- [x] 10.0.3 luteal length trend (confirmed cycles only)
- [x] 10.0.4 symptom pattern view
- [x] 10.0.5 energy-by-phase view, energy words not scores

### Task 11 — Knowledge Tab + Admin
- [x] 11.0.1 GET /knowledge, GET /blog?audience, GET /blog/:slug — published only, 'both' in either section
- [x] 11.0.2 Learn tab (Basics · From Sivi · For supporters) + reading view, sanitized markdown
- [x] 11.0.3 requireRole('author') + create / edit / publish / unpublish + GET /admin/posts
- [x] 11.0.4 role-gated admin panel: list, markdown editor with preview, publish/unpublish
- [x] 11.0.5 visibility verified against the local DB (drafts hidden, 404 by slug; published appears)
- [ ] 11.0.6 S3 keep or drop — **founder deferred ("decide later")**

### Task 12 — Account & Privacy
- [x] 12.0.1 GET /account/export — profile, cycles, daily logs, summaries (+ own posts for authors), plain-words note
- [x] 12.0.2 "Download my data" on Profile → knowher-export-YYYY-MM-DD.json
- [~] 12.0.3 DELETE /account — D8 ordering + PendingCognitoDeletion retry; DB side verified; **Cognito step needs founder IAM credentials** (fails closed until then)
- [x] 12.0.4 delete sheet with typed confirmation → signed out
- [ ] 12.1.x retention — deferred post-launch

_(Add Task 13+ items here as you reach them — pull them from TASKLIST.md.)_

---

## Change log
> One line per completed item or notable decision. Newest at top.
- 2026-10-09 — Task 12 built (retention deferred as planned). **Export:** `services/account.ts exportAccount` → `{ exportedAt, note, profile, cycles, dailyLogs, cycleSummaries, blogPosts }` reusing the existing DTO mappers, so the file matches what the app shows; no Cognito subject; `Cache-Control: no-store`. Web downloads it as a Blob (it never sits in a URL). **Delete (D8):** migration `pending_cognito_deletion` adds `PendingCognitoDeletion { cognitoSub @unique, attempts }` (no health data). `lib/identity-admin.ts` wraps AdminDisableUser / AdminEnableUser / AdminDeleteUser (@aws-sdk/client-cognito-identity-provider 3.1141.0; credentials from the standard AWS chain, never in code; username = sub because the pool signs in by email; UserNotFound on delete counts as done). `deleteAccount` order: refuse an author with posts (409 `author_has_posts`, before touching anything) → disable (failure → 503 `deletion_unavailable`, **nothing deleted — fails closed**) → `prisma.user.delete` (cascades Cycle, DailyLog, CycleSummary; on failure the user is **re-enabled** so she is never locked out of an account that still holds her data — a compensation step beyond D8's text) → remove from Cognito (failure → queued, outcome `deleted_identity_pending`). `retryPendingDeletions` runs on API boot and every 24 h (unref'd interval, logs counts only). API also requires `{ confirm: 'delete my account' }`. 8 new tests: the four D8 paths with recorded step order, the author block, the phrase schema, anonymous 401s. **Verified on the local DB:** export of the founder's account (4 cycles, 117 logs); with no IAM credentials on this machine the real path returned 503 and left every row; with Cognito faked as reachable, a throwaway user's cycle, log and summary all cascaded (0/0/0/0 left); the seed author was refused with 409. Web: Profile "Your data" card (Download my data · Delete my account), `DeleteAccountSheet` (says exactly what goes, typed phrase, shows the API's message on 409/503), success signs out and clears the query cache. Known: a still-valid access token used in the seconds after deletion would make requireAuth recreate an empty User row (JWKS verification can't see revocation); it holds no data and the client signs out immediately — acceptable for MVP. README + .env.example document the IAM policy.
- 2026-10-09 — Task 11 (11.0.1–11.0.5) done; 11.0.6 S3 deferred by the founder. **API:** `middleware/require-role.ts` (`requireRole('author')` reads the DB user, D7 → 403 `forbidden`), `schemas/content.ts` (strict queries; slug regex; posts: title ≤120, body ≤50k chars to stay inside the 100 kB JSON limit; isPublished/authorId/slug cannot be set by the client), `services/content.ts` — the `isPublished: true` filter lives in every public query; a draft fetched by slug answers 404 exactly like a missing post; new posts always start as drafts; the first publication date survives unpublish → republish so a corrected post doesn't jump to the top; any author can edit any post (small editorial team; the seed draft belongs to a placeholder). Slugs from `lib/slug.ts` (`-2`, `-3` on collision; fixed after creation so links keep working). Routes: GET /knowledge, GET /blog, GET /blog/:slug (all requireAuth, per the architecture table), POST /blog, PATCH /blog/:id, POST /blog/:id/(un)publish, and **GET /admin/posts — added beyond the architecture table**, because the admin panel cannot list drafts without it. `npm run set-role` (api/prisma/set-role.ts, documented in README) grants/revokes the author role by Cognito sub — no hand-edited rows. 18 new tests (schemas, role guard, anonymous 401 on all 8 content routes, slugify). **Verified against the local DB:** drafts hidden from lists and 404 by slug; publish sets the date; audience `both` shows in both sections; duplicate titles get `-2`; unpublish removes it again; temporary posts deleted afterwards. **Web:** react-markdown 10.1 + rehype-sanitize 6.0 in `components/content/Markdown.tsx` (no raw HTML; checked that `<script>`, `onerror` and `javascript:` links are stripped and safe links kept; headings shifted down one level under the page h1). Learn tab with section pills held in `?section=` so Back returns to the same section; one `Reader` page for articles and posts (/learn/:kind/:slug). Admin: `RequireAuthor` route guard (courtesy only — the API is the boundary), /admin list with Draft/Published badges, /admin/new and /admin/:id editor (title, audience, markdown textarea with a preview that uses the reader's renderer, save separate from publish, publish disabled while there are unsaved edits). Profile shows a "Write and publish posts" link for authors only. Known: JS bundle is now 1.19 MB (356 kB gzip) — code-split Reader/admin/charts in Task 13. `npm audit` in /web flags serialize-javascript and source-map-js (pre-existing build tooling, not from this task).
- 2026-10-09 — Task 10 done. **Engine:** `domain/cycle/trends.ts` (pure, in the purity + inline-prose guards). `dayPlacer` places a past day in a phase only when there is something to place it by: a confirmed shift → `confirmed`; a closed cycle with no shift → counted back from its known end (`length − defaultLutealAssumption`, floored) → `estimated`; an anovulatory cycle or an unconfirmed live one → bleeding days only, the rest unplaced (nothing forecast, and no luteal days invented for a cycle with no ovulation). Phase boundaries mirror the dashboard's. `energyByPhase` withholds an average below `trendMinDaysPerPhase` (3) days; `symptomPatterns` names the phase a symptom turns up in *relative to days logged in that phase* (follicular days are simply more numerous), and declines on ties or rare symptoms. `mergeCycleHistory` is the D4 precedence rule: Cycle row wins, CycleSummary only stands in for a pruned cycle, deduped on start date. New rules keys `trendRecentCycles` (6, matching the planned retention window, so energy/symptom patterns read the same once retention ships) and `trendMinDaysPerPhase`; new `trends.*` copy keys (describe, never grade — no "short luteal phase" judgement). 14 new engine tests incl. config flips. **API:** `services/trends.ts` (`completedCycles` + `buildTrends`; closed cycles use the stored snapshot, the live one runs the engine as of her today), `GET /trends?today=` (strict Zod). The dashboard now counts her history through `completedCycles` too, closing the "Task 10 unions CycleSummary here" note in services/dashboard.ts. Smoke-tested on the local DB: 3 closed cycles + 1 live, 117 logs; anovulatory and live cycles leave non-bleeding days unplaced; with a temporary conflicting summary (99 days) the Cycle row's 34 won and an older pruned cycle appeared from its summary, then both rows were removed. **Web:** /trends page (Home shortcut), `TrendLine` (one Recharts line per measure, typical as a dashed reference, tooltip, screen-reader list), `EnergyByPhase` (bars named by phase on the axis + a list in her own energy words — "Steady", not "2.8/5"), `SymptomPatterns` (top 6, relative bar, "most often in your luteal days" chip). **Palette finding:** the dataviz validator fails the phase inks as a categorical set (follicular and luteal low-chroma; ovulatory↔follicular ΔE 14.9, just under the 15 normal-vision floor). Not retuned here — they are brand tokens already tuned for text contrast — so every Trends chart names phases in text and colour never carries identity alone. Worth revisiting in 13.0.6. Known: `CycleSummary` has no `isAnovulatory` column; summaries are reported as not-anovulatory — a decision for the retention design.
- 2026-09-24 — Task 9 done. `GET /history?month=YYYY-MM` returns logged days only — date, flow, whether a temperature exists, how many symptoms, and whether she marked a period start. No estimate, expected period or phase reaches it: a calendar is where a guess reads most like a fact, so the service simply never produces one (D4), and the Zod schema is `.strict()` so no other filter can be added by query either. Web: `lib/month.ts` (Monday-first grid, local calendar terms throughout), `MonthCalendar` (flow weight carries colour — spotting a tint, heavy a solid fill; a dot for a logged temperature, another for symptoms, a corner mark for a period start; future days dimmed; each cell carries a spoken label like "14 September: period started, medium flow, temperature logged"), `DayDetailSheet` (reuses the log's own DaySummary so a day reads identically wherever she meets it, with one way through to editing). The Log page now accepts `?date=` so the calendar can hand a specific day to the editor. Reached from a third Home shortcut. 145 api tests green; smoke-checked against the seeded account (September: 23 logged days, one cycle start; February: empty).
- 2026-09-24 — **Visual design pass (founder: "UI is very basic"; direction chosen: warm editorial, whole app in one pass).** Foundations: Fraunces + Inter bundled via @fontsource (not the Google CDN, so an installed PWA looks like itself offline); tokens rebuilt in globals.css — paper/surface/sunken instead of flat white, ink/ink-soft/muted, a hairline `line` colour, display/title/eyebrow type scale, two soft shadows, and a `grain` utility so large warm fields do not read as plastic. **Cycle phases are now tokens** (menstrual/follicular/ovulatory/luteal/unknown, each an ink + a tint) applied through `web/src/lib/phase.ts`, so a phase looks the same wherever it appears — previously the app knew her phase and rendered it identically to every other day. New `ui/Card` (+ `Eyebrow`) replaces the repeated white-box-with-red-ring; Button and ChoiceList reworked (ChoiceList gained a `pills` layout for short labels); Sheet gained a grab handle and softer chrome; BottomNav gained the chart tab and an active mark rather than colour alone. Screens rebuilt: Home (phase-tinted hero, a CycleRibbon showing today against her typical length with ovulation solid when confirmed and hollow when estimated, shortcut cards), Log, Cycle, all seven onboarding steps, auth, Profile, Learn. Two display-only fields added to DashboardDto (`confirmedOvulationDay`, `cycleLengthTypical`) so the ribbon draws server-decided numbers rather than computing its own. PWA theme colour and the coding-standards token example updated to match. **Contrast was measured, not eyeballed:** the first palette failed WCAG AA for small text on `muted` (3.86), follicular (3.24) and ovulatory (2.54 on its own tint); those inks were darkened until the lowest pair in the system is 4.63. 142 api tests, both builds, both lints and repo prettier green.
- 2026-09-24 — Task 8 done. `domain/cycle/estimate.ts` and `phase.ts` joined the engine per cycle-engine-plan §6.10–6.11 (they were deferred from Task 4 to here, where they are first used): `cycleStats` (mean + sample stdev + cv over closed lengths), `expectedOvulationDay` (`avg − defaultLutealAssumption`, floored at `minFollicularDays`; history once n ≥ minCyclesForEstimate, else the onboarding average labelled self_reported, else nothing), `isFallback` (irregular → long → none), `resolvePhase` (fallback → menstrual → confirmed luteal → estimated ovulatory/luteal → follicular) returning `basis: confirmed | estimated | none`, which is what stops an estimate from ever reading as a confirmation. 28 new engine tests, including config-flip tests proving a retuned luteal assumption or ovulatory window changes the answer. `services/dashboard.ts` assembles; `GET /dashboard` requires `today` (D1). Web: Home is now the dashboard — TodayCard (says "an estimate, not a confirmation" whenever basis is estimated, and shows the API's fallback words instead of a phase when it declines), ExpectedOvulation (labelled, never a fertile-window or safe-day signal, absent under any fallback), quick links to the log and the chart. **The smoke run caught a real judgement error:** the first draft returned `no_history` for a woman on day 2 of her first ever period, refusing to name a phase she was plainly in. `no_history` now means "no current cycle", not "no completed cycles" — she gets `menstrual/confirmed`, plus a self-reported estimate if she gave a cycle length at onboarding. Verified all six states against the local DB (no cycle · first cycle bleeding · first cycle with self-reported average · regular history follicular · regular history ovulatory · long · irregular). Task 1's API-health card left Home with this rewrite; `useHealth` and `lib/api/health.ts` are now unused but kept for Task 13's offline work.
- 2026-09-24 — Task 7 done. `GET /cycles/:id/assessment` runs the engine over the logs the cycle's interval contains and returns `{ cycle, assessment, copy }`, where `copy` holds only the wording for the states this cycle actually reports — the UI never writes cycle words of its own. **Deviation from D4 worth knowing:** the stored snapshot has six summary fields and no chart rows, so this endpoint re-runs the engine for closed cycles too; the snapshot stays the cheap read for Trends. Web: recharts 3.10 added; `BbtChart` plots by cycle day with the Y domain padded (−0.2/+0.3 °F) so the shift is visible, coverline as a dashed ReferenceLine, ovulation and peak as ReferenceLines, luteal stretch as a ReferenceArea drawn only once ovulation is confirmed, and disturbed/excluded readings drawn hollow — plotted, visibly not counted. `MucusRow` is a plain flex row aligned by cycle day (Sivi's symbols, with a legend and screen-reader text per day). `CycleFacts` shows only confirmed values, and names the day ovulation was *confirmed* alongside the day it occurred. `CycleNotes` renders the flag and confidence copy verbatim. New /cycle route, linked from Home. Smoke-tested against a realistic 28-day ovulatory chart: ovulation day 14, confirmed day 17, peak day 14, confidence full.
- 2026-09-24 — 6.3.x done: `components/ui/Sheet.tsx` is a new bottom-sheet primitive (Escape and backdrop close it, focus moves in on open, the page behind is locked from scrolling, reduced-motion respected) — the app's main entry surface on a phone. `hooks/useLogDraft.ts` holds the day being edited, keeping text fields as strings so an empty box means "nothing recorded" rather than zero, and `toBody` sends every field so clearing one actually clears it. `components/log/LogForm.tsx` is presentational only — the tracker sections appear solely for the signals she tracks (BBT gated on trackingBBT; mucus *and* cervix on trackingMucus, grouped as fertility signs — worth a second look if you want cervix separate). Flow is always available, since it is what triggers the period-start ask. `PeriodStartPrompt` implements D3: bleeding beyond spotting on a day no cycle covers asks whether her period started; declining leaves the day logged as an orphan bleeding day and starts nothing. `DateSwitcher` backfills freely but has no tomorrow. Log page wires it together with toasts; `shiftDate` joined `lib/dates.ts` so day arithmetic stays in one place. Both builds, both lints and repo prettier green; 114 api tests green.
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
