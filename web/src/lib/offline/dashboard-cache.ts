/**
 * The last dashboard the API sent, kept so an opened app with no connection
 * still has something true to show — clearly dated, never passed off as fresh.
 *
 * Only the dashboard is cached. A cycle assessment is not: the engine lives on
 * the server by design (D5), and a stale coverline or ovulation day presented
 * as current would be a worse answer than none.
 */

import type { DashboardDto } from '@shared/types';

const KEY = 'knowher.dashboard';

export interface CachedDashboard {
  data: DashboardDto;
  /** When it was fetched, so the screen can say "as of ...". */
  fetchedAt: string;
  /** The calendar day it described; a cache from yesterday is not today's. */
  today: string;
}

export function cacheDashboard(data: DashboardDto, today: string): void {
  const entry: CachedDashboard = { data, fetchedAt: new Date().toISOString(), today };
  try {
    localStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    // A full or blocked store is not worth failing a render over.
  }
}

export function readCachedDashboard(): CachedDashboard | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CachedDashboard) : null;
  } catch {
    return null;
  }
}

export function clearCachedDashboard(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do; the next sign-in overwrites it anyway.
  }
}
