import type { HistoryDayDto } from '../../../shared/types';
import { addDays, toDbDate, toIsoDate } from '../lib/dates';
import { prisma } from '../lib/prisma';

/**
 * A month of what actually happened.
 *
 * This service deliberately returns *logged days only*: no estimate, no expected
 * period, no phase, nothing forward-looking. A calendar is where predictions
 * look most like facts, so the honest thing is for them never to reach it (D4).
 */
export async function historyForMonth(userId: string, month: string): Promise<HistoryDayDto[]> {
  const from = `${month}-01`;
  const to = addDays(`${month}-01`, daysInMonth(month) - 1);

  const [logs, cycles] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { userId, date: { gte: toDbDate(from), lte: toDbDate(to) } },
      orderBy: { date: 'asc' },
      select: { date: true, flow: true, bbtF: true, symptoms: true },
    }),
    // Cycle starts are recorded facts too — she chose them.
    prisma.cycle.findMany({
      where: { userId, startDate: { gte: toDbDate(from), lte: toDbDate(to) } },
      select: { startDate: true },
    }),
  ]);

  const starts = new Set(cycles.map((c) => toIsoDate(c.startDate)));

  return logs.map((log) => ({
    date: toIsoDate(log.date),
    flow: log.flow,
    hasTemp: log.bbtF !== null,
    symptomCount: log.symptoms.length,
    isCycleStart: starts.has(toIsoDate(log.date)),
  }));
}

/** Days in 'YYYY-MM', leap years included. */
function daysInMonth(month: string): number {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
}
