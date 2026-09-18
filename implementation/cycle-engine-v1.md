# knowHer — Cycle Engine v1: Sivi's method as written

Status: **proposal, 2026-09-17.** This is the build spec for Task 4. It follows the rules in Sivi's "Chart your Cycle" workbook
literally. Where the workbook is silent, it takes the smallest assumption and marks it **[assumption]** so she can confirm.
`cycle-engine-plan.md` (structure, types, tests) and `cycle-engine-evidence.md` (research options) stay as references;
**where they differ from this file, this file wins for v1.** Nothing from the evidence review is built in v1.

---

## 1. Sivi's rules, one line each

| # | Workbook says | Engine does |
|---|---|---|
| R1 | Take the temperature at the same time, in bed, on first waking. A different waking time is marked on the chart. | `isDisturbed` readings are set aside: they never enter the coverline window and never count as a crossing. |
| R2 | Mucus is checked after the first morning pee. Types: dry (–), sticky not stretchy (1), watery / lotion / creamy (2), stretchy / egg-white (3). Cervix S / M / F. | Enum `dry / sticky / watery / eggwhite` (watery = her type 2). Cervix is logged and drawn, never used in a rule. |
| R3 | Peak day = the last day egg-white appears. | `peakDay` = last `eggwhite` day. |
| R4 | Coverline: find the day where the temperature drops together with the appearance of the mucus; take the 6 temperatures before that day; pick the highest; draw the line above it. | `dropDay` = the fertile-mucus day with the lowest reading. Window = the 6 readings before `dropDay`. `coverlineF` = highest + 0.1 °F (the next grid line). |
| R5 | Once the temperature crosses the coverline, mark the luteal phase number. | Luteal day 1 = the first reading strictly above the coverline after `dropDay`; luteal day N counts on from there. |
| R6 | Chart a full cycle first; look for a pattern, not daily temperatures. | First-cycle copy is a baseline message; verdicts need a closed cycle. |
| R7 | Chart rows: Time temp taken · Temp Count & Luteal Phase · Peak Day Count · symbols: period ●, spotting ◉, dry –, sticky / creamy / egg-white blocks, PK. | The engine emits a per-day series carrying every one of these rows so the chart screen draws and never computes. |

The three assumptions the workbook does not settle:

- **[assumption A]** How many readings above the line before the app *shows* the line and says ovulation is confirmed: **3**.
  The workbook does not give a number, but CLAUDE.md rule 3 (confirm only retrospectively) requires one, her chart's
  "Temp Count" row counts 1, 2, 3, and the PRD names 3-over-6 as the base. Nothing is displayed until the third reading.
- **[assumption B]** Peak day is confirmed after **3** later days logged without egg-white (her chart's "Peak Day Count" row).
- **[assumption C]** Which mucus counts as "the appearance of the mucus" for the drop day: **egg-white**, falling back to
  watery if the cycle never logs egg-white.

---

## 2. Config (`rules.ts`, the only place numbers live)

```ts
export const CYCLE_RULES = {
  coverlineWindow: 6,            // R4: six readings before the drop day
  coverlineOffsetF: 0.1,         // R4: "the line above" = next 0.1 °F grid line
  dropMucusTypes: ['eggwhite'],  // assumption C; fallback ['watery'] when no egg-white in the cycle
  confirmRises: 3,               // assumption A: readings above the line before anything is shown
  peakConfirmDays: 3,            // assumption B
  excludeDisturbed: true,        // R1
  minReadingsForCoverline: 9,    // 6 in the window + 3 to confirm; fewer → "keep charting"
  minCoverageForVerdict: 0.5,    // share of cycle days with a reading before "no ovulation detected"
  rulesVersion: 'sivi-v1',
} as const;
```

Not in v1 (deferred to the evidence review): Sensiplan margins, FIGO irregularity, personal luteal estimate, plausibility range,
different-waking-time nudge. `phase.ts` / `estimate.ts` for the dashboard keep the earlier plan's formula with
`defaultLutealAssumption: 14` untouched for now.

---

## 3. Algorithm

Temperatures are integer hundredths inside the engine (`97.65 → 9765`) so equality at the line is exact. Readings marked
disturbed are dropped first. Blank days are skipped, not interpolated.

1. **Peak (R3, B).** `peakDay` = last `eggwhite` day. Confirmed when `peakConfirmDays` later days have mucus logged and none is
   egg-white; else `peak_pending` (live cycle) or unconfirmed (closed cycle with no later mucus logs).
2. **Drop day (R4, C).** Among days whose mucus is in `dropMucusTypes` (egg-white; else watery), `dropDay` = the one with the
   lowest usable reading; ties → the latest. No such day → `no_drop_day` (see step 6).
3. **Coverline (R4).** Window = the `coverlineWindow` usable readings immediately before `dropDay` (skipping blanks and disturbed).
   Fewer than 6 available → use what exists but mark confidence `reduced`; fewer than 3 → `low_data`.
   `coverlineF` = max(window) + `coverlineOffsetF`. It is **not exposed** until step 4 confirms.
4. **Crossing and confirmation (R5, A).** Scan usable readings after `dropDay`. The first reading strictly above `coverlineF` is the
   candidate luteal day 1. If the next `confirmRises − 1` usable readings are also strictly above → **confirmed**:
   `lutealStartDay` = candidate, `confirmedOnDay` = last reading of the run, `ovulationDay = lutealStartDay − 1`, coverline exposed.
   If a reading in the run is at or below the line → the run is discarded (`false_rise`) and the scan continues from the next
   reading. Run cut short by the end of the logs → `shift_pending`, nothing exposed.
5. **Luteal count (R5).** `lutealDay(d) = d − lutealStartDay + 1` for every day from `lutealStartDay` on. Closed cycle:
   `lutealLength = cycleLength − lutealStartDay + 1`. Live cycle: `lutealDayToday`.
6. **No drop day** (mucus not tracked or no fertile mucus logged) → the workbook rule cannot run. v1 falls back to the window
   of 6 readings before the first reading that would cross, confidence `reduced`, flag `no_drop_day`, copy "log your mucus
   for the full method". (Her drawn sample chart matches this fallback exactly, so it is safe.)
7. **Closed cycle, no confirmed crossing, coverage ≥ `minCoverageForVerdict`** → `no_ovulation_detected`, said calmly.
   Coverage below that → `low_data` ("we couldn't tell this cycle").
8. **Confidence.** `full` = crossing confirmed and peak confirmed and `|peakDay − ovulationDay| ≤ 2`. `reduced` = confirmed with a
   short window, the fallback of step 6, no peak, or a wider gap (`signal_disagreement` flag). `none` = not confirmed.

---

## 4. Output

```ts
interface CycleAssessment {
  peakDay: number | null;            peakConfirmedOnDay: number | null;
  dropDay: number | null;
  coverlineF: number | null;         coverlineWindowDays: number[];
  lutealStartDay: number | null;     confirmedOnDay: number | null;
  ovulationDay: number | null;       // lutealStartDay − 1, the project-wide convention
  lutealLength: number | null;       lutealDayToday: number | null;
  outcome: 'confirmed' | 'pending' | 'no_ovulation_detected' | 'low_data';
  confidence: 'full' | 'reduced' | 'none';
  flags: Array<'peak_pending' | 'shift_pending' | 'false_rise' | 'no_drop_day' | 'signal_disagreement' | 'disturbed_excluded'>;
  series: ChartPoint[];              // per day: bbtF, disturbed, timeTaken, aboveCoverline, tempCount 1..3, lutealDay, peakCount 1..3, mucus, cervix, flow, isPeak
}
```

Everything nullable is null until its confirmation day exists in the logs. There is no provisional field.

---

## 5. Worked example (same synthetic cycle as `cycle-engine-plan.md` §7)

Egg-white only on day 14 at 97.2 °F, the cycle low → `dropDay = 14`, `peakDay = 14` (confirmed day 17).
Six readings before day 14, skipping the blank day 10: days 7, 8, 9, 11, 12, 13 = 97.4, 97.2, 97.2, 97.3, 97.3, 97.4 → max 97.4 →
**coverline 97.5**. Day 16 (97.5) is on the line, not above. Day 17 (97.8) crosses; 18 (97.7) and 19 (98.0) stay above →
confirmed on day 19, `lutealStartDay 17`, `ovulationDay 16`, luteal length 14 on a 30-day cycle, gap to peak 2 → `full`.

Same cycle seen live on day 18: `coverlineF null`, `outcome 'pending'`, flags `['shift_pending']`, peak already confirmed.

(The earlier plan's first-rise anchor gives 97.6 on this cycle; both confirm on day 19. On Sivi's own sample chart the two anchors
differ by 0.1 °F and her drawn line matches the first-rise one. That is the one thing to show her, not a blocker.)

---

## 6. Fixtures (each a `.ts` file with an "approved by Sivi on …" line)

| Fixture | Proves |
|---|---|
| `clean` | §5 end to end |
| `live-pending` | `clean` cut at day 18 and at day 15: nothing exposed, correct pending flags |
| `no-drop-day` | temp-only cycle → fallback window, `reduced`, `no_drop_day` |
| `false-rise` | one reading above the line on day 15 then back below; real crossing from day 17 |
| `disturbed` | a different-waking-time reading inside the window is skipped; same coverline |
| `no-ovulation` | closed 35-day cycle, flat temps, coverage 80 % → `no_ovulation_detected` |
| `low-data` | closed cycle, 5 readings → `low_data`, no verdict |
| `watery-fallback` | no egg-white logged, watery days present → drop day from watery |
| `on-the-line` | 97.50 vs coverline 97.5 is not above; 97.51 is |
| `config-flip` | `confirmRises: 4` moves `confirmedOnDay` to 20 |

Invariants: deterministic; no `Date.now`, prisma or express in the module; for every prefix of `clean`, `ovulationDay` is null
until day 19 and never changes after.

---

## 7. What to confirm with Sivi (10 minutes, her sample chart on the table)

1. Assumption A: three readings above the line before the app shows it. Yes?
2. Assumption B: peak confirmed after three days, or two?
3. Assumption C: does watery / lotion mucus count for the drop day when there is no egg-white?
4. Her sample chart's line sits 0.1 °F above where the literal drop-day rule puts it. Which does she want the app to draw?

Answers change one key each in §2. Build order follows TASKLIST 4.1.1 → 4.4.3 with these fixtures in place of the earlier list.
