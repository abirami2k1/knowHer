# knowHer — Build Progress

Living status file. **Update this whenever a task item is started or finished.**
The detailed items live in `@tasks/TASKLIST.md`; this file is the at-a-glance tracker + log.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done

Last updated: 2026-09-17

---

## Currently working on
- Task: **Task 1 complete** (only 1.2.7 Sentry open — human checkpoint: founder provides DSNs or decides to skip). Next: **2.1.1** Prisma init — BLOCKED on founder checkpoint (`docker compose up -d db` + `DATABASE_URL` in /api/.env).
- Branch: `feature/api-skeleton` (Task 1.2 milestone; `feature/repo-tooling` kept until 1.1.4 is ticked)
- Notes: Task 1 merged to main (2c042d2), CI green and pushed to origin (github.com/abirami2k1/knowHer). First CI run red as expected (no apps yet). 1.2.6 (hardening) + 1.2.7 (Sentry, checkpoint) added to TASKLIST per founder OK. Project moved to Node 24 LTS on 2026-09-17 (Node 20 is EOL; Vitest 5 requires ≥ 22); .nvmrc = 24. docker-compose.yml written but NOT run — founder starts it at the 2.1.1 checkpoint.

---

## Phase status (high level)
- [x] Task 1 — Scaffolding & app shell (1.2.7 Sentry deferred to founder checkpoint)
- [ ] Task 2 — Database schema & migrations
- [ ] Task 3 — Auth (Cognito)
- [ ] Task 4 — Cycle rule engine (pure + tests)
- [ ] Task 5 — Onboarding
- [ ] Task 6 — Daily Log + Period Tracker
- [ ] Task 7 — Cycle Tracker UI
- [ ] Task 8 — Dashboard
- [ ] Task 9 — Cycle History (calendar)
- [ ] Task 10 — Trends
- [ ] Task 11 — Knowledge Tab + Admin
- [ ] Task 12 — Account & Privacy
- [ ] Task 13 — PWA polish & daily nudge

---

## Detailed item status
> Mirror of TASKLIST.md items. Tick here as you complete each. Only Task 1 is expanded to show the format; add rows for each task as you reach it (or copy the full list from TASKLIST.md).

### Task 1 — Scaffolding
- [x] 1.1.1 root repo + folders
- [x] 1.1.2 editorconfig + prettier
- [x] 1.1.3 .env.example (both apps)
- [x] 1.1.4 GitHub Actions CI (green on main at 2c042d2)
- [x] 1.2.1 Express+TS init
- [x] 1.2.2 dev + lint scripts
- [x] 1.2.3 response helper
- [x] 1.2.4 GET /health
- [x] 1.2.5 error middleware
- [x] 1.2.6 hardening (CORS / helmet / body limit / rate limit)
- [ ] 1.2.7 Sentry — blocked on founder DSNs (checkpoint)
- [x] 1.3.1 React+Vite+TS init
- [x] 1.3.2 Tailwind v4 + tokens
- [x] 1.3.3 router + placeholder routes
- [x] 1.3.4 mobile-first bottom nav
- [x] 1.3.5 Framer Motion transition
- [x] 1.3.6 typed API client + health on Home
- [x] 1.4.1 shared ApiResponse type
- [x] 1.4.2 PWA manifest + SW

_(Add Task 2+ items here as you reach them — pull them from TASKLIST.md.)_

---

## Change log
> One line per completed item or notable decision. Newest at top.
- 2026-09-17 — 1.1.4 done: CI green on main (Prettier + web lint/build + api lint/build/test) at 2c042d2. Task 1 complete.
- 2026-09-17 — 1.4.2 done: vite-plugin-pwa (autoUpdate, app-shell precache), manifest (standalone, theme #B22222, 192/512/maskable icons — placeholder art), SW verified active on the production preview.
- 2026-09-17 — 1.4.1 done: /shared/types.ts (ApiResponse<T>, ApiError) imported by api (respond.ts; tsconfig rootDir '..' so dist = dist/api/src + dist/shared) and web (@shared alias).
- 2026-09-17 — 1.3.6 done: web/src/lib/api/client.ts (typed fetch, envelope unwrap, VITE_API_URL) + health.ts + useHealth (React Query); Home shows "Connected · ok" against the running api.
- 2026-09-17 — 1.3.5 done: framer-motion PageTransition (fade + lift, useOutlet so the exiting page keeps its content, prefers-reduced-motion → instant).
- 2026-09-17 — 1.3.4 done: BottomNav (Home · Log · Learn · Profile), fixed bottom, 56px targets, safe-area padding, aria-current via NavLink; shell = centered max-w-md column.
- 2026-09-17 — 1.3.3 done: react-router-dom 7, createBrowserRouter with AppShell layout + /, /log, /learn, /profile placeholder pages.
- 2026-09-17 — 1.3.2 done: Tailwind v4 via @tailwindcss/vite; brand tokens in src/app/globals.css @theme (primary/accent/bg-soft/ink/calm/muted, radius-card).
- 2026-09-17 — 1.3.1 done: /web React 19 + Vite 8 + TS 5.9 strict (tsc -b), ESLint 10 flat config (react-hooks, react-refresh, prettier); npm run build + lint green.
- 2026-09-17 — 1.2.6 done: helmet, CORS locked to WEB_ORIGIN (array form → no headers for other origins), express.json 100kb limit → 413 envelope, express-rate-limit 300/15min → 429 envelope; CONFIG in src/config.ts; integration tests.
- 2026-09-17 — 1.2.5 done: AppError + errorHandler/notFoundHandler (AppError → status/code, body-parser errors → 413/400, anything else → 500 internal_error, no stack/message leak); tests incl. async throw.
- 2026-09-17 — 1.2.4 done: GET /health → { success:true, data:{ status:'ok' } } (routes/health.ts); verified 200 in browser.
- 2026-09-17 — 1.2.3 done: api/src/lib/respond.ts — ok()/fail() + ApiResponse<T> envelope type; Vitest 5 added with `npm test` (4 unit tests green); tests excluded from tsc build. Project moved to Node 24 LTS (.nvmrc, engines, @types/node 24, README, plan) because Node 20 is EOL and Vitest 5 needs ≥ 22.
- 2026-09-17 — 1.2.2 done: `npm run dev` (tsx watch, boots on :4000 in <1 s) + `npm run lint` (ESLint 10 flat config, typescript-eslint 8, eslint-config-prettier; no-any / no-unused / no-var enforced). TypeScript pinned to 5.9.3 because typescript-eslint requires TS < 6.1.
- 2026-09-17 — 1.2.1 done: /api with Express 5.2, TypeScript 7.0 (strict, NodeNext, noUnused*), dotenv 18; src/app.ts (createApp) + src/index.ts (bootstrap, PORT env); `npm run build` compiles to dist/.
- 2026-09-17 — 1.1.4 in progress: .github/workflows/ci.yml (Prettier job + web/api matrix: lint, build, api tests) on every push/PR; remote origin added and main + feature/repo-tooling pushed.
- 2026-09-17 — 1.1.3 done: api/.env.example (PORT, WEB_ORIGIN, DATABASE_URL, AWS_REGION, COGNITO_*; SENTRY/S3/VAPID commented for later) + web/.env.example (VITE_API_URL, VITE_AWS_REGION, VITE_COGNITO_*); README Environment section.
- 2026-09-17 — 1.1.2 done: root .editorconfig, .prettierrc (singleQuote, printWidth 100), .prettierignore (founder docs + prisma excluded), root package.json with prettier 3.9.8 pinned + format/format:check scripts; README + compose reformatted.
- 2026-09-17 — 1.1.1 done: git init (main) + branch feature/repo-tooling; /web /api /shared; README; .gitignore; .nvmrc; docker-compose.yml (Postgres 16, local only).
- (start) Project docs + task list created.
