# knowHer

A warm, fearless period & cycle health companion — a web app designed and built to help women reconnect with their bodies through their cycle. Track periods, chart ovulation the way a real practitioner teaches it, and plan life *in sync* with your hormonal rhythm instead of fighting it.

Built solo, with a UX-first mindset and a codebase deliberately structured so the volatile parts (cycle rules, thresholds, content) are easy to change without disturbing the stable core.

---

## Read these first (full project context)

- @context/project-prd.md — vision, problem, users, full product requirements, data model, tech
- @context/architecture.md — system architecture, layering, locked decisions D1–D8, API surface
- @implementation/schema.prisma — the target Prisma schema for Task 2
- @implementation/implementation-plan.md — task-by-task files, signatures, algorithms
- @context/features.md — the complete feature list (source of truth for scope)
- @context/coding-standards.md — how code is written and structured (esp. the rules/volatility separation)
- @context/ai-interaction.md — how we work together (workflow, commits, safety rules)
- @context/progress.md — **live build progress; update it as tasks start/finish**

## Build plan

- @tasks/TASKLIST.md — **the detailed, ordered checklist. This is what you execute.** Do one unchecked item at a time, top to bottom; run its acceptance check; mark it `[x]`; move on.
- @tasks/README.md — the high-level phase map and dependency table (context for the checklist).
- @tasks/00…12 .md — original per-phase sketches. **Precedence on any conflict: TASKLIST.md and @implementation/implementation-plan.md win over these files** (they predate the locked decisions in @context/architecture.md).

---

## Golden rules (do not violate)

1. **One task at a time, in order.** Follow @tasks/README.md top to bottom. Do not skip ahead or pull work forward.
2. **Rules & volatility live apart from the core.** All cycle logic (coverline, ovulation, phase, thresholds) goes in an isolated, well-named module with its constants at the top. Never scatter cycle rules through UI or routes. See coding-standards.
3. **Health honesty is non-negotiable.** No diagnosis. Ovulation is only ever *confirmed retrospectively*, never promised in advance. Irregular/anovulatory cycles are handled calmly. Never show a certain "safe from pregnancy" signal. See ai-interaction.
4. **Ask before large refactors or architectural changes.** Don't add features not in features.md.
5. **Build must pass before commit. Ask before committing.**

---

## Commands

Frontend (`/web` — React + Vite + TS):
- **Dev**: `npm run dev` (http://localhost:5173)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

Backend (`/api` — Node + Express + TS):
- **Dev**: `npm run dev` (http://localhost:4000)
- **Migrate (dev)**: `npm run migrate:dev`
- **Migrate (prod)**: `npm run migrate:deploy`
- **Build**: `npm run build`

## Tech at a glance

React (Vite, TS, PWA, mobile-first) · Tailwind + Framer Motion · Recharts · Node/Express · PostgreSQL · AWS Cognito · AWS S3 · deployed on AWS. Temperatures in °F.
