# Task 7 — Cycle Tracker UI (BBT chart + coverline)

**Goal:** visualize the current cycle using the engine from task 03. UI only calls the engine; no cycle math here.

## Task 7.1 Assess endpoint
- `GET /cycles/:id/assessment` → runs `assessCycle` on the cycle's logs, returns the summary object.

## Task 7.2 BBT chart (Recharts)
- X = cycle day, Y = °F (scaled to show the ~0.4°F shift clearly).
- Plot temps; render the **coverline** as a horizontal reference line when present.
- Mark **ovulation day**, **peak day**, and shade the luteal phase.
- Mucus row / icons under the chart aligned to cycle days (Sivi's symbols).

## Task 7.3 Honest states
- Anovulatory → calm "no ovulation detected this cycle yet" message, not an error.
- Not enough data → "keep logging, we need a few more readings".
- Disagreeing signals → show both (e.g. "mucus suggested ~day 16; temps didn't confirm").

## Acceptance
- For a logged ovulatory cycle the chart shows temps + coverline + ovulation/peak/luteal; anovulatory and low-data cycles show the honest messages; nothing on this screen computes cycle math itself.
