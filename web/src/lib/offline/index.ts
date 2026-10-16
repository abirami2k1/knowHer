import { clearStore, QUEUED_LOGS } from './db';
import { clearCachedDashboard } from './dashboard-cache';

export { isOffline, pendingLogs, queueLog, replayQueue, type QueuedLog } from './queue';
export { cacheDashboard, readCachedDashboard, type CachedDashboard } from './dashboard-cache';

/**
 * Everything knowHer left on this device. Called on sign-out and after account
 * deletion — a phone gets shared, and unsent days are still her health data.
 */
export async function clearOfflineData(): Promise<void> {
  clearCachedDashboard();
  try {
    await clearStore(QUEUED_LOGS);
  } catch {
    // An unopenable store has nothing in it to leak.
  }
}
