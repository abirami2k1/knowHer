/**
 * Days written while offline, replayed when the connection comes back.
 *
 * The replay goes through the normal API client, not a service-worker
 * Background Sync: the SW would replay hours later with the Cognito token it
 * captured at the time, which by then has expired, and every write would 401
 * in silence. Going through the client means the token is refreshed first.
 *
 * `PUT /logs` is an upsert keyed on (user, date), so replaying is safe at any
 * distance in time — last write wins, exactly as it does online (D2/D5).
 */

import { ApiClientError } from '@/lib/api/client';
import { putLog, type UpsertLogBody } from '@/lib/api/logs';
import { getAll, put, QUEUED_LOGS, remove } from './db';

export interface QueuedLog {
  /** Also the key: a second edit of the same day replaces the first. */
  date: string;
  body: UpsertLogBody;
  queuedAt: string;
}

/** True when a failure was the network rather than the API saying no. */
export function isOffline(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === 'network_error';
}

export async function queueLog(body: UpsertLogBody): Promise<void> {
  const entry: QueuedLog = { date: body.date, body, queuedAt: new Date().toISOString() };
  await put(QUEUED_LOGS, entry);
}

export function pendingLogs(): Promise<QueuedLog[]> {
  return getAll<QueuedLog>(QUEUED_LOGS);
}

export interface ReplayResult {
  sent: number;
  /** Entries the API refused outright; they are dropped rather than retried forever. */
  rejected: number;
  /** True when the connection gave out again and entries are still waiting. */
  stillOffline: boolean;
}

/**
 * Sends everything waiting, oldest first. Stops at the first network failure —
 * the rest are still queued and the next attempt picks them up. An entry the
 * API *rejects* is removed instead: a day it will never accept would otherwise
 * block every day queued behind it.
 */
export async function replayQueue(): Promise<ReplayResult> {
  const result: ReplayResult = { sent: 0, rejected: 0, stillOffline: false };
  const waiting = (await pendingLogs()).sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));

  for (const entry of waiting) {
    try {
      await putLog(entry.body);
      await remove(QUEUED_LOGS, entry.date);
      result.sent += 1;
    } catch (error) {
      if (isOffline(error)) {
        result.stillOffline = true;
        break;
      }
      await remove(QUEUED_LOGS, entry.date);
      result.rejected += 1;
    }
  }

  return result;
}
