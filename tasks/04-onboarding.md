# Task 5 — Onboarding

**Goal:** warm, multi-step onboarding that sets up the user and her first cycle.

## Task 5.1 Flow (5–7 steps, each with a short "why we ask")
1. Welcome (tone-setting).
2. Profile: display name, age band.
3. Period history: last period date + typical cycle length — both with a **"not sure"** option that lets her skip/estimate.
4. Health context: PCOD / PMDD / Endo / none / unsure.
5. Goals (multi-select): understand my cycle · track ovulation · manage a condition · learn.
6. (Conditional) BBT/mucus tracking setup — only if ovulation tracking chosen.
7. Confirmation → dashboard.

## Task 5.2 Persistence
- `PATCH /me` (or `POST /onboarding`) saves profile, conditions, goals, trackingBBT.
- If a last-period date is given, create the first `Cycle` (startDate). If "not sure", create an open cycle without a confident start and let the dashboard show the honest fallback.

## Task 5.3 UX
- Mobile-first, one question per screen, progress indicator, back navigation, Framer Motion transitions. Skippable where honest.

## Acceptance
- New user completes onboarding; data persists; a first cycle exists (or an honest "let's start logging" state); returning users skip onboarding.
