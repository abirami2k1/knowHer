# knowHer — Cycle Engine Plan (Task 4)

Status: **adopted 2026-09-17** (founder decision: `phase.ts` / `estimate.ts` deferred to Task 8, where they are first used). Originally a proposal that Elaborates the Task 4 section of `implementation-plan.md` after reading Sivi's
"Chart your Cycle" workbook (founder-held PDF, not in the repo) and its sample chart. Where this document differs from
`implementation-plan.md` it says so in §12; the founder decides which wins before 4.1.1 starts. Nothing here changes
scope in `context/features.md`.

---

## 0. The essence, in one paragraph

knowHer's promise is to chart ovulation *the way a real practitioner teaches it*: Sivi's BBT + cervical-mucus method,
with hard honesty rules. The engine is the deterministic heart of that promise: `(daily logs, rules, today) → assessment`.
It draws the coverline, confirms the thermal shift, names the ovulation day and peak day, counts luteal days, and says
calmly when it cannot (low data, disturbed readings, no shift). It is pure (no Prisma, no Express, no `Date.now()`),
every tunable lives in `CYCLE_RULES`, every user-facing sentence lives in `copy.ts`, and every conclusion is retrospective.
Everything else in the app is plumbing around it.

Hard constraints (from CLAUDE.md, architecture D1–D5, ai-interaction):

- Ovulation is confirmed only ~3 days after it happens. The engine never emits a provisional ovulation day or coverline.
- No "safe from pregnancy" signal, no diagnosis, calm wording on anovulatory / irregular cycles.
- Rule-based and explainable. Output carries *why* (window days used, confirmation day, flags).
- °F only; readings arrive with up to two decimals (Sivi records 97.96, plots 98.0).
- Dates are client-chosen calendar dates; the service turns them into `cycleDay` before calling the engine.
- Logs are unowned (no `cycleId`); the service hands the engine the logs inside one cycle's interval.

---

## 1. Source of truth: what Sivi's workbook actually says

Paraphrased from the workbook's "Things to note" and "Symbols" pages (the document itself stays out of the repo —
it is marked for self-use only):

| Topic | Sivi's instruction | Engine consequence |
|---|---|---|
| Taking the temperature | Same time every day, in bed, first thing on waking. A different waking time is **marked on the chart**. | `isDisturbed` + `disturbedReason`; disturbed readings are excluded from the coverline window (configurable). |
| Mucus | Checked after the first morning pee. Types: dry (−), sticky not stretchy (1), watery / lotion / creamy not stretchy (2), stretchy / egg-white (3). Cervix F / M / S. | Maps onto the Prisma enum: `dry`, `sticky`, `watery` (= her type 2, creamy/lotion), `eggwhite`. Cervix is logged and shown, not used by rules. |
| Peak day | "The last day of the appearance of the egg-white consistency." | `peakDay` = last `eggwhite` day, confirmed once `peakConfirmDays` later days are logged non-egg-white. |
| Coverline | "The day where there is a drop in your temperature along with the appearance of the cervix mucus; take 6 temperatures before that, pick the highest, and draw a line above that." | See §1.1 — her *drawn* chart matches the textbook 3-over-6 rule; her *prose* anchors on the dip. Both are supported; the anchor is a rule. |
| Luteal phase | "Once the temperature crosses the coverline you can mark the luteal phase number." | Luteal day 1 = the first reading above the coverline. `lutealDay(d) = d − ovulationDay`. |
| Reading a chart | "We are looking for a pattern rather than daily temperatures." Chart at least one full cycle first. | Confidence tiers + `low_data`; no per-day verdicts. |
| Chart layout | TCOYF-style grid: rows for *Time Temp Taken*, *Temp Count & Luteal Phase*, *Peak Day Count*, a 97.0–99.9 grid at 0.1 °F, three mucus rows (Egg-white / Creamy / Period-Spotting-Dry-Sticky), cervix F/M/S, notes. | The engine emits a per-day `series` so Task 7 can render those rows with zero math in the UI. |

### 1.1 What the sample chart shows (verified against the drawing, not the prose)

The workbook's sample is a real hand-charted cycle. Read column by column against the printed cycle-day header:

- Pre-shift readings sit at 97.4–97.7 °F. One day in that stretch has **no reading** (blank, with a "–" in the raw-reading row).
- The **single egg-white day is also the cycle's lowest temperature** (the "drop with mucus" she describes). Call it day *P*.
- The **first reading above the line is on day P + 3**, followed by two more highs: three consecutive readings above the line.
- The **coverline is drawn at 97.8** across the whole chart.
- The six readings before the first high temp have a maximum of 97.7. **97.7 + 0.1 = 97.8 — the drawn line.**
  Anchoring literally on the dip day (six readings before *P*) gives a maximum of 97.6 and a line at 97.7, which is **not** what she drew.
- One luteal reading is double-circled: her "different waking time" mark. It sits after confirmation, so it changes nothing.
- Peak day *P* vs the thermal-shift ovulation estimate (*P* + 2, the day before the first high): a 2-day gap, which is normal.
- Bleeding resumes about 14 days after the first high reading (luteal ≈ 14).
- Raw readings are written with two decimals and plotted rounded to the nearest 0.1 (one plotted value looks truncated; ask).

**Decision this plan takes:** default `coverlineAnchor = 'first_high_temp'` (textbook 3-over-6, reproduces her line), with the
dip + egg-white day surfaced as corroboration on the chart, and an alternative anchor `'dip_with_fertile_mucus'` available
by config. This is question 1 for the 4.4.0 session (§11).

---

## 2. Scope

**In (Task 4):**

- A. Retrospective assessment of one cycle: coverline, thermal shift, ovulation day, confirmation day, peak day, luteal count,
  anovulatory outcome, false-shift handling, disturbed/missing handling, signal corroboration, confidence, flags, chart series.
- B. Forward-looking *estimates* (formula only, labelled estimates): phase for today, expected ovulation day, irregular / long-cycle
  fallback, cycle-length statistics from history. These are consumed by Task 8 and Task 10 but are pure functions, so they belong here.
- C. The copy map for every state the engine can emit.

**Out:** ML or probabilistic prediction, next-period dates on the History calendar, safe-day windows, diagnosis, °C, cervix-based
rules, any UI. (All per `features.md` and the health-safety rules.)

---

## 3. Module layout

```
api/src/domain/cycle/
  index.ts        public surface (re-exports only)
  rules.ts        CYCLE_RULES + CycleRules type            ← the only place numbers live
  types.ts        CycleLog, CycleInput, CycleAssessment, ChartPoint, Flag, Phase
  temps.ts        hundredths helpers, valid-reading selection
  coverline.ts    computeCoverline
  shift.ts        detectThermalShift (scan + false-shift invalidation)
  peak.ts         detectPeakDay
  luteal.ts       lutealDayFor, computeLutealLength
  assess.ts       assessCycle (composition, confidence, flags)
  series.ts       toChartSeries (per-day projection for the UI)
  phase.ts        resolvePhase(today)
  estimate.ts     cycleStats, expectedOvulationDay, irregularity fallback
  copy.ts         CYCLE_COPY                               ← the only place wording lives
  fixtures/       one .ts file per fixture (typed, commented, Sivi-approved)
  *.test.ts       colocated Vitest (excluded from tsc build, as today)
```

Guard rails worth the five minutes:

- ESLint `no-restricted-imports` scoped to `src/domain/cycle/**` forbidding `express`, `../generated/*`, `../lib/prisma`.
- One test that reads the module's source files and asserts none contain `Date.now`, `new Date(`, `prisma`, or `express`.
- Files stay small (one concern each) so a rule change touches one file plus its test.

---

## 4. Types

```ts
// types.ts
export type Mucus = 'dry' | 'sticky' | 'watery' | 'eggwhite';
export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface CycleLog {
  cycleDay: number;        // 1-based; the service derives it from date − cycle.startDate
  date: string;            // YYYY-MM-DD, carried through for the UI; the engine never parses it
  bbtF?: number;           // plain number, ≤ 2 decimals (service converts Prisma.Decimal)
  isDisturbed: boolean;
  cervicalMucus?: Mucus;
  flow?: FlowLevel;
}

export interface CycleInput {
  logs: CycleLog[];
  cycleLength?: number;    // present only for closed cycles (endDate − startDate + 1)
  todayCycleDay?: number;  // live cycles only; logs beyond it are ignored (backfill safety)
}

export type Flag =
  | 'low_data'                 // fewer than minValidTemps usable readings
  | 'no_temp_data'             // user logs no BBT at all (mucus-only tracker)
  | 'no_mucus_data'            // user logs no mucus at all (temp-only tracker)
  | 'disturbed_excluded'       // a disturbed reading fell inside the window or the confirming run
  | 'false_shift_invalidated'  // a rise crossed the candidate line then fell back
  | 'shift_pending'            // live cycle: not enough post-rise readings yet
  | 'peak_pending'             // live cycle: egg-white seen, confirmation days not logged yet
  | 'signal_disagreement'      // peak and thermal-shift ovulation differ beyond tolerance
  | 'anovulatory';             // closed cycle, enough data, no confirmed shift

export type Confidence = 'full' | 'reduced' | 'none';

export interface CycleAssessment {
  coverlineF: number | null;          // null until the shift is confirmed — never provisional
  coverlineWindowDays: number[];      // cycle days whose readings formed the window (explainability)
  dipDay: number | null;              // lowest reading in the window if it coincides with egg-white/watery
  ovulationDay: number | null;        // cycleDay(first high) − 1
  shiftConfirmedOnDay: number | null; // cycleDay of the last reading in the confirming run
  peakDay: number | null;
  peakConfirmedOnDay: number | null;
  lutealLength: number | null;        // closed cycles: cycleLength − ovulationDay
  lutealDayToday: number | null;      // live cycles: todayCycleDay − ovulationDay
  isAnovulatory: boolean;
  confidence: Confidence;
  flags: Flag[];
  series: ChartPoint[];
}

export interface ChartPoint {
  cycleDay: number;
  bbtF: number | null;
  isDisturbed: boolean;
  excludedFromRules: boolean;  // disturbed (when excludeDisturbed) or early-cycle exclusion
  aboveCoverline: boolean | null; // null while there is no coverline
  tempCount: 1 | 2 | 3 | null; // the "Temp Count" row: 1..consecutiveRises on the confirming run
  lutealDay: number | null;    // the "Luteal Phase" row
  peakCount: number | null;    // the "Peak Day Count" row: 1..peakConfirmDays after peak
  mucus: Mucus | null;
  flow: FlowLevel | null;
}
```

Structural honesty: `ovulationDay`, `coverlineF` and `peakDay` are non-null **only** when their confirmation day exists in the
logs (and ≤ `todayCycleDay` when given). There is no "likely" field for the UI to misuse.

---

## 5. Rules config

```ts
// rules.ts — the ONLY place cycle numbers live. Change a rule = edit here + adjust the fixture that proves it.
export const CYCLE_RULES = {
  // ── Coverline ─────────────────────────────────────────────────────────────
  coverlineWindow: 6,            // readings before the anchor that form the window
  coverlineWindowUnit: 'readings', // 'readings' (skip blank days) | 'calendar_days'   ← ask Sivi (Q2)
  coverlineAnchor: 'first_high_temp', // | 'dip_with_fertile_mucus'                    ← ask Sivi (Q1)
  coverlineOffsetF: 0.1,         // line = window max + offset
  coverlineOnGrid: true,         // snap window max to 0.1 before adding the offset (she draws on grid lines)
  excludeEarlyCycleDays: 0,      // readings on days 1..N never enter the window (0 = off)  ← ask Sivi (Q3)

  // ── Thermal shift ─────────────────────────────────────────────────────────
  consecutiveRises: 3,           // readings strictly above the line, in a row
  minValidTemps: 4,              // below this: no coverline, 'low_data'
  excludeDisturbed: true,        // disturbed readings leave the window and cannot start a run
  invalidateFalseShift: true,    // a run that fails is discarded and scanning continues

  // ── Peak day ──────────────────────────────────────────────────────────────
  peakConfirmDays: 2,            // logged non-egg-white days needed after the last egg-white day  ← ask Sivi (Q5)

  // ── Corroboration ─────────────────────────────────────────────────────────
  disagreementToleranceDays: 2,  // |peakDay − ovulationDay| beyond this → 'signal_disagreement'

  // ── Estimates (dashboard only, never the History calendar) ───────────────
  defaultLutealAssumption: 14,
  minFollicularDays: 8,
  minCyclesForEstimate: 2,
  ovulatoryWindowDays: 2,
  irregularCvThreshold: 0.18,
  longCycleStdevMultiplier: 2,   // today > mean + k·stdev → fallback copy instead of a phase
} as const;

export type CycleRules = { -readonly [K in keyof typeof CYCLE_RULES]: (typeof CYCLE_RULES)[K] };
```

Every function takes `rules: CycleRules = CYCLE_RULES` as its last argument so tests can pass overrides without mutating globals
(4.4.3 needs this).

Knobs deliberately **not** built until Sivi asks for them: TCOYF's "third temperature at least 0.3 °F above the line, else wait for a
fourth", a maximum blank-day gap allowed inside the confirming run, and counting `watery` as fertile for peak-day purposes.
They are listed so nobody re-invents them ad hoc; each would be one key here plus one fixture.

---

## 6. Algorithms

### 6.1 Temperatures are integers inside the engine

Convert at the boundary: `toHundredths(97.65) === 9765`; all comparisons on integers; convert back with `fromHundredths` for output.
Reason: `97.7 + 0.1 !== 97.8` in floating point, and a reading exactly on the line must compare correctly. One fixture asserts the
boundary (§8, "decimal-boundary"). `coverlineOnGrid` rounds the window max to the nearest tenth (half up) before adding the offset.

### 6.2 Selecting valid readings (`temps.ts`)

1. Keep logs with `bbtF`; drop logs with `cycleDay > todayCycleDay` when provided.
2. Mark `excludedFromRules` when `isDisturbed && excludeDisturbed`, or `cycleDay ≤ excludeEarlyCycleDays`.
3. Sort by `cycleDay`. If usable readings `< minValidTemps` → coverline null, `low_data`, confidence `none`
   (peak detection still runs; mucus is an independent signal).
4. If there are no BBT logs at all → `no_temp_data` instead of `low_data` (copy differs: "you're not tracking temperature").

### 6.3 Coverline + shift, anchor = `first_high_temp` (`coverline.ts`, `shift.ts`)

Scan candidate index *i* over usable readings, starting at the first index with `coverlineWindow` usable readings before it
(unit `readings`) or with the readings inside the previous `coverlineWindow` calendar days (unit `calendar_days`; require at least
three, else skip *i*).

1. `candidate = snap(max(window)) + offset` (in hundredths).
2. If `temp[i] > candidate`: examine the run `temp[i .. i+consecutiveRises−1]` (usable readings only; a disturbed reading breaks a run).
   - All strictly above → **confirmed**. `coverlineF = candidate`, `coverlineWindowDays = window days`,
     `ovulationDay = cycleDay(temp[i]) − 1`, `shiftConfirmedOnDay = cycleDay(temp[i+consecutiveRises−1])`. Stop.
   - The run is cut short because the cycle has no more readings (live cycle) → `shift_pending`; nothing is exposed. Stop.
   - A reading in the run is at/below the candidate → if `invalidateFalseShift`, add `false_shift_invalidated`, continue scanning
     from *i + 1* (the window slides, so the failed high may now be *in* the window — that is the textbook behaviour and what
     kills a fever-induced rise).
3. No confirmation by the end: closed cycle → see 6.7; live cycle → `shift_pending`.

Anchor = `dip_with_fertile_mucus` (optional path, same confirmation logic): find the last day *d* with `eggwhite`
(or `watery`, once Sivi says) whose reading is lower than the previous usable reading; window = the `coverlineWindow` usable
readings before *d*; the run must start after *d*. If no such *d* exists, fall back to `first_high_temp` and note it in
`coverlineWindowDays` being empty (no extra flag — the UI copy is the same).

### 6.4 Dip corroboration (`coverline.ts`)

`dipDay` = the day of the minimum reading inside the window, only when it is unique **and** that day logs `eggwhite` or `watery`.
Otherwise null. It is a chart annotation ("the drop Sivi looks for"), not an input to any rule.

### 6.5 Peak day (`peak.ts`)

`P` = the last `eggwhite` day. It is confirmed when the next `peakConfirmDays` *logged* mucus days after `P` are all non-egg-white:
`peakConfirmedOnDay` = the day of the last of those. Any later `eggwhite` moves `P` (a "double peak" is handled by construction).
Live cycle with fewer confirmation days logged → `peak_pending`. No mucus logs at all → `no_mucus_data`.

### 6.6 Luteal (`luteal.ts`)

`lutealDayFor(cycleDay) = cycleDay − ovulationDay` (first high reading = luteal day 1, matching Sivi's counting).
Closed cycle: `lutealLength = cycleLength − ovulationDay`. Live cycle: `lutealDayToday = todayCycleDay − ovulationDay`.
Both null without a confirmed shift.

### 6.7 Anovulatory (`assess.ts`)

`isAnovulatory = cycleLength != null && ovulationDay == null && usableReadings ≥ minValidTemps`. Closed with too little data is
**not** anovulatory — it is `low_data` ("we couldn't tell this cycle"). Live cycles are never anovulatory.

### 6.8 Confidence and disagreement (`assess.ts`)

| Situation | confidence | flags |
|---|---|---|
| Shift confirmed, peak confirmed, gap between ovulation day and peak day within tolerance | `full` | — |
| Shift confirmed, peak confirmed, gap beyond tolerance | `reduced` | `signal_disagreement` |
| Shift confirmed, no peak (`no_mucus_data` / `peak_pending`) | `reduced` | as applicable |
| Shift confirmed but a disturbed reading was excluded from the window or run, or the window had fewer than `coverlineWindow` readings | `reduced` | `disturbed_excluded` / — |
| No confirmed shift (pending, low data, anovulatory) | `none` | as applicable |

A confirmed peak without a thermal shift never confirms ovulation (temps confirm; mucus corroborates) — the honesty rule in code.

### 6.9 Chart series (`series.ts`)

One `ChartPoint` per cycle day from 1 to `max(last logged day, todayCycleDay, cycleLength)`. Fills `aboveCoverline`, `tempCount`
(1..3 on the confirming run), `lutealDay`, `peakCount` (1..`peakConfirmDays` after `peakDay`), mucus, flow. This is the full
content of Sivi's "Temp Count & Luteal Phase" and "Peak Day Count" rows, so Task 7 renders and never computes.

### 6.10 Phase for today (`phase.ts`)

```ts
resolvePhase({ assessment, todayCycleDay, logs, expected, stats }, rules) → {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown',
  basis: 'confirmed' | 'estimated' | 'none',
  copyKey: string,
}
```

Order of evaluation: (1) fallback (§6.11) → `unknown`; (2) `menstrual` while today is inside the leading run of bleeding days
from day 1 (flow ≥ light; spotting alone never counts); (3) `luteal`/`confirmed` when the shift is confirmed and
`todayCycleDay > ovulationDay`; (4) `ovulatory`/`estimated` when `|today − expected.day| ≤ ovulatoryWindowDays`;
(5) `luteal`/`estimated` after `expected.day + ovulatoryWindowDays` without a confirmed shift; (6) else `follicular`.

### 6.11 Estimates and the honest fallback (`estimate.ts`)

- `cycleStats(lengths: number[]) → { n, mean, stdev, cv }` over closed cycles (Cycle ∪ CycleSummary, deduped by the service).
- `expectedOvulationDay({ stats, selfReportedAvg }) → { day, basis: 'history' | 'self_reported' } | null`:
  `day = max(round(avg − defaultLutealAssumption), minFollicularDays)`; `basis = 'history'` needs `n ≥ minCyclesForEstimate`,
  otherwise the onboarding average with `basis = 'self_reported'`; null with neither.
- `isFallback({ stats, todayCycleDay }) → 'irregular' | 'long' | 'no_history' | null`:
  `cv > irregularCvThreshold`, or `today > mean + k·stdev`, or no cycle at all.
- The dashboard is the only consumer. History never calls this file (architecture D4 and the "no predictions on the calendar" rule).

---

## 7. Worked example — the `clean` fixture

Synthetic, modelled on the workbook sample's *shape* (one blank day, dip on the egg-white day, first high three days later,
a disturbed luteal reading), with different numbers so nothing from the workbook is republished.

| Day | °F | Mucus | Flow | | Day | °F | Mucus | Flow |
|---|---|---|---|---|---|---|---|---|
| 1 | 97.2 | — | medium | | 16 | 97.5 | sticky | |
| 2 | 97.4 | — | medium | | **17** | **97.8** | sticky | ← first high, luteal day 1 |
| 3 | 97.3 | — | light | | 18 | 97.7 | dry | |
| 4 | 97.2 | dry | | | **19** | **98.0** | dry | ← shift confirmed |
| 5 | 97.2 | dry | | | 20 | 98.0 | | |
| 6 | 97.5 | dry | | | 21 | 97.9 | | |
| 7 | 97.4 | dry | spotting | | 22 | 97.9 | | |
| 8 | 97.2 | sticky | | | 23 | 98.1 | sticky | |
| 9 | 97.2 | sticky | | | 24 | 98.0 | watery | |
| 10 | *(none)* | sticky | | | 25 | 98.3 | watery | |
| 11 | 97.3 | sticky | | | 26 | 98.0 | watery | |
| 12 | 97.3 | sticky | | | 27 | 98.4 | watery | |
| 13 | 97.4 | watery | | | 28 | 98.4 *(disturbed)* | watery | |
| **14** | **97.2** | **eggwhite** | | | 29 | 98.4 | watery | |
| 15 | 97.3 | sticky | | | 30 | 97.9 | | spotting |

`cycleLength = 30` (next period logged on day 31).

Trace with default rules: window before day 17 = readings on days 11–16 = {97.3, 97.3, 97.4, 97.2, 97.3, 97.5} → max 97.5 →
coverline **97.6**. Days 17, 18, 19 = 97.8, 97.7, 98.0, all > 97.6 → confirmed on day 19. Ovulation day 16. Peak = day 14, confirmed
on day 16 (days 15, 16 logged non-egg-white). Gap 2 ≤ tolerance → `full`. Luteal = 30 − 16 = 14. Dip day 14 (unique window minimum,
egg-white). Day 28's disturbed reading is outside the window and run → no flag.

Expected assessment:

```ts
{ coverlineF: 97.6, coverlineWindowDays: [11,12,13,14,15,16], dipDay: 14, ovulationDay: 16, shiftConfirmedOnDay: 19,
  peakDay: 14, peakConfirmedOnDay: 16, lutealLength: 14, lutealDayToday: null, isAnovulatory: false,
  confidence: 'full', flags: [] }
```

Same logs, live at `todayCycleDay = 18`: `coverlineF: null, ovulationDay: null, flags: ['shift_pending'], peakDay: 14`.
At `todayCycleDay = 15`: `peakDay: null, flags: ['shift_pending', 'peak_pending']`. That pair of assertions *is* the retrospective rule.

---

## 8. Fixtures and tests

Fixtures are `.ts`, not `.json`: they need comments ("approved by Sivi on …", "this day is the fever") and a type
(`Fixture = { name; rules?: Partial<CycleRules>; input: CycleInput; expected: Partial<CycleAssessment> }`).
A generic `fixtures.test.ts` runs every fixture through `assessCycle` and `toMatchObject`s the expectation, so adding a
Sivi-approved case is one file, no new test code.

| Fixture | What it proves |
|---|---|
| `clean` | §7. Full path, `full` confidence, blank day skipped, disturbed reading outside the rules ignored. |
| `anovulatory` | 35-day closed cycle, 97.2–97.6 noise, no run of 3 above any candidate → `isAnovulatory`, `none`, coverline null, no throw. |
| `disturbed` | `clean` plus a 98.1 fever reading on day 13 marked disturbed. Default rules → identical outcome + `disturbed_excluded`. Override `excludeDisturbed: false` → window max 98.1 → no shift. One fixture, two rule sets. |
| `low-data` | Three readings only → `low_data`, coverline null; peak still detected from mucus, confidence `none`. |
| `false-shift` | Days 12–13 above the early candidate, day 14 back below, real shift from day 17 → `false_shift_invalidated` **and** the correct final ovulation day 16. |
| `disagreement` | Peak on day 10, shift with ovulation day 16 → `signal_disagreement`, `reduced`. |
| `decimal-boundary` | Window max 97.65 with `coverlineOnGrid: false` → line 97.75; a 97.75 reading is *not* above, 97.76 is. With `coverlineOnGrid: true` → line 97.8. Also asserts `97.7 + 0.1` style inputs compare correctly. |
| `live-pending` | `clean` truncated at day 18 → `shift_pending`, nothing exposed; at day 15 → `peak_pending` too. |
| `mucus-only` / `temp-only` | `no_temp_data` / `no_mucus_data` paths for users who track one signal. |
| `missing-day-in-run` | Highs on days 17, 19, 20 with day 18 unlogged. Expectation written **after** Sivi answers Q4. |
| `config-flip` (4.4.3) | `consecutiveRises: 4` on `clean` → still confirmed but `shiftConfirmedOnDay: 20`; on a variant whose day 20 dips below → not confirmed. |
| `sivi-sample` | The workbook cycle, checked in only if Sivi approves a de-identified copy (Q10); until then `clean` stands in. |

Invariant tests (not fixture-driven):

- **Determinism**: `assessCycle(x)` deep-equals `assessCycle(x)`; input array order does not matter.
- **Purity**: source files contain no `Date.now`, `new Date(`, `prisma`, `express`.
- **Retrospective**: for every prefix of `clean` (days 1..k), `ovulationDay` is null until `k ≥ 19`, and once set it never changes
  for larger `k`. Same for `peakDay` at `k ≥ 16`.
- **Chart rows**: `series` tempCount is exactly `[1,2,3]` on days 17–19, lutealDay starts at 1 on day 17, peakCount `[1,2]` on days 15–16.

---

## 9. Service boundary (built in Tasks 6–8, designed now so the engine's API fits)

- `services/assessment.ts`: `logsForCycle(userId, cycle)` → map each `DailyLog` to `CycleLog` with
  `cycleDay = daysBetween(cycle.startDate, log.date) + 1` (string date arithmetic in `lib/dates.ts`, no timezone conversions),
  `bbtF = log.bbtF?.toNumber()`, `cycleLength` when `endDate` is set, `todayCycleDay` from the validated `?today`.
- `GET /cycles/:id/assessment` returns the assessment plus `copy` resolved from `CYCLE_COPY` for each flag and the confidence tier.
- Snapshot on close (D4): `coverlineF, ovulationDay, peakDay, lutealLength, isAnovulatory, confidence` onto `Cycle`;
  `confidenceNote = CYCLE_COPY[first flag]`. Any `PUT /logs` inside a closed interval re-runs the engine and rewrites the snapshot.
- `GET /dashboard`: `resolvePhase` + `expectedOvulationDay` + `isFallback`, all from `domain/cycle`. No arithmetic in the service beyond
  building the inputs. (This moves the expected-ovulation formula from the dashboard service, where `implementation-plan.md` puts it, into
  `estimate.ts` — same numbers, one home.)
- `GET /trends`: `cycleStats` over `Cycle ∪ CycleSummary` (dedupe on `(userId, startDate)` happens in the service, not the engine).

---

## 10. Copy map

`copy.ts` exports `CYCLE_COPY: Record<CopyKey, string>`, where `CopyKey` is the union of every `Flag`, `confidence.<tier>`,
`phase.<phase>` and `fallback.<reason>`. Tone: warm, calm, second person, no alarm. Examples to seed (Sivi rewrites at will):

- `anovulatory` — "No ovulation detected this cycle. That happens; keep charting and we'll look at the next one together."
- `low_data` — "A few more morning readings and we can start drawing your chart."
- `shift_pending` — "Watching for a sustained rise. Ovulation is only ever confirmed a few days after it happens."
- `signal_disagreement` — "Your mucus pointed to one day and your temperatures to another. Both are shown — patterns matter more than any single day."
- `fallback.long` — "This cycle is running longer than your usual. That's information, not a problem; keep logging."

No inline strings in `assess.ts`, `phase.ts` or `estimate.ts` — a test greps for it.

---

## 11. Questions for Sivi (the 4.4.0 agenda, replaces the four in `implementation-plan.md`)

1. **Coverline anchor.** Show her the sample-chart reading in §1.1: "six readings before the first high temperature, highest + 0.1"
   reproduces her drawn line; "six readings before the dip day" does not. Which is the rule?
2. "Six temperatures" — six *readings* (skip blank days), or the six *calendar days* before the anchor?
3. Do period-day / early-cycle readings ever enter the window, or does she skip the first N days?
4. A blank day inside the three-day rise: does it break the count, or continue it?
5. Peak is confirmed after **2** or **3** non-egg-white days? Does her type 2 (watery / lotion) ever count as fertile for peak purposes?
6. A reading exactly *on* the line: above or not? (Engine default: strictly above.)
7. Does she apply the rules to the raw two-decimal reading or to the plotted 0.1 value? (Default: raw, with the line snapped to the grid.)
8. Which day does she call the ovulation day: the day before the first high (default), the dip day, or the peak day?
9. A reading taken at a different time: excluded from the rules, or just noted?
10. May a **de-identified** copy of her sample cycle (cycle day, temperature, mucus only) be checked into the repo as the golden fixture?

Each answer maps to exactly one key in §5 or one expectation in §8, so the session output is a filled-in fixture set, not a
document to interpret later.

---

## 12. Differences from `implementation-plan.md` Task 4 (founder decides)

| Topic | implementation-plan.md | This plan | Why |
|---|---|---|---|
| Coverline anchor | Implicit: 6 readings before the first high | Same default, made explicit + optional dip anchor | Sivi's prose describes the dip; her drawing matches the textbook. Both must be one config key away. |
| Outputs | `coverlineF, ovulationDay, peakDay, lutealLength, isAnovulatory, confidence, flags` | Adds `shiftConfirmedOnDay, peakConfirmedOnDay, coverlineWindowDays, dipDay, lutealDayToday, series` | Retrospective gating and chart rows must come from the engine, or the UI/service ends up doing cycle math. |
| Flags | 5 | 9 (adds `shift_pending, peak_pending, no_temp_data, no_mucus_data`) | Live cycles and single-signal trackers need honest states, not silence. |
| Temperature math | `number` | integer hundredths internally | Float equality at the line is a real bug class; the plan's own 0.01 fixture needs this. |
| Expected-ovulation formula | In the dashboard service | In `domain/cycle/estimate.ts` | "UI and routes call the engine; they never contain cycle math." |
| Fixtures | `*.json` | `*.ts` (typed, commented) | Approval notes and rule overrides live next to the data. |
| Sivi questions | 4 | 10 (Q1 is new and decisive) | The sample chart raised questions the prose can't settle. |

Suggested TASKLIST touch-ups when the founder adopts this (not applied): 4.1.2 lists the added keys; 4.2.2 "returns confirmation day";
4.2.5 "includes `series`"; new 4.3.6 "live cycle → pending flags, nothing provisional exposed"; 4.4.2 fixtures as `.ts`.

---

## 13. Build order inside Task 4 (one item per session, as always)

1. 4.1.1–4.1.3: files, `CYCLE_RULES`, types (`index.ts` re-exports; nothing else imports the internals).
2. 4.2.1 `temps.ts` + `coverline.ts` with the `clean` fixture only.
3. 4.2.2 `shift.ts` (confirmation, pending, false shift) — `clean`, `live-pending`, `false-shift`.
4. 4.2.3 `peak.ts` — `clean`, `live-pending`.
5. 4.2.4 `luteal.ts`.
6. 4.2.5 `assess.ts` + `series.ts` (confidence, flags, chart rows) — `disagreement`, `disturbed`, `mucus-only`, `temp-only`.
7. 4.3.x edge fixtures: `anovulatory`, `low-data`, `decimal-boundary`.
8. **4.4.0 gate** — Sivi session with §11; convert answers into fixture expectations (`missing-day-in-run`, `sivi-sample` if approved).
9. 4.4.1 `copy.ts`; 4.4.2 all green; 4.4.3 `config-flip`.
10. `phase.ts` and `estimate.ts` can be written inside Task 4 (pure, tested) but are first *called* in Task 8 — flag it in progress.md
    rather than pulling Task 8 forward.
