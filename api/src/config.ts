import { config as loadEnv } from 'dotenv';

loadEnv({ quiet: true });

function envRequired(name: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw === '')
    throw new Error(`Env ${name} is required (see .env.example)`);
  return raw;
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`Env ${name} must be a number, got "${raw}"`);
  return value;
}

/** All runtime configuration, read once from the environment. Never read process.env elsewhere. */
export const CONFIG = {
  port: envNumber('PORT', 4000),
  /**
   * Postgres connection string (local: docker-compose.yml on port 5433; prod: RDS secret).
   * A getter, so only code that actually opens a connection (lib/prisma.ts) requires it —
   * the HTTP layer and its tests boot without a database.
   */
  get databaseUrl(): string {
    return envRequired('DATABASE_URL');
  },
  /** Exact web-app origin allowed by CORS. No wildcard, ever (architecture §5b). */
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  /** JSON bodies above this are rejected with 413 — daily logs are tiny. */
  jsonBodyLimit: '100kb',
  /** Baseline per-IP limit; auth-adjacent routes get a stricter bucket in Task 3. */
  rateLimit: { windowMs: 15 * 60 * 1000, limit: 300 },
} as const;
