# knowHer — Features List

Source of truth for scope. Grouped by area. Each maps to a task group in @tasks/README.md.
Status: ✅ in MVP · 🕓 future · ⚠️ has open decisions.

---

## 1. Foundation
- ✅ Project scaffolding (web + api, mobile-first shell, brand tokens)
- ✅ Database schema + migrations
- ✅ Auth via AWS Cognito (sign up, login, protected routes, logout)
- ✅ App shell: bottom nav (Home · Log · Learn · Profile), routing, PWA setup

## 2. Onboarding
- ✅ Multi-step warm onboarding (~5–7 steps) with "why we ask" microcopy
- ✅ "Not sure" paths for dates and cycle length
- ✅ Captures profile, conditions, goals, BBT/mucus tracking preference
- ✅ Seeds the user's first cycle from onboarding data

## 3. Daily Log
- ✅ One entry per day: mood, energy, symptoms (all days)
- ✅ Flow / spotting on bleeding days
- ✅ BBT (°F) + time taken + "unusual reading" flag
- ✅ Cervical mucus type (dry → sticky → watery → egg-white)
- ✅ Cervix position (F/M/S)
- ✅ Edit / backfill past days
- ✅ Quick-entry drawer/sheet (mobile-first)
- 🕓 Daily push nudge (PWA) — after core works

## 4. Period Tracker
- ✅ Log period start/end + flow intensity
- ✅ Cycle creation & closing logic (a period start begins/decides cycles)
- ✅ Cycle history accumulation

## 5. Cycle Tracker (BBT + Mucus) — Sivi's method
- ✅ BBT chart (Recharts) with data points by cycle day
- ✅ **Cycle rule engine (isolated module)** — coverline, ovulation, peak day, luteal count
- ⚠️ Rule specifics TBD (engine choice, thresholds, edge cases) — engine must be configurable
- ✅ Coverline auto-drawn on chart
- ✅ Peak-day detection (retrospective)
- ✅ Luteal phase day count
- ✅ Anovulatory / disturbed / missing-data handling (calm, honest)

## 6. Dashboard
- ✅ Current cycle phase + today's energy/mood meaning
- ✅ Expected ovulation date (formula, labelled estimate)
- ✅ Life-to-cycle alignment insight
- ✅ Honest fallback for irregular/long cycles

## 7. Cycle History
- ✅ Calendar of past logged data only (no predictions on calendar)

## 8. Trends
- ✅ Cycle length trend
- ✅ Luteal phase length
- ✅ Symptom patterns
- ✅ Energy patterns

## 9. Knowledge Tab
- ✅ Knowledge articles (period basics, cycle education)
- ✅ Sivi's blog posts
- ✅ Supporter content
- ✅ Role-gated admin panel to publish

## 10. Account & Privacy
- ✅ Export my data
- ✅ Delete account (all data)
- 🕓 Rolling-window retention job (raw → summary, delete raw) — **deferred post-launch**; ⚠️ automatic vs opt-in TBD (summary schema ships in MVP)

---

## Future (not MVP)
🕓 ML cycle prediction · PCOD screening · anomaly flags · RAG chatbot · nutrition layer · photo/OCR import · community/forum · doctor finder · 3D visualization · Ayurveda body-type · app-store presence (Capacitor)
