// Prisma 7 config. The datasource URL lives here (not in schema.prisma) and is
// read from /api/.env via dotenv. Migrations only — never `db push` (see README).
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
