# Coding Standards

## Guiding Principle: Separate the Volatile from the Stable

The founder's core engineering value: tech should be handy to use and easy to change. In knowHer, the things that change often are the *cycle rules* (coverline, ovulation detection, phase boundaries, thresholds), *content*, and *copy*. These MUST live apart from the stable core (routing, data access, UI plumbing).

Concretely:

- All cycle logic lives in one module: `api/src/domain/cycle/` (pure functions, no DB, no HTTP)
- All tunable numbers live at the top of that module in a single `CYCLE_RULES` config object (window size, consecutive rises, minimum data points, disturbed-day handling). Changing a rule means editing one constant, not hunting through the app
- The rule engine is pure and unit-tested: inputs (daily logs) → outputs (coverline, ovulation day, peak day, luteal length, confidence, flags). No side effects
- UI and routes call the engine; they never contain cycle math
- User-facing copy for cycle states lives in a content map, not inline strings, so wording can change without touching logic

If a change would scatter cycle rules across UI or routes, stop — it belongs in the engine.

## TypeScript

- Strict mode enabled, both `/web` and `/api`
- No `any` — use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful
- Share types between frontend and backend via `/shared`
- No unused variables or imports, no `var`

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused — one job per component
- Extract reusable logic into custom hooks (`src/hooks/`)
- Colocate small helpers with the component; promote to `src/lib/` when reused
- Server state via React Query; local UI state in hooks
- Prefer named exports for components; default export the top-level page/route component

## Vite

- Dev server on `http://localhost:5173` by default
- Environment variables via `import.meta.env`, prefixed with `VITE_`
- Static assets in `public/`, imported assets in `src/assets/`

## PWA

- App must be installable: valid manifest, icons, and a service worker
- Cache the app shell for offline tolerance; queue daily logs made offline and sync when back online
- Push notifications for the daily log nudge (opt-in)

## Styling (Tailwind CSS v4)

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- Do NOT create `tailwind.config.ts` or `tailwind.config.js` — those are for v3
- All theme configuration lives in CSS via the `@theme` directive in `src/app/globals.css`
- Brand tokens (color, radius, spacing) defined once, centrally — no hardcoded hex values in components
- Dark mode optional; warm light theme is the default
- Use shadcn/ui primitives where applicable; otherwise build reusable primitives in `components/ui`
- No inline styles except for dynamic values that can't be expressed in Tailwind (e.g. calculated chart positions)
- No CSS-in-JS libraries

Example theme setup:

```css
@import "tailwindcss";

@theme {
  --color-primary: #B22222;   /* bold, fearless red */
  --color-accent:  #E86A5C;
  --color-bg-soft: #FFF6F4;
  --color-ink:     #2A2A2A;
  --color-calm:    #3FA796;
}
```

## Routing

- `react-router-dom` v6+
- Routes defined at the app root
- Use `<Link>` for internal navigation, never a raw `<a href="">` for routes
- Bottom nav is the primary navigation surface (mobile-first): Home · Log · Learn · Profile

## Animation

- Framer Motion for all UI animation and transitions
- Keep motion warm and subtle — never bouncy or clinical
- Always respect `prefers-reduced-motion` — skip or shorten animations when the user prefers reduced motion
- Recharts for all data visualization (BBT chart with coverline overlay, trends)

## Dates & Timezones (critical — this app is date-keyed everywhere)

- `DailyLog.date` and all cycle boundary dates are plain local **calendar dates** (`YYYY-MM-DD`), chosen on the client from the user's local day — never derived from a UTC timestamp on the server
- Zod validates the `YYYY-MM-DD` shape at the route boundary; Prisma stores `@db.Date`
- `tempTakenAt` is a local time-of-day alongside the date, not a UTC instant
- Never bucket "today" server-side with `new Date()` for user-facing logic
- Cycle membership of a log is **derived**: a `DailyLog` belongs to the `Cycle` whose `[startDate, endDate)` interval contains its date. `DailyLog` has no `cycleId` FK, so editing cycle boundaries never reassigns logs

## Backend (Node / Express)

- REST endpoints grouped by resource: `/auth`, `/cycles`, `/logs`, `/trends`, `/knowledge`, `/blog`, `/account`
- Validate all inputs with Zod at the route boundary
- Auth middleware verifies AWS Cognito JWTs on every protected route
- Never trust client-provided userId — derive it from the verified token
- Return a consistent shape: `{ success, data, error }`
- Keep controllers thin; put logic in service modules
- The rolling-window retention job runs on a schedule (cron/worker), not in request handlers

## Database

- PostgreSQL on AWS RDS, encryption at rest ON
- Prisma ORM for all database access
- **IMPORTANT**: Always use migrations for schema changes (`migrate dev` in dev, `migrate deploy` in prod). NEVER `db push` or hand-edit the schema
- Run `migrate status` before committing to verify migrations are in sync
- Index columns used in frequent lookups (userId, date, cycleId)

## File Organization

Frontend (`/web`):
- Components (reusable): `src/components/ComponentName.tsx`
- Pages (route-level): `src/pages/PageName.tsx`
- Hooks: `src/hooks/useThing.ts`
- API client: `src/lib/api/resource.ts`
- Context: `src/context/ContextName.tsx`
- Types: `src/types/feature.ts`

Backend (`/api`):
- Routes: `src/routes/resource.ts`
- Services: `src/services/resource.ts`
- Domain logic: `src/domain/cycle/` (pure, tested — see Guiding Principle above)
- Middleware: `src/middleware/name.ts`
- Validation: `src/schemas/resource.ts` (Zod)
- Migrations: `prisma/`

Shared: `/shared/types.ts`

## Naming

| Item             | Convention                          |
| ---------------- | ------------------------------------ |
| Components       | PascalCase (`CycleCard.tsx`)         |
| Files             | Match component name or kebab-case  |
| Hooks             | `useCamelCase.ts`                   |
| Functions         | camelCase                           |
| Constants         | SCREAMING_SNAKE_CASE                |
| Types/Interfaces  | PascalCase (no prefix)              |
| DB tables         | Singular model names (as in schema) |

## Data Fetching

- Server components / server routes fetch directly with Prisma
- Client components use the typed API client + React Query
- Validate all inputs with Zod

## Error Handling

- Wrap async operations (service calls, external APIs — Cognito, S3, Claude) in try/catch
- Return `{ success, data, error }` from the API; surface user-friendly messages via toast on the client
- Don't swallow errors silently — at minimum, log with context
- Never leak stack traces or health data in error responses or logs

## Accessibility

- Semantic HTML (`<nav>`, `<section>`, `<main>`, `<footer>`, heading hierarchy)
- All images have meaningful `alt` text (decorative images get `alt=""`)
- Interactive elements are keyboard-focusable with visible focus states
- Color contrast meets WCAG AA
- Respect `prefers-reduced-motion` for all animations
- Form inputs have associated `<label>` elements
- Touch targets ≥44px (mobile-first — this is a daily-habit app)

## Code Quality

- No commented-out code unless explicitly noted
- No unused imports or variables
- Keep components under ~150 lines when possible; extract subcomponents otherwise
- Keep functions under 50 lines when possible
- Break long JSX into smaller components rather than deeply nested trees
- Cycle engine changes require accompanying unit tests
- Lint and build must pass before commit
- CI (GitHub Actions) runs lint + build + engine tests on every push; must be green before merge
