import type { AccountExport } from '../../../shared/types';
import type { User } from '../generated/prisma/client';
import { AppError } from '../lib/errors';
import { cognitoAdmin, type IdentityAdmin } from '../lib/identity-admin';
import { toIsoDate } from '../lib/dates';
import { prisma } from '../lib/prisma';
import { listPostsByAuthor } from './content';
import { listPushSubscriptions } from './push';
import { toCycleDto } from './cycles';
import { toDailyLogDto } from './logs';
import { toProfile } from './users';

// ── Export ───────────────────────────────────────────────────────────────────

const EXPORT_NOTE =
  'This file holds everything knowHer stores about you: your profile, every cycle, every daily log, ' +
  'any cycle summaries, and any browsers you have turned the daily nudge on for. ' +
  'Your raw daily logs are all here — nothing has been pruned. ' +
  'It does not include your password or sign-in details, which live with our sign-in provider and are never visible to us.';

export async function exportAccount(user: User, now: Date = new Date()): Promise<AccountExport> {
  const [cycles, logs, summaries, posts, pushDevices] = await Promise.all([
    prisma.cycle.findMany({ where: { userId: user.id }, orderBy: { startDate: 'asc' } }),
    prisma.dailyLog.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } }),
    prisma.cycleSummary.findMany({
      where: { userId: user.id },
      orderBy: { cycleStartDate: 'asc' },
    }),
    user.role === 'author' ? listPostsByAuthor(user.id) : Promise.resolve([]),
    listPushSubscriptions(user.id),
  ]);

  return {
    exportedAt: now.toISOString(),
    note: EXPORT_NOTE,
    profile: toProfile(user),
    cycles: cycles.map(toCycleDto),
    dailyLogs: logs.map(toDailyLogDto),
    cycleSummaries: summaries.map((s) => ({
      cycleStartDate: toIsoDate(s.cycleStartDate),
      cycleLength: s.cycleLength,
      ovulationDay: s.ovulationDay,
      peakDay: s.peakDay,
      lutealLength: s.lutealLength,
      avgBbtF: s.avgBbtF === null ? null : Number(s.avgBbtF),
      symptomAggregate: s.symptomAggregate,
      energyAggregate: s.energyAggregate,
      notes: s.notes,
    })),
    blogPosts: posts,
    pushDevices,
  };
}

// ── Delete (D8) ──────────────────────────────────────────────────────────────

export interface DeletionDeps {
  identity: IdentityAdmin;
  /** Removes the user row; every cycle, log and summary cascades with it in one statement. */
  deleteRows: (userId: string) => Promise<void>;
  /** Remembers a Cognito user still to be removed, for the boot/daily retry. */
  queueRetry: (cognitoSub: string) => Promise<void>;
  countPosts: (userId: string) => Promise<number>;
}

const realDeps = (): DeletionDeps => ({
  identity: cognitoAdmin(),
  deleteRows: async (userId) => {
    await prisma.user.delete({ where: { id: userId } });
  },
  queueRetry: async (cognitoSub) => {
    await prisma.pendingCognitoDeletion.upsert({
      where: { cognitoSub },
      create: { cognitoSub },
      update: {},
    });
  },
  countPosts: (userId) => prisma.blogPost.count({ where: { authorId: userId } }),
});

export type DeletionOutcome = 'deleted' | 'deleted_identity_pending';

/**
 * Permanently delete an account, in the order D8 fixes:
 *  1. disable the Cognito user, so she cannot sign back in mid-deletion;
 *  2. delete every row of hers in the database;
 *  3. delete the Cognito user — and if that fails, queue it; the account is already inert.
 *
 * It fails closed: if step 1 cannot run (no AWS credentials, Cognito down), nothing
 * is deleted and she is told to try again. If step 2 fails, step 1 is undone so she
 * is never locked out of an account that still holds her data.
 */
export async function deleteAccount(
  user: User,
  deps: DeletionDeps = realDeps(),
): Promise<DeletionOutcome> {
  // Posts are platform content other people read (schema: onDelete Restrict).
  if ((await deps.countPosts(user.id)) > 0) {
    throw new AppError(
      409,
      'author_has_posts',
      'Your account still has published or draft posts. Remove them or hand them to another author first.',
    );
  }

  try {
    await deps.identity.disable(user.cognitoSub);
  } catch {
    throw new AppError(
      503,
      'deletion_unavailable',
      "We couldn't delete your account just now, and nothing has been removed. Please try again in a little while.",
    );
  }

  try {
    await deps.deleteRows(user.id);
  } catch (error) {
    await deps.identity.enable(user.cognitoSub).catch(() => undefined);
    throw error;
  }

  try {
    await deps.identity.remove(user.cognitoSub);
    return 'deleted';
  } catch {
    await deps.queueRetry(user.cognitoSub);
    return 'deleted_identity_pending';
  }
}

/**
 * Finish any Cognito deletions that failed at step 3. Run on API boot and daily.
 * Idempotent: removing an already-removed user counts as done.
 */
export async function retryPendingDeletions(
  identity: IdentityAdmin = cognitoAdmin(),
): Promise<void> {
  const pending = await prisma.pendingCognitoDeletion.findMany();
  for (const row of pending) {
    try {
      await identity.remove(row.cognitoSub);
      await prisma.pendingCognitoDeletion.delete({ where: { id: row.id } });
    } catch {
      await prisma.pendingCognitoDeletion.update({
        where: { id: row.id },
        data: { attempts: { increment: 1 } },
      });
    }
  }
  if (pending.length) console.info(`cognito deletion retry: ${pending.length} pending checked`);
}
