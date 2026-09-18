# knowHer — Implementation Plan

Maps each TASKLIST phase to concrete files, signatures, and the non-obvious details. The build agent executes TASKLIST.md one item at a time; this file is the reference it consults when an item needs elaboration. Architecture decisions D1–D8 are in `context/architecture.md`.

---

## Human setup checkpoints (the agent must STOP and ask — never mock, fake, or skip)

Claude Code cannot provision cloud resources or make product decisions. These are the founder's tasks; each blocks the item listed:

| Blocks | Founder provides |
|---|---|
| 1.2.7 | Sentry project + DSNs for api and web, or a decision to skip error monitoring for MVP |
| 2.1.1 | Local Postgres: run the provided `docker-compose.yml` (`docker compose up -d db`), confirm `DATABASE_URL` in `/api/.env` |
| 3.1.x | Cognito user pool + app client created in AWS console (steps documented in 3.1.1); pool/client IDs pasted into both `.env` files |
| 4.4.0 | Sivi-approved fixture set (the 4-question agenda in Task 4 below) |
| 11.0.6 | S3 keep-or-drop decision |
| 13.0.1 | VAPID key pair generation approval |
| deploy | AWS account resources (RDS, EC2, S3 bucket, CloudFront) — agent writes the scripts/docs, human clicks |

Everything else runs locally with zero cloud dependencies. If an item needs a checkpoint that hasn't happened, the agent flags it and stops — per the "one task at a time" rule.

**Tooling (so the agent never has to guess):** tests = Vitest (api) — add in 1.2.x; local DB = Postgres 16 via `docker-compose.yml` at repo root (write it in 1.1.1); package manager = npm; Node 24 LTS (was Node 20, which reached end-of-life April 2026; Vitest 5 needs ≥ 22).

---

## Task 1 — Scaffolding

Repo layout:

```
/web    src/{pages,components,components/ui,hooks,lib/api,context,types,assets}  public/
/api    src/{routes,services,domain/cycle,middleware,schemas,lib}  prisma/
/shared types.ts  vocab.ts
.github/workflows/ci.yml
```

- Response helper (`api/src/lib/respond.ts`): `ok<T>(res, data)` → `{ success:true, data }`; `fail(res, status, code, message)` → `{ success:false, error:{ code, message } }`. Error middleware maps thrown `AppError` → shaped JSON, anything else → 500 `internal_error`, never a stack.
- CI (`ci.yml`): matrix over `web`/`api`: install → lint → build; api additionally runs `vitest` (engine tests from Task 4 on).
- Typed client (`web/src/lib/api/client.ts`): thin `fetch` wrapper returning `ApiResponse<T>` from `/shared`, base URL from `VITE_API_URL`, later attaches the Cognito token.

## Task 2 — Database

Use `implementation/schema.prisma` as the target schema (copy to `api/prisma/schema.prisma`). Items 2.2.x each add one model/enum group so migrations stay reviewable. Notes:

- `symptoms String[]` (not Json) + controlled vocab in `/shared/vocab.ts` (`SYMPTOMS`, `MOODS`) — Zod validates against it; Trends can aggregate without string soup.
- Seed: 4–6 `KnowledgeArticle` rows (category `basics`/`cycle`/`supporters`) + 1 draft `BlogPost` attached to a placeholder author created only in seed.

## Task 3 — Auth

- `aws-jwt-verify` `CognitoJwtVerifier` (access token, pool + client from env), cached JWKS. Middleware attaches `req.user` after `prisma.user.upsert({ where:{ cognitoSub } … })` — cache the DB user per request only.
- `requireRole('author')` reads `req.user.role` (decision D7).
- Frontend: `amazon-cognito-identity-js` (lighter than Amplify) in an `AuthContext`; token in memory + refresh on load; route guard component redirects anon → `/login`, authed-but-`onboardedAt:null` → `/onboarding`.

## Task 4 — Cycle rule engine (`api/src/domain/cycle/`)

Pure module. No imports from prisma/express; no `Date.now()` — "today" is passed in.

`rules.ts`:

```ts
export const CYCLE_RULES = {
  coverlineWindow: 6,        // temps before the rise used for the coverline
  coverlineOffsetF: 0.1,     // coverline = max(window) + offset
  consecutiveRises: 3,       // 3-over-6 base rule
  minValidTemps: 4,          // below this: null + "low_data" flag
  excludeDisturbed: true,
  invalidateFalseShift: true,
  peakConfirmDays: 2,        // non-eggwhite days needed to confirm peak (2–3)
  disagreementToleranceDays: 2, // |peakDay − ovulationDay| beyond this → flag
  defaultLutealAssumption: 14,  // expected-ovulation formula only
  minCyclesForEstimate: 2,
  irregularCvThreshold: 0.18,   // cycle-length CV above this → honest fallback
  minFollicularDays: 8,         // floor for the expected-ovulation formula
  ovulatoryWindowDays: 2,       // ± days around ovulation shown as "ovulatory"
} as const;
```

`types.ts`: `CycleLog { cycleDay, date, bbtF?, isDisturbed, cervicalMucus?, flow? }`; `CycleAssessment { coverlineF, ovulationDay, peakDay, lutealLength, isAnovulatory, confidence: 'full'|'reduced'|'none', flags: Flag[] }` with `Flag = 'low_data'|'disturbed_excluded'|'false_shift_invalidated'|'signal_disagreement'|'anovulatory'`.

Detection algorithm (`detectOvulation`):

1. `validTemps` = logs with `bbtF`, minus disturbed if `excludeDisturbed`. If count < `minValidTemps` → null + `low_data`.
2. Scan day *i* from index `coverlineWindow`: candidate coverline = max of previous `coverlineWindow` valid temps + `coverlineOffsetF`.
3. Shift confirmed when `consecutiveRises` consecutive valid temps starting at *i* are all strictly above the candidate coverline. Any temp at/below during the run → if `invalidateFalseShift`, discard and continue scanning from the failure point (`false_shift_invalidated` flag).
4. On confirmation: `ovulationDay = day(i) − 1`, coverline locks. (UI shows confirmation only from `day(i)+consecutiveRises−1` — retrospective by construction.)
5. `detectPeakDay`: last `eggwhite` day followed by ≥ `peakConfirmDays` logged non-eggwhite days; else unconfirmed (null).
6. `computeLutealLength` = days after `ovulationDay` through cycle end (complete cycles only).
7. `assessCycle` composes all, sets `anovulatory` when the cycle is complete with no confirmed shift, `signal_disagreement` when both signals exist and differ beyond tolerance, confidence `full` (shift + corroborating peak) / `reduced` (one signal or thin data) / `none`.

Fixtures (4.4.0, Sivi-approved): `clean.json`, `anovulatory.json`, `disturbed.json`, `low-data.json`, `false-shift.json`, `disagreement.json` — each `{ logs, expected }`. 4.4.3 flips `consecutiveRises` to 4 and asserts a different outcome on a crafted fixture.

`copy.ts`: `CYCLE_COPY: Record<Flag | 'phase.*', string>` — the only place cycle wording lives; served to the client inside API responses.

**Boundary note:** Prisma returns `bbtF` as `Prisma.Decimal`, which does not compare like a number — the service layer converts to plain `number` (`.toNumber()`) before calling the engine, and the engine's types only ever see `number`. Add one fixture asserting a 0.01 °F comparison to catch regressions here.

**Questions for the Sivi fixture session (4.4.0)** — the algorithm above assumes answers; get hers: (1) is the coverline window the last 6 *valid readings* or 6 consecutive *calendar days*; (2) are early-cycle temps (days 1–4) excluded from the window, as most FAM methods do; (3) when days are missing right before the rise, which day is named the ovulation day; (4) does she confirm peak after 2 or 3 non-eggwhite days.

## Task 5 — Onboarding

- `POST /onboarding` (Zod): profile fields + optional `lastPeriodStart` (+ optional `periodLength`). Known date → create first `Cycle`; "not sure" → no cycle, `User.onboardedAt` set either way; dashboard renders the honest pre-cycle state ("log your next period start and we'll begin").
- Steps are components under `pages/onboarding/steps/`; a `useOnboarding` reducer holds draft state; single submit at the end (no per-step writes).

## Task 6 — Daily Log + cycles

- `PUT /logs`: upsert on `(userId, date)`; Zod rejects dates in the future or before a sane floor (e.g. 1 year back). After any write, if the date falls inside a **closed** cycle's range → re-run engine, refresh that cycle's snapshot (D4).
- `services/cycles.ts` owns intervals: `startCycle(userId, startDate)` (closes previous: `endDate = startDate − 1`, `length`, snapshot persisted), `editStart`, `logsForCycle` (range query), `currentCycle`. Backfill inside an existing interval **splits** that cycle (close at `newStart − 1`, refresh its snapshot, create the new cycle); only an exact-duplicate start date is rejected (409, friendly copy). Declined "period start?" prompts leave orphan bleeding days: excluded from stats, later reconciliation nudge. Spotting alone never prompts. Unit-test all of this per 6.2.3 (split case included).
- UI: bottom sheet (Framer Motion) with date switcher; tracker fields gated on `trackingBBT`/`trackingMucus`; flow control triggers the "start of your period?" confirm when no open cycle covers the date (D3).

## Task 7 — Cycle Tracker

- `GET /cycles/:id/assessment`: live cycle → engine on read; closed → snapshot (recompute-on-edit keeps it honest). Response includes chart-ready series: `{ points:[{cycleDay,bbtF,disturbed}], coverlineF, ovulationDay, peakDay, mucusRow:[{cycleDay,type}], copy }`.
- Chart: Recharts `LineChart`, Y domain = `[min−0.2, max+0.3]` so the ~0.4°F shift is visible; `ReferenceLine` for coverline; `ReferenceArea` for luteal shading; custom dot for disturbed readings; mucus symbol row is a plain flex row aligned by cycle day under the chart (not inside Recharts).

## Task 8 — Dashboard

`GET /dashboard?today=YYYY-MM-DD` (client-supplied per D1; same param on `/trends`) returns `{ cycleDay, phase, phaseCopy, insight, expectedOvulation?, fallback? }`.

- Phase: `menstrual` (flow days) → `follicular` → `ovulatory` (±2 days around expected/confirmed ovulation) → `luteal` (after confirmed shift, else after expected day at reduced confidence).
- `expectedOvulation = startDate + max(avgCycleLength − defaultLutealAssumption, minFollicularDays)` — every number from `CYCLE_RULES`, none inline; computed on read (D4); requires ≥ `minCyclesForEstimate` cycles (else self-reported avg with `reduced` note). Ovulatory phase spans ± `ovulatoryWindowDays`.
- Fallback (8.0.5) triggers when: cycle day > avg + 2·stdev, or cycle-length CV > `irregularCvThreshold`, or no cycle exists → serve fallback copy instead of asserting a phase. No predictions rendered anywhere on History.

## Tasks 9–11

- History: `GET /history?month` → logged days with `{ date, flow?, hasLog }` only — the service must not leak future/predicted anything. Calendar = CSS grid, tap → read-only sheet with edit shortcut.
- Trends: cycle length + luteal from `Cycle` (closed) ∪ `CycleSummary` (union survives future retention); symptom/energy from recent `DailyLog` grouped by phase via the interval helper.
- Knowledge/Blog: public GETs filter `isPublished` and `audience`; markdown rendered with `react-markdown` (sanitized). Admin routes behind `requireRole('author')`; admin UI is a route-gated page, not a separate app. 11.0.6 resolves S3 (presigned upload) or removes it.

## Task 12 — Account & Privacy

- Export: single JSON `{ profile, cycles, dailyLogs, cycleSummaries, exportedAt, note }` — note states raw logs exist only within the retention window once retention ships.
- Delete: D8 ordering (disable Cognito → transactional DB delete → delete Cognito, retry queue on failure). Frontend: typed confirmation ("delete my account"), then sign-out.
- 12.1.x (deferred): retention worker as a separate entry point (`api/src/jobs/retention.ts`, node-cron or EventBridge→endpoint), idempotent: summary upserted and verified **before** raw deletion, per-cycle transaction, structured log line per cycle (ids only, no health data).

## Task 13 — PWA polish

- Push: `web-push` VAPID; `PushSubscription` model added by migration in this phase (deliberately absent from the Task 2 schema); scheduler groups users by nudge time (stored as local "HH:mm" + IANA timezone captured at opt-in — the one place a timezone is stored).
- Offline: Workbox precaches the shell and handles `NetworkFirst` GETs, but the write queue is **app-level, not SW-level**: queued `PUT /logs` live in IndexedDB and replay through the normal API client so the Cognito token is refreshed first — SW Background Sync would replay hours later with the stale JWT it captured and silently 401. Last-write-wins per D2/D5; dashboard cache shows "as of <time>".

---

## Build order sanity

Unchanged from tasks/README.md: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 (minus retention) → 13. First user-visible end-to-end moment lands at Task 6 (log a day, see it saved); Tasks 7–10 are read-side and can be demoed per-phase. Gates you (founder) own: Sivi fixture sign-off before 4.4.2; S3 decision by 11.0.6; retention decision ~month 4–5 post-launch.
