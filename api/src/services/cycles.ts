import type { CycleDto } from '../../../shared/types';
import { assessCycle, type CycleAssessment, type CycleInput, type CycleLog } from '../domain/cycle';
import type { Cycle, DailyLog } from '../generated/prisma/client';
import { AppError } from '../lib/errors';
import { daysBetween, toDbDate, toIsoDate, type CalendarDate } from '../lib/dates';
import { prisma } from '../lib/prisma';
import { planEditStart, planStart, type Interval } from './cycle-intervals';

/**
 * Cycles are intervals (D2): a cycle owns every day from its startDate up to the
 * day before the next cycle starts. DailyLog has no cycleId, so membership is
 * resolved here at query time and editing a boundary can never orphan a log.
 *
 * This module is the only place cycle boundaries are created or moved.
 */

/** Row → client shape. Dates go back as plain calendar dates; coverline as a number. */
export function toCycleDto(cycle: Cycle): CycleDto {
  return {
    id: cycle.id,
    startDate: toIsoDate(cycle.startDate),
    endDate: cycle.endDate ? toIsoDate(cycle.endDate) : null,
    length: cycle.length,
    coverlineF: cycle.coverlineF === null ? null : Number(cycle.coverlineF),
    ovulationDay: cycle.ovulationDay,
    peakDay: cycle.peakDay,
    lutealLength: cycle.lutealLength,
    isAnovulatory: cycle.isAnovulatory,
    confidence: cycle.confidence,
  };
}

/** The user's cycles, newest first. */
export function listCycles(userId: string): Promise<Cycle[]> {
  return prisma.cycle.findMany({ where: { userId }, orderBy: { startDate: 'desc' } });
}

/** One of her cycles by id. Ownership is part of the lookup, never a later check. */
export function findCycle(userId: string, id: string): Promise<Cycle | null> {
  return prisma.cycle.findFirst({ where: { id, userId } });
}

/** The open cycle (no endDate), if she has one. */
export function currentCycle(userId: string): Promise<Cycle | null> {
  return prisma.cycle.findFirst({
    where: { userId, endDate: null },
    orderBy: { startDate: 'desc' },
  });
}

/** The cycle whose interval contains `date`, or null. */
export function cycleCovering(userId: string, date: CalendarDate): Promise<Cycle | null> {
  return prisma.cycle.findFirst({
    where: {
      userId,
      startDate: { lte: toDbDate(date) },
      OR: [{ endDate: null }, { endDate: { gte: toDbDate(date) } }],
    },
    orderBy: { startDate: 'desc' },
  });
}

/** The logs inside a cycle's interval — the one helper that resolves membership. */
export function logsForCycle(userId: string, cycle: Cycle): Promise<DailyLog[]> {
  return prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: cycle.startDate, ...(cycle.endDate ? { lte: cycle.endDate } : {}) },
    },
    orderBy: { date: 'asc' },
  });
}

/** Rows → engine input. Cycle day is 1-based from the cycle's start. */
export function toEngineInput(
  cycle: Cycle,
  logs: DailyLog[],
  todayDate?: CalendarDate,
): CycleInput {
  const start = toIsoDate(cycle.startDate);
  const cycleLogs: CycleLog[] = logs.map((log) => ({
    cycleDay: daysBetween(start, toIsoDate(log.date)) + 1,
    date: toIsoDate(log.date),
    // Prisma hands back Decimal, which does not compare like a number.
    ...(log.bbtF !== null && { bbtF: Number(log.bbtF) }),
    isDisturbed: log.isDisturbed,
    ...(log.cervicalMucus !== null && { cervicalMucus: log.cervicalMucus }),
    ...(log.flow !== null && { flow: log.flow }),
  }));

  return {
    logs: cycleLogs,
    ...(cycle.endDate && {
      cycleLength: daysBetween(start, toIsoDate(cycle.endDate)) + 1,
    }),
    ...(!cycle.endDate && todayDate && { todayCycleDay: daysBetween(start, todayDate) + 1 }),
  };
}

/** The engine's verdict for a cycle, run over the logs its interval contains. */
export async function assess(
  userId: string,
  cycle: Cycle,
  todayDate?: CalendarDate,
): Promise<CycleAssessment> {
  const logs = await logsForCycle(userId, cycle);
  return assessCycle(toEngineInput(cycle, logs, todayDate));
}

/** The assessment fields as they are stored on a closed Cycle row (D4 snapshot). */
function snapshotFrom(assessment: CycleAssessment) {
  return {
    coverlineF: assessment.coverlineF,
    ovulationDay: assessment.ovulationDay,
    peakDay: assessment.peakDay,
    lutealLength: assessment.lutealLength,
    isAnovulatory: assessment.isAnovulatory,
    confidence: assessment.confidence,
  };
}

/**
 * Recompute and re-persist a closed cycle's snapshot. Called after any log edit
 * inside its range, so a backfilled temperature is never silently ignored.
 * Live cycles keep no snapshot — they are computed on read (D4).
 */
export async function refreshSnapshot(userId: string, cycle: Cycle): Promise<void> {
  if (!cycle.endDate) return;
  const assessment = await assess(userId, cycle);
  await prisma.cycle.update({ where: { id: cycle.id }, data: snapshotFrom(assessment) });
}

/** The intervals this user already has, in the shape the planner works with. */
async function intervalsFor(userId: string): Promise<Interval[]> {
  const cycles = await prisma.cycle.findMany({
    where: { userId },
    orderBy: { startDate: 'asc' },
    select: { id: true, startDate: true, endDate: true },
  });
  return cycles.map((c) => ({
    id: c.id,
    startDate: toIsoDate(c.startDate),
    endDate: c.endDate ? toIsoDate(c.endDate) : null,
  }));
}

/** Recompute the snapshots of the closed cycles a boundary change touched. */
async function refreshSnapshots(userId: string, ids: (string | null | undefined)[]): Promise<void> {
  for (const id of ids) {
    if (!id) continue;
    const row = await prisma.cycle.findUnique({ where: { id } });
    if (row) await refreshSnapshot(userId, row);
  }
}

/**
 * Record a period start (D3 — always an explicit user action, never inferred).
 * The arithmetic, including the backfill-into-history case, lives in
 * `planStart`; this applies it.
 */
export async function startCycle(userId: string, startDate: CalendarDate): Promise<Cycle> {
  const plan = planStart(await intervalsFor(userId), startDate);

  const created = await prisma.$transaction(async (tx) => {
    if (plan.close) {
      await tx.cycle.update({
        where: { id: plan.close.id },
        data: { endDate: toDbDate(plan.close.endDate), length: plan.close.length },
      });
    }
    return tx.cycle.create({
      data: {
        userId,
        startDate: toDbDate(plan.create.startDate),
        ...(plan.create.endDate && {
          endDate: toDbDate(plan.create.endDate),
          length: plan.create.length,
        }),
      },
    });
  });

  // Outside the transaction: snapshots are derived data, and a failure here must
  // not undo the boundary the user just recorded.
  await refreshSnapshots(userId, [plan.close?.id, created.endDate ? created.id : null]);
  return created;
}

/**
 * Correct a cycle's start date. Only intervals change — logs are never
 * reassigned, because they were never owned in the first place (D2).
 */
export async function editCycleStart(
  userId: string,
  cycleId: string,
  startDate: CalendarDate,
): Promise<Cycle> {
  const owned = await prisma.cycle.findFirst({ where: { id: cycleId, userId } });
  if (!owned) throw new AppError(404, 'not_found', 'That cycle could not be found');

  const plan = planEditStart(await intervalsFor(userId), cycleId, startDate);

  const updated = await prisma.$transaction(async (tx) => {
    if (plan.close) {
      await tx.cycle.update({
        where: { id: plan.close.id },
        data: { endDate: toDbDate(plan.close.endDate), length: plan.close.length },
      });
    }
    return tx.cycle.update({
      where: { id: plan.update.id },
      data: { startDate: toDbDate(plan.update.startDate), length: plan.update.length },
    });
  });

  await refreshSnapshots(userId, [plan.close?.id, updated.endDate ? updated.id : null]);
  return updated;
}
