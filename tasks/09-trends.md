# Task 10 — Trends

**Goal:** patterns over time, designed to survive data retention.

## Task 10.1 Data
- `GET /trends` → cycle length over time, luteal length over time, symptom frequency, energy patterns by phase — read from `CycleSummary` (+ recent raw logs) so trends persist after raw deletion.

## Task 10.2 UI (Recharts)
- Cycle length trend line; luteal length trend; symptom pattern view; energy-by-phase view.
- Warm, encouraging framing — never clinical scoring.

## Acceptance
- Trends render from summaries + recent logs; remain correct in principle even if old raw logs were deleted; friendly tone.
