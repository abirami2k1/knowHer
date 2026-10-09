import type { TrendsDto } from '../../../shared/types';
import {
  CYCLE_COPY,
  CYCLE_RULES,
  assessCycle,
  cycleStats,
  dayPlacer,
  energyByPhase,
  lengthNote,
  mergeCycleHistory,
  symptomPatterns,
  type CompletedCycle,
  type TrendDay,
} from '../domain/cycle';
import { toDbDate, toIsoDate, type CalendarDate } from '../lib/dates';
import { prisma } from '../lib/prisma';
import { logsForCycle, toEngineInput } from './cycles';

/**
 * Every closed cycle she has, from whichever store still holds it: the Cycle row
 * while it exists, the CycleSummary once its raw logs have been pruned (D4).
 * Shared with the dashboard, so both count her history the same way.
 */
export async function completedCycles(userId: string): Promise<CompletedCycle[]> {
  const [cycles, summaries] = await Promise.all([
    prisma.cycle.findMany({
      where: { userId, endDate: { not: null }, length: { not: null } },
      select: { startDate: true, length: true, lutealLength: true, isAnovulatory: true },
    }),
    prisma.cycleSummary.findMany({
      where: { userId },
      select: { cycleStartDate: true, cycleLength: true, lutealLength: true },
    }),
  ]);

  return mergeCycleHistory(
    cycles.map((c) => ({
      startDate: toIsoDate(c.startDate),
      length: c.length as number,
      lutealLength: c.lutealLength,
      isAnovulatory: c.isAnovulatory,
      source: 'cycle',
    })),
    summaries.map((s) => ({
      startDate: toIsoDate(s.cycleStartDate),
      length: s.cycleLength,
      lutealLength: s.lutealLength,
      // A summary records no anovulatory verdict; absent is not a claim either way.
      isAnovulatory: false,
      source: 'summary',
    })),
  );
}

/**
 * The recent cycles' logged days, each placed in a phase where there is evidence
 * (or a known end to count back from) to place it by.
 *
 * Closed cycles use their stored snapshot (D4); the live one runs the engine as
 * of her own today, so a shift confirmed this morning already counts.
 */
async function recentDays(
  userId: string,
  today: CalendarDate,
): Promise<{ days: TrendDay[]; cycles: number; since: string | null }> {
  const cycles = await prisma.cycle.findMany({
    where: { userId, startDate: { lte: toDbDate(today) } },
    orderBy: { startDate: 'desc' },
    take: CYCLE_RULES.trendRecentCycles,
  });

  const perCycle = await Promise.all(
    cycles.map(async (cycle) => {
      const logs = await logsForCycle(userId, cycle);
      const input = toEngineInput(cycle, logs, today);
      const live = cycle.endDate === null;
      const assessment = live ? assessCycle(input) : null;

      const place = dayPlacer({
        logs: input.logs,
        ovulationDay: assessment ? assessment.ovulationDay : cycle.ovulationDay,
        isAnovulatory: assessment ? assessment.isAnovulatory : cycle.isAnovulatory,
        ...(input.cycleLength !== undefined && { cycleLength: input.cycleLength }),
      });

      return logs.map((log, i): TrendDay => ({
        placement: place(input.logs[i].cycleDay),
        energy: log.energy,
        symptoms: log.symptoms,
      }));
    }),
  );

  return {
    days: perCycle.flat(),
    cycles: cycles.length,
    since: cycles.length ? toIsoDate(cycles[cycles.length - 1].startDate) : null,
  };
}

/** Patterns over time. Numbers come from the engine; sentences from its copy map. */
export async function buildTrends(userId: string, today: CalendarDate): Promise<TrendsDto> {
  const [history, recent] = await Promise.all([completedCycles(userId), recentDays(userId, today)]);

  const lengths = history.map((c) => c.length);
  const stats = cycleStats(lengths);
  const energy = energyByPhase(recent.days);
  const symptoms = symptomPatterns(recent.days);

  return {
    cycles: history.map(({ startDate, length, lutealLength, isAnovulatory }) => ({
      startDate,
      length,
      lutealLength,
      isAnovulatory,
    })),
    lengths: {
      typical: stats.n ? Math.round(stats.mean) : null,
      shortest: stats.n ? Math.min(...lengths) : null,
      longest: stats.n ? Math.max(...lengths) : null,
    },
    energyByPhase: energy,
    symptoms,
    recent: { cycles: recent.cycles, loggedDays: recent.days.length, since: recent.since },
    notes: {
      lengths: CYCLE_COPY[`trends.${lengthNote(stats)}`],
      luteal:
        CYCLE_COPY[
          history.some((c) => c.lutealLength !== null)
            ? 'trends.luteal.about'
            : 'trends.luteal.none'
        ],
      energy:
        CYCLE_COPY[
          energy.some((e) => e.average !== null) ? 'trends.energy.about' : 'trends.energy.none'
        ],
      energyEstimated: energy.some((e) => e.average !== null && e.estimatedDays > 0)
        ? CYCLE_COPY['trends.energy.estimated']
        : null,
      symptoms: CYCLE_COPY[symptoms.length ? 'trends.symptoms.about' : 'trends.symptoms.none'],
    },
  };
}
