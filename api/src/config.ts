import { config as loadEnv } from 'dotenv';

loadEnv({ quiet: true });

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
  /** Exact web-app origin allowed by CORS. No wildcard, ever (architecture §5b). */
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  /** JSON bodies above this are rejected with 413 — daily logs are tiny. */
  jsonBodyLimit: '100kb',
  /** Baseline per-IP limit; auth-adjacent routes get a stricter bucket in Task 3. */
  rateLimit: { windowMs: 15 * 60 * 1000, limit: 300 },
} as const;
