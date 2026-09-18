# Task 9 — Cycle History (calendar)

**Goal:** a calendar of past logged data only. No predictions on the calendar.

## Task 9.1 Data
- `GET /history?month` → logged days with flow/symptom/BBT presence markers.

## Task 9.2 UI
- Month calendar, mobile-first. Period days marked (Sivi's period/spotting symbols), logged days indicated.
- Tap a day → that day's logged entry (read-only, with an edit shortcut into the Daily Log).
- Month navigation. **No predicted/forecast days shown.**

## Acceptance
- Calendar reflects only real logged data; tapping a day shows its entry; no future predictions appear anywhere on the calendar.
