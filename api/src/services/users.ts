import type { UserProfile } from '../../../shared/types';
import type { User } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

/**
 * The User row for a verified Cognito subject, created on first sight.
 * Upsert (not find-then-create) so two first requests racing can't both insert.
 */
export function findOrCreateUserByCognitoSub(cognitoSub: string): Promise<User> {
  return prisma.user.upsert({ where: { cognitoSub }, create: { cognitoSub }, update: {} });
}

/** What the client is allowed to see about a user. Never includes cognitoSub. */
export function toProfile(user: User): UserProfile {
  return {
    id: user.id,
    displayName: user.displayName,
    ageBand: user.ageBand,
    conditions: user.conditions,
    goals: user.goals,
    trackingBBT: user.trackingBBT,
    trackingMucus: user.trackingMucus,
    avgCycleLength: user.avgCycleLength,
    avgPeriodLength: user.avgPeriodLength,
    tempUnit: user.tempUnit,
    role: user.role,
    onboardedAt: user.onboardedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
