# Task 12 — PWA Polish & Daily Nudge

**Goal:** make it feel like a daily-habit app.

## 12.1 Daily nudge
- Opt-in push notification (PWA) for the daily log. User sets time in Profile. Respect opt-out.

## 12.2 Offline tolerance
- Queue offline daily logs in an **app-level IndexedDB queue** replayed through the token-refreshing API client (not SW Background Sync — stale JWTs silently 401). Cache app shell + last-fetched dashboard, shown with "as of <time>". Fresh assessments need a connection (engine is server-side).

## 12.3 Final polish
- Loading skeletons, toasts, empty states, Framer Motion pass, accessibility check, mobile spacing/touch-target audit.

## Acceptance
- Opt-in nudge fires at the chosen time; a log made offline syncs later; app feels smooth and installable on a phone.
