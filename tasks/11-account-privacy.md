# Task 11 — Account & Privacy

**Goal:** honour the privacy-by-design commitments.

## 11.1 Export
- `GET /account/export` → all of the user's data as JSON (and/or ZIP). Downloadable from Profile.

## 11.2 Delete
- `DELETE /account` → permanently remove the user and all related rows (cascade). Clear Cognito user. Confirmation UI.

## 11.3 Rolling-window retention job — **DEFERRED post-launch** (see TASKLIST Task 12)
- Scheduled job: for cycles older than the retention window (~6 cycles), write/verify a `CycleSummary` (incl. symptom/energy aggregates for Trends) then delete the underlying `DailyLog` rows.
- Idempotent; logged; never deletes raw before a summary exists.

## Acceptance
- Export downloads complete data; delete removes everything (D8 ordering: disable Cognito → DB transaction → delete Cognito) and logs the user out. Retention is intentionally NOT part of MVP acceptance.
