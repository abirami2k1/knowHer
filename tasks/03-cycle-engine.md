# Task 4 — Cycle Rule Engine (pure logic + tests)

**Goal:** the heart of knowHer as an isolated, pure, unit-tested module. No DB, no HTTP, no UI. This is the "volatile" core kept separate on purpose (see coding-standards).

## Task 4.1 Module + config
- Create `api/src/domain/cycle/`.
- `CYCLE_RULES` config object at the top with documented defaults:
  - `coverlineWindow = 6`, `consecutiveRises = 3`, `minDataPoints` (TBD default, e.g. 4),
  - disturbed-day handling flags, false-shift invalidation on/off, etc.
- These are the ONLY place numbers live. Changing a rule = editing here.

## Task 4.2 Pure functions (inputs = daily logs for a cycle)
- `computeCoverline(logs, rules)` → coverline °F or null (+ which days used).
- `detectOvulation(logs, rules)` → ovulation day or null, using **3-over-6** as the base engine; temp-drop + egg-white mucus as corroboration that raises confidence.
- `detectPeakDay(logs)` → last egg-white day, marked confirmed only once 2–3 non-eggwhite days follow.
- `computeLutealLength(logs, ovulationDay)`.
- `assessCycle(logs, rules)` → summary object: `{ coverlineF, ovulationDay, peakDay, lutealLength, isAnovulatory, confidence, flags[] }`.

## Task 4.3 Edge cases (must be handled + tested)
- No thermal shift → `isAnovulatory: true`, calm.
- Missing days → compute if ≥ min, else return null with a "not enough data" flag.
- Disturbed/flagged readings → excluded from coverline window per config.
- False shift (cross then fall back) → invalidate, keep scanning.
- Mucus says ovulation but temps don't (or vice versa) → both reflected in `flags`.

## Task 4.4 Copy map
- A content map for cycle states (e.g. anovulatory, low-data) — wording separate from logic.

## Task 4.5 Tests
- Unit tests with fixtures: a clean ovulatory cycle, an anovulatory cycle, a disturbed-reading cycle, a missing-data cycle, a false-shift cycle. All green.

## Acceptance
- `assessCycle` returns correct results across all fixtures; changing a `CYCLE_RULES` value visibly changes behavior; 100% of the edge cases above covered by tests. No DB/HTTP imports in this module.
