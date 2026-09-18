# knowHer

🩸 A warm, fearless period & cycle health companion. Track periods, chart ovulation the way a real practitioner teaches it, and plan life _in sync_ with your hormonal rhythm.

Mission: **"Body feeling light and menstruating stress-free."**

---

## Repository layout

```
/web      React + Vite + TypeScript PWA (mobile-first)
/api      Node + Express + TypeScript API (all cycle logic lives here)
/shared   Types shared by both apps (no runtime logic)
context/  Product, architecture, coding standards, progress
tasks/    Ordered build checklist (TASKLIST.md is what gets executed)
implementation/  Implementation plan + target Prisma schema
```

## Prerequisites

- Node 24 LTS (see `.nvmrc`) and npm
- Docker Desktop (local PostgreSQL only — production uses AWS RDS)

## Commands

Frontend (`/web`):

| Command           | What it does                                                               |
| ----------------- | -------------------------------------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:5173                                        |
| `npm run build`   | Production build                                                           |
| `npm run lint`    | Lint                                                                       |
| `npm run preview` | Serve the production build (PWA + service worker) at http://localhost:4173 |

Backend (`/api`):

| Command                  | What it does                           |
| ------------------------ | -------------------------------------- |
| `npm run dev`            | Dev server at http://localhost:4000    |
| `npm run build`          | Compile TypeScript                     |
| `npm run lint`           | Lint                                   |
| `npm test`               | Unit + integration tests (Vitest)      |
| `npm run migrate:dev`    | Create/apply a migration (development) |
| `npm run migrate:deploy` | Apply migrations (production)          |
| `npm run migrate:status` | Check migrations are in sync           |
| `npm run generate`       | Regenerate the Prisma client           |

## Environment

Each app reads its own env file. Copy the example, then fill in values:

```bash
cp api/.env.example api/.env && cp web/.env.example web/.env.local
```

The example files document every key and hold placeholders only. Real `.env*` files are gitignored; anything prefixed `VITE_` ships in the public web bundle, so it must never be a secret.

## Database migrations (rule: migrations only)

Schema changes go through Prisma migrations, never `prisma db push` and never hand-edited SQL against a live database:

| Command                  | When                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `npm run migrate:dev`    | Development. Edit `prisma/schema.prisma`, then run this to create + apply a migration and regenerate the client. |
| `npm run migrate:deploy` | Production / CI. Applies pending migrations only.                                                                |
| `npm run migrate:status` | Check the database is in sync before committing.                                                                 |

The generated client (`api/src/generated/`) is gitignored; `npm run build` regenerates it. Run `npm run generate` after cloning if you only need `npm run dev`.

## Auth: AWS Cognito user pool (one-time setup, done by hand in the console)

knowHer signs users up and in with an Amazon Cognito user pool: email + password, no social logins, no Hosted UI. The web app talks to Cognito directly; the API only verifies the JWTs Cognito issues. Create one pool for development now and a separate one for production later.

1. AWS Console → **Amazon Cognito** → **User pools** → **Create user pool**.
2. **Application type:** _Single-page application (SPA)_. **Name your application:** `knowher-web`. (SPA creates a public app client with no client secret, which is what the browser SDK needs.)
3. **Sign-in identifiers:** _Email_ only. **Required attributes for sign-up:** _email_ only. Leave the return URL empty (Hosted UI is not used).
4. **Create user pool**. Then open the new pool and collect two values:
   - **User pool ID** — on the pool's overview page, looks like `us-east-1_AbCdEfGhI`.
   - **App client ID** — under _App clients_ → `knowher-web`, a 26-character string. Confirm _Client secret_ shows none.
5. In that app client's **Authentication flows**, make sure `ALLOW_USER_SRP_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH` are enabled (the SPA preset does this). Nothing else is needed.
6. Under the pool's **Sign-up** settings, leave self-registration enabled and email verification on (Cognito sends the code from its own address — fine for development; production should send through SES).
7. Leave the password policy, MFA (off) and token lifetimes at their defaults for now.

Paste the two IDs and the region into both env files:

| `/api/.env`            | `/web/.env.local`           |
| ---------------------- | --------------------------- |
| `AWS_REGION`           | `VITE_AWS_REGION`           |
| `COGNITO_USER_POOL_ID` | `VITE_COGNITO_USER_POOL_ID` |
| `COGNITO_CLIENT_ID`    | `VITE_COGNITO_CLIENT_ID`    |

Pool and client IDs are public identifiers, not secrets, but they still live in env files so dev and prod pools never mix. The API never holds AWS credentials for auth: it verifies tokens against the pool's public JWKS.

## Local database

```bash
docker compose up -d db
```

Starts PostgreSQL 16 on `localhost:5433` (user/password/db all `knowher`). Host port 5433 is deliberate so it never clashes with a Postgres already installed on the machine. The matching `DATABASE_URL` is noted at the top of `docker-compose.yml`.

## Tech at a glance

React (Vite, TS, PWA, mobile-first) · Tailwind v4 + Framer Motion · Recharts · Node/Express · PostgreSQL + Prisma · AWS Cognito · AWS S3 · deployed on AWS. Temperatures in °F.

## Where to read next

- `CLAUDE.md` — golden rules and the full reading list
- `context/architecture.md` — system design and locked decisions D1–D8
- `tasks/TASKLIST.md` — the ordered build checklist
- `context/progress.md` — live build progress
