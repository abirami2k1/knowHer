import type { DailyLogDto } from '../../../shared/types';
import type { DailyLog } from '../generated/prisma/client';
import { toDbDate, toIsoDate, type CalendarDate } from '../lib/dates';
import { prisma } from '../lib/prisma';
import type { UpsertLogInput } from '../schemas/logs';
import { cycleCovering, refreshSnapshot } from './cycles';

/**
 * One entry per day, upserted on (userId, date) — so saving, editing and
 * backfilling are the same operation, and an offline queue replaying later is
 * last-write-wins (D5) rather than a duplicate.
 *
 * Fields left out of the request are left untouched; sending null clears one.
 *
 * If the day falls inside a cycle that has already closed, that cycle's stored
 * assessment is recomputed (D4) — a temperature backfilled weeks later must not
 * leave a stale verdict behind. Live cycles hold no snapshot to refresh.
 */
export async function upsertLog(userId: string, input: UpsertLogInput): Promise<DailyLogDto> {
  const { date, today: _today, ...fields } = input;
  const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));

  const saved = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: toDbDate(date) } },
    create: { userId, date: toDbDate(date), ...data },
    update: data,
  });

  const cycle = await cycleCovering(userId, date);
  if (cycle?.endDate) await refreshSnapshot(userId, cycle);

  return toDailyLogDto(saved);
}

/** The logged days in an inclusive calendar-date range, oldest first. */
export async function listLogs(
  userId: string,
  from: CalendarDate,
  to: CalendarDate,
): Promise<DailyLogDto[]> {
  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: toDbDate(from), lte: toDbDate(to) } },
    orderBy: { date: 'asc' },
  });
  return logs.map(toDailyLogDto);
}

/**
 * Row → client shape. `date` goes back as the plain calendar date it came in as,
 * and bbtF as a number: Prisma hands back a Decimal, which does not compare like
 * one (the engine only ever sees plain numbers).
 */
export function toDailyLogDto(log: DailyLog): DailyLogDto {
  return {
    date: toIsoDate(log.date),
    flow: log.flow,
    bbtF: log.bbtF === null ? null : Number(log.bbtF),
    tempTakenAt: log.tempTakenAt,
    isDisturbed: log.isDisturbed,
    disturbedReason: log.disturbedReason,
    cervicalMucus: log.cervicalMucus,
    cervixPosition: log.cervixPosition,
    mood: log.mood,
    energy: log.energy,
    symptoms: log.symptoms,
  };
}
