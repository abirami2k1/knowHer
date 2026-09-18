# Task 6 — Daily Log + Period Tracker

**Goal:** the daily loop that produces all cycle data. Includes period logging and cycle creation/closing.

## Task 6.1 Log data API
- `POST/PUT /logs` (upsert by userId+date): mood, energy, symptoms[], flow?, bbtF?, tempTakenAt?, isDisturbed+reason?, cervicalMucus?, cervixPosition?.
- `GET /logs?from&to` for a date range. Zod-validate everything.
- **Backfill:** allow logging/editing any past date.

## Task 6.2 Period → cycle logic
- Logging a **period start** begins a new `Cycle` and closes the previous (sets endDate/length). Store this logic in a service that calls the domain layer where relevant.
- Handle edits that change a start date (recompute affected cycle boundaries).

## Task 6.3 Daily Log UI (mobile-first quick entry)
- Bottom **drawer/sheet** for today's entry: mood, energy, symptoms always; flow when bleeding; BBT + time + "unusual reading" toggle and mucus/cervix **only if she tracks them**.
- Mucus type picker uses Sivi's types (dry → sticky → watery → egg-white) with a short reference hint per type.
- Date switcher to backfill past days.

## Acceptance
- User logs today and past days; period start creates/closes cycles correctly; BBT/mucus fields appear only for trackers; all inputs validated; data reloads correctly.
