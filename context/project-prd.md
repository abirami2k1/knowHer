# knowHer — Project Overview & Product Requirements (PRD)

🩸 *Warm, fearless period & cycle health companion.*
Mission: **"Body feeling light and menstruating stress-free."**

> This document merges the project overview and the product requirements. It is the "why" and the "what". For the "how we code", see coding-standards.md. For scope, see features.md. For build order, see tasks/README.md.

---

## 1. Founder's Statement

knowHer is designed and built solely by me. It comes from my own pain of trying to connect with my body through my cycle and drowning in information that was confusing, contradictory, and at times bizarre. Tracking my period — and learning to plan my life *in sync* with it — made a real difference. I want to give that to other women.

I come from app development with a focus on user experience. I value both the people I work with and the people the product is for. I want tech that is handy to use and easy to change — so I structure the codebase around its rules and its volatility, keeping what changes often separate from what stays stable.

---

## 2. The Problem

Period health tools today are too clinical, too basic, or too narrow. They tell you *when* your next period is, not *why you feel the way you feel*. Meanwhile:

- People with PCOD and irregular cycles are forced into 28-day models that simply don't fit them.
- There is too much contradictory information online, and no calm, trustworthy place to make sense of it.
- Daily energy, mood, focus, and capability are hormonal — but nothing connects them to where you are in your cycle, so women end up questioning their own capability.
- Most lifestyle and medical research was done on male bodies and applied universally, so women get guidance that doesn't match their biology, then get called "hormonal" for not fitting it.

**knowHer is ONE warm, honest companion for understanding the menstruating body — and planning life in sync with it.**

---

## 3. Vision & Principles

- **A companion, not a calculator.** It walks with the user; it doesn't just spit out dates.
- **Honesty over false certainty.** Especially for irregular cycles. The app says "I'm not sure" when it isn't.
- **Understanding over data.** The goal is the user feeling connected to her body, not a database of logs.
- **Accessible.** Core tracking and understanding are not locked behind a heavy paywall.
- **Built to change.** Cycle rules and content are volatile by nature; the product is engineered so they can evolve easily.

---

## 4. Team

- **Founder** — design, build, product. Lived experience with PCOD.
- **Sivaranjani Ganapathy (Wellness with Sivi)** — holistic women's health practitioner and collaborating partner. Her cycle-charting methodology is the basis of the Cycle Tracker. She authors Knowledge content.

> Sivi's charting workbook is marked "self usage only, not for circulation." Her method is used here as an agreed collaboration, not republished as a document.

---

## 5. Target Users

| Persona                  | What they need from knowHer                                   |
| ------------------------ | ------------------------------------------------------------ |
| Woman feeling disconnected | A calm way to understand her cycle and feel less alone      |
| PCOD / irregular-cycle user| Honest handling of irregular cycles; no forced 28-day model |
| Everyday menstruator     | Simple daily tracking, cycle awareness, expected dates       |
| Fertility-aware user     | Ovulation *confirmation* from BBT + mucus, with honest limits|
| Curious learner          | Judgment-free basics and expert-backed knowledge             |

Supporters (partners, family) are served through **content in the Knowledge tab**, not a separate tracking flow.

---

## 6. Product Requirements

### 6.1 Onboarding
- Warm, medium length (~5–7 steps). Each step briefly explains *why* it's asked.
- Works even when the user doesn't know her dates — "not sure" is always valid; the app helps estimate.
- Captures: display name, age band, conditions (PCOD/PMDD/Endo/none/unsure), goals (multi-select), whether she'll track BBT/mucus.
- Ends on a warm confirmation that sets up her dashboard.

### 6.2 Daily Log (one entry per day)
- Mood; energy level; symptoms (on **all** cycle days, not just period days).
- Flow / spotting on bleeding days.
- **BBT in °F**, with **time taken** and an **"unusual reading" flag** (illness, alcohol, poor sleep, different wake time).
- **Cervical mucus type**: dry → sticky → lotion/watery → egg-white.
- **Cervix position**: firm / medium / soft.
- **Edit / backfill past days** (also needed for onboarding's past-period entry).
- Optional daily **nudge** via PWA notification.

### 6.3 Period Tracker
- Log period start/end dates and flow intensity (spotting vs full flow).
- Cycle history accumulates and drives everything downstream.

### 6.4 Cycle Tracker (BBT + Mucus) — Sivi's method
- **BBT chart** (Recharts) with **automatic coverline** drawn by the app.
- **Ovulation detection** from thermal shift — rule-based, deterministic, explainable.
- **Peak day** = last egg-white day, confirmed retrospectively (2–3 days later).
- **Luteal phase day count** once temps cross the coverline.
- Charting conventions follow Sivi's system (period / spotting / dry; mucus types 1–3; cervix F/M/S).
- **The rule engine is isolated and configurable** (see coding-standards volatility rule). Specific thresholds are *TBD* and must be easy to change:
  - engine: 3-over-6 rule as base, with temp-drop + mucus as corroboration *(pending final decision)*
  - exclude flagged/disturbed readings from the coverline window
  - minimum data before drawing a coverline; reduced confidence below full data
  - invalidate false shifts (temps cross then fall back)
  - anovulatory cycle → end calmly with "no ovulation detected this cycle"
  - disagreeing signals → show both honestly
- **Honesty rule (hard):** ovulation is only ever confirmed ~3 days *after* it occurs. Never promised in advance.

### 6.5 Dashboard (home)
- Current cycle phase + what it means for today's energy/mood.
- **Expected ovulation date** — formula-based, clearly labelled as an estimate (no ML yet).
- Life-to-cycle alignment insight ("why you might feel this way today").
- **Honest fallback:** if the cycle runs long or history is irregular, say so plainly instead of asserting a phase.

### 6.6 Cycle History
- Calendar of **past logged data only**. No predicted days shown on the calendar.

### 6.7 Trends
- Cycle length trend; luteal phase length; symptom patterns; energy patterns.
- Must survive data retention (see data model note).

### 6.8 Knowledge Tab
- Period basics & cycle education; Sivi's blog posts; supporter content.
- Role-gated **admin panel** for publishing (Sivi authors without touching the DB).

### 6.9 Account & Privacy
- Auth (sign up / login) via AWS Cognito.
- Export my data; permanently delete account.
- **Rolling-window retention** *(deferred post-launch)*: raw daily logs kept for ~6 recent cycles; older cycles compressed to summaries; raw deleted. Automatic vs opt-in: TBD. Summary schema ships in MVP.

---

## 7. Data Model (draft — will evolve)

```
User        — id, cognitoSub, displayName, ageBand, conditions, goals,
              avgCycleLength, avgPeriodLength, trackingBBT, tempUnit, timestamps
Cycle       — id, userId, startDate, endDate?, coverlineF?, ovulationDay?,
              peakDay?, lutealLength?, expectedOvulation, confidenceNote,
              isAnovulatory, isComplete, createdAt
DailyLog    — id, userId, date, flow?(none|spotting|light|med|heavy),
              bbtF?, tempTakenAt?, isDisturbed, disturbedReason?,
              cervicalMucus?(dry|sticky|watery|eggwhite), cervixPosition?(F|M|S),
              mood, energy, symptoms(json), createdAt
              (raw; unique on userId+date; cycle membership DERIVED from
               Cycle date ranges — no cycleId FK)
CycleSummary— id, userId, cycleStartDate, cycleLength, ovulationDay?, peakDay?,
              lutealLength?, avgBbt?, symptomAggregate(json),
              energyAggregate(json), notes?                    (permanent)
BlogPost    — id, authorId, title, slug, bodyMarkdown, audience,
              isPublished, publishedAt, timestamps
KnowledgeArticle — id, title, slug, bodyMarkdown, category, orderIndex
```

> ⚠️ **Retention vs Trends/History:** deletion conflicts with Trends, the History calendar, past BBT charts, and full export. `CycleSummary` (with aggregates) ships in MVP, but the **deletion job itself is deferred post-launch**; automatic vs opt-in is an open decision to make before any user reaches ~6 cycles (~month 4–5).

---

## 8. Tech Stack

| Layer     | Choice                                                     |
| --------- | --------------------------------------------------------- |
| Frontend  | React (Vite), TypeScript, **PWA, mobile-first**           |
| UI        | Tailwind CSS + Framer Motion                              |
| Charts    | Recharts (BBT chart + coverline overlay)                  |
| Backend   | Node.js + Express, TypeScript (separate API)              |
| Database  | PostgreSQL (encrypted at rest)                            |
| ORM       | Prisma (migrations only — never `db push`)                |
| Auth      | AWS Cognito                                               |
| Storage   | AWS S3                                                    |
| Hosting   | AWS: static frontend + CloudFront, backend on EC2         |

Decisions locked: React+Express (not Next.js) to keep the frontend/backend boundary explicit; **°F** as working temperature unit; PWA instead of native apps for now.

---

## 9. Out of Scope (Future)

ML cycle prediction · PCOD screening · anomaly flags · RAG chatbot · nutrition layer (seed cycling, phase foods) · photo/OCR import · community/forum · doctor finder · 3D visualization · Ayurveda body-type · app-store presence.

---

## 10. Success

Not logs captured or features shipped — whether a woman feels **lighter, calmer, more connected to her body, and able to plan life in sync with her cycle.**
