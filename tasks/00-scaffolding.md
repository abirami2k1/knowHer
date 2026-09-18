# Task 1 — Project Scaffolding & App Shell

**Goal:** two runnable apps and a mobile-first shell. No features yet.

## Task 1.1 Repo structure
- Create `/web`, `/api`, `/shared` folders. Root README with commands from CLAUDE.md.
- `.gitignore`, `.env.example` in `/web` and `/api` (placeholders only — no secrets).

## Task 1.2 Backend skeleton (`/api`)
- Express + TypeScript, strict mode.
- `GET /health` → `{ success: true, data: { status: "ok" } }`.
- Consistent `{ success, data, error }` response helper.
- `npm run dev` (port 4000), `npm run build`, `npm run lint`.

## Task 1.3 Frontend skeleton (`/web`)
- React + Vite + TypeScript, strict mode.
- Tailwind v4 with `@theme` brand tokens in `globals.css` (see coding-standards).
- React Router with placeholder routes: `/` (Home), `/log`, `/learn`, `/profile`.
- **Mobile-first bottom nav** (Home · Log · Learn · Profile). Desktop = centered narrow column.
- Framer Motion installed; one subtle page-transition to prove it works.

## Task 1.4 PWA baseline
- Manifest + icons + service worker (app shell cache). Installable. (Push comes in task 12.)

## Task 1.5 Shared types
- `/shared/types.ts` with initial `ApiResponse<T>` type; wire both apps to import it.

## Acceptance
- `npm run dev` runs both apps; health-check returns 200; shell renders with working bottom nav; PWA installable; both builds pass.
