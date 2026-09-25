import type { User } from '../generated/prisma/client';
import { toDbDate } from '../lib/dates';
import { prisma } from '../lib/prisma';
import type { OnboardingInput } from '../schemas/users';

/**
 * The single write at the end of onboarding: save the profile, mark onboarding
 * finished, and — only if she told us when her last period started — open her
 * first cycle from that date.
 *
 * "Not sure" is a first-class answer: no cycle is created, and the dashboard says
 * so honestly rather than inventing a start date. `today` is the client's own
 * calendar day (D1) and is used only to bound the remembered date in Zod.
 *
 * One transaction, so a user is never left onboarded-but-cycleless (or the reverse).
 * Re-submitting is safe: onboardedAt keeps its original value and a cycle already
 * starting on that date is left alone rather than duplicated.
 */
export async function completeOnboarding(user: User, input: OnboardingInput): Promise<User> {
  const { lastPeriodStart, today: _today, ...profile } = input;

  return prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: user.id },
      data: { ...profile, onboardedAt: user.onboardedAt ?? new Date() },
    });

    if (lastPeriodStart) {
      const startDate = toDbDate(lastPeriodStart);
      const existing = await tx.cycle.findFirst({ where: { userId: user.id, startDate } });
      // The cycle stays open (no endDate): the next logged period start closes it (D3).
      if (!existing) await tx.cycle.create({ data: { userId: user.id, startDate } });
    }

    return saved;
  });
}
