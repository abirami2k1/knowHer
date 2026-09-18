import { PrismaPg } from '@prisma/adapter-pg';
import { CONFIG } from '../config';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Single PrismaClient for the process. Prisma 7 talks to Postgres through the
 * pg driver adapter; the connection string comes from CONFIG (never read
 * process.env elsewhere). Services import `prisma` from here.
 */
const adapter = new PrismaPg({ connectionString: CONFIG.databaseUrl });

export const prisma = new PrismaClient({ adapter });
