import type { DashboardDto } from '../../../shared/types';
import {
  CYCLE_COPY,
  cycleStats,
  expectedOvulationDay,
  isFallback,
  resolvePhase,
  type CopyKey,
} from '../domain/cycle';
import type { User } from '../generated/prisma/client';
import { addDays, daysBetween, toIsoDate, type CalendarDate } from '../lib/dates';
import { prisma } from '../lib/prisma';
import { assess, cycleCovering, logsForCycle, toEngineInput } from './cycles';

/**
 * Today, assembled. Every number comes from the engine; this only fetches rows
 * and hands them over.
 *
 * `today` is the user's own calendar day, sent by the client (D1) — the server
 * never decides what day it is for her.
 */
export async function buildDashboard(user: User, today: CalendarDate): Promise<DashboardDto> {
  const cycle = await cycleCovering(user.id, today);

  // Closed cycles only: a running cycle has no length to average.
  // (Task 10 unions CycleSummary here, for cycles whose raw logs were pruned.)
  const closed = await prisma.cycle.findMany({
    where: { userId: user.id, length: { not: null } },
    select: { length: true },
  });
  const stats = cycleStats(closed.map((c) => c.length as number));
  const expected = expectedOvulationDay({ stats, selfReportedAvg: user.avgCycleLength });

  // Her typical length, for the UI to draw against. Own history first, then what
  // she told us at onboarding; null rather than a stand-in number.
  const cycleLengthTypical = stats.n >= 1 ? Math.round(stats.mean) : (user.avgCycleLength ?? null);

  if (!cycle) {
    return {
      cycleDay: null,
      phase: 'unknown',
      basis: 'none',
      phaseCopy: CYCLE_COPY['fallback.no_history'],
      insight: CYCLE_COPY['insight.unknown'],
      expectedOvulation: null,
      confirmedOvulationDay: null,
      cycleLengthTypical,
      fallback: 'no_history',
    };
  }

  const todayCycleDay = daysBetween(toIsoDate(cycle.startDate), today) + 1;
  const fallback = isFallback({ stats, todayCycleDay, hasCurrentCycle: true });
  const assessment = await assess(user.id, cycle, today);
  const logs = toEngineInput(cycle, await logsForCycle(user.id, cycle), today).logs;

  const phase = resolvePhase({ assessment, todayCycleDay, logs, expected, fallback });

  return {
    cycleDay: todayCycleDay,
    phase: phase.phase,
    basis: phase.basis,
    phaseCopy: CYCLE_COPY[phase.copyKey as CopyKey],
    insight: CYCLE_COPY[`insight.${phase.phase}`],
    // An estimate is never shown while the app is declining to place her cycle.
    expectedOvulation:
      expected && !fallback
        ? {
            date: addDays(toIsoDate(cycle.startDate), expected.day - 1),
            cycleDay: expected.day,
            basis: expected.basis,
          }
        : null,
    confirmedOvulationDay: assessment.ovulationDay,
    cycleLengthTypical,
    fallback,
  };
}
