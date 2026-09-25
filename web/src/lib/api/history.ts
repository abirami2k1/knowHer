import type { HistoryDayDto } from '@shared/types';
import { apiFetch } from './client';

/** One month of logged days. The API sends facts only — no predictions exist here. */
export function getHistory(month: string): Promise<HistoryDayDto[]> {
  return apiFetch<HistoryDayDto[]>(`/history?month=${month}`);
}
