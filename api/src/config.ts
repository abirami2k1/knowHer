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
  /** Baseline per-IP limit. Sign-up/login never touch the API (browser → Cognito). */
  rateLimit: { windowMs: 15 * 60 * 1000, limit: 300 },
  /**
   * Cognito user pool the API trusts. Lazy for the same reason as databaseUrl:
   * only the auth middleware needs it, so /health and its tests boot without it.
   */
  get cognito(): { region: string; userPoolId: string; clientId: string } {
    return {
      region: envRequired('AWS_REGION'),
      userPoolId: envRequired('COGNITO_USER_POOL_ID'),
      clientId: envRequired('COGNITO_CLIENT_ID'),
    };
  },
} as const;
