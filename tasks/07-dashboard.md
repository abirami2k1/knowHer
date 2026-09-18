# Task 8 — Dashboard (home)

**Goal:** the home screen that connects daily life to the cycle.

## Task 8.1 Data
- `GET /dashboard` → current phase (from engine + cycle-day math), today's expected-ovulation estimate (formula from avg cycle length, labelled estimate), and an alignment insight for the phase.

## Task 8.2 UI
- Today card: cycle day, phase, and a warm "what this can mean for your energy/mood today" line (copy from a phase→insight content map, not inline).
- Expected ovulation date, clearly labelled as an estimate.
- Quick link into today's Daily Log.

## Task 8.3 Honest fallback
- If cycle runs longer than usual or history is irregular/insufficient → say so plainly instead of asserting a phase.

## Acceptance
- Dashboard shows correct phase + insight for a normal cycle; shows the honest fallback for a long/irregular cycle; expected date reads as an estimate; links to logging.
