# knowHer — Build Tasks (ordered)

> **To execute the build, use `TASKLIST.md`** — the detailed one-item-at-a-time checklist, with `../implementation/implementation-plan.md` as the reference for signatures, algorithms and shapes. This README is the high-level map. The per-phase files (00–12) are original sketches: **on any conflict, TASKLIST.md and the implementation plan win.**

Build **strictly top to bottom**. Each task group is a file in this folder. Within a file, do sub-tasks in order. Do not pull future work forward. At every stage the app should run.

Why this order: foundation first (nothing works without scaffolding, DB, auth) → then the data layer and the pure cycle engine (logic with no UI, fully testable) → then the daily loop that produces data → then the features that read/visualize that data → then content and account/privacy → then polish. UI that displays data is never built before the data exists.

| Task | Group | File | Depends on |
|---|-----------|------|-----------|
| 1 | Project scaffolding & shell | `00-scaffolding.md` | — |
| 2 | Database schema & migrations | `01-database.md` | 1 |
| 3 | Auth (AWS Cognito) | `02-auth.md` | 1, 2 |
| 4 | Cycle rule engine (pure logic + tests) | `03-cycle-engine.md` | 2 |
| 5 | Onboarding | `04-onboarding.md` | 3, 2 |
| 6 | Daily Log + Period Tracker | `05-daily-log.md` | 3, 2, 4 |
| 7 | Cycle Tracker UI (BBT chart + coverline) | `06-cycle-tracker.md` | 4, 6 |
| 8 | Dashboard | `07-dashboard.md` | 4, 6 |
| 9 | Cycle History (calendar) | `08-history.md` | 6 |
| 10 | Trends | `09-trends.md` | 6, 4 |
| 11 | Knowledge Tab + Admin panel | `10-knowledge.md` | 3 |
| 12 | Account & Privacy (export, delete; retention **deferred**) | `11-account-privacy.md` | 2, 6 |
| 13 | PWA polish & daily nudge | `12-pwa-polish.md` | all |

**Decisions locked (2026-09):** retention job deferred post-launch (automatic vs opt-in TBD); cycle engine stays API-only (offline mode syncs queued logs but shows last-fetched assessments, clearly dated); daily logs carry no `cycleId` — cycle membership is derived from date ranges, so editing a period start never reassigns logs.

**Open decision blocking Task 4's internals:** the exact cycle rule thresholds/engine choice are TBD. Task 4 builds the engine *structure* with a configurable `CYCLE_RULES` object and a documented default (3-over-6). Final numbers can change later by editing that one config — that's the whole point of the volatility separation.
