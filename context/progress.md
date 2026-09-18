# knowHer — Build Progress

Living status file. **Update this whenever a task item is started or finished.**
The detailed items live in `@tasks/TASKLIST.md`; this file is the at-a-glance tracker + log.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done

Last updated: 2026-09-17

---

## Currently working on
- Task: **1.2.1** — done, awaiting commit approval. Next: **1.2.2** dev + lint scripts. (1.1.4 stays [~] until CI is green on main.)
- Branch: `feature/api-skeleton` (Task 1.2 milestone; `feature/repo-tooling` kept until 1.1.4 is ticked)
- Notes: 1.1.1–1.1.4 merged to main (5575dc3) and pushed to origin (github.com/abirami2k1/knowHer). First CI run red as expected (no apps yet). 1.2.6 (hardening) + 1.2.7 (Sentry, checkpoint) added to TASKLIST per founder OK. Local machine has Node 24 (plan says Node 20 LTS; .nvmrc set to 20). docker-compose.yml written but NOT run — founder starts it at the 2.1.1 checkpoint.

---

## Phase status (high level)
- [ ] Task 1 — Scaffolding & app shell
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
- [~] 1.1.4 GitHub Actions CI (written; green only once 1.2/1.3 land)
- [x] 1.2.1 Express+TS init
- [ ] 1.2.2 dev + lint scripts
- [ ] 1.2.3 response helper
- [ ] 1.2.4 GET /health
- [ ] 1.2.5 error middleware
- [ ] 1.2.6 hardening (CORS / helmet / body limit / rate limit)
- [ ] 1.2.7 Sentry — blocked on founder DSNs (checkpoint)
- [ ] 1.3.1 React+Vite+TS init
- [ ] 1.3.2 Tailwind v4 + tokens
- [ ] 1.3.3 router + placeholder routes
- [ ] 1.3.4 mobile-first bottom nav
- [ ] 1.3.5 Framer Motion transition
- [ ] 1.3.6 typed API client + health on Home
- [ ] 1.4.1 shared ApiResponse type
- [ ] 1.4.2 PWA manifest + SW

_(Add Task 2+ items here as you reach them — pull them from TASKLIST.md.)_

---

## Change log
> One line per completed item or notable decision. Newest at top.
- 2026-09-17 — 1.2.1 done: /api with Express 5.2, TypeScript 7.0 (strict, NodeNext, noUnused*), dotenv 18; src/app.ts (createApp) + src/index.ts (bootstrap, PORT env); `npm run build` compiles to dist/.
- 2026-09-17 — 1.1.4 in progress: .github/workflows/ci.yml (Prettier job + web/api matrix: lint, build, api tests) on every push/PR; remote origin added and main + feature/repo-tooling pushed.
- 2026-09-17 — 1.1.3 done: api/.env.example (PORT, WEB_ORIGIN, DATABASE_URL, AWS_REGION, COGNITO_*; SENTRY/S3/VAPID commented for later) + web/.env.example (VITE_API_URL, VITE_AWS_REGION, VITE_COGNITO_*); README Environment section.
- 2026-09-17 — 1.1.2 done: root .editorconfig, .prettierrc (singleQuote, printWidth 100), .prettierignore (founder docs + prisma excluded), root package.json with prettier 3.9.8 pinned + format/format:check scripts; README + compose reformatted.
- 2026-09-17 — 1.1.1 done: git init (main) + branch feature/repo-tooling; /web /api /shared; README; .gitignore; .nvmrc; docker-compose.yml (Postgres 16, local only).
- (start) Project docs + task list created.
