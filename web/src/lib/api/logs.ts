import type { DailyLogDto } from '@shared/types';
import { apiFetch } from './client';

/** Everything a day can carry. The date identifies it; the rest is optional. */
export interface UpsertLogBody {
  date: string;
  today: string;
  flow?: DailyLogDto['flow'];
  bbtF?: number | null;
  tempTakenAt?: string | null;
  isDisturbed?: boolean;
  disturbedReason?: string | null;
  cervicalMucus?: DailyLogDto['cervicalMucus'];
  cervixPosition?: DailyLogDto['cervixPosition'];
  mood?: string | null;
  energy?: number | null;
  symptoms?: string[];
}

/** Save or edit a day (upsert by date). */
export function putLog(body: UpsertLogBody): Promise<DailyLogDto> {
  return apiFetch<DailyLogDto>('/logs', { method: 'PUT', body: JSON.stringify(body) });
}

/** The logged days in an inclusive range. */
export function getLogs(from: string, to: string): Promise<DailyLogDto[]> {
  return apiFetch<DailyLogDto[]>(`/logs?from=${from}&to=${to}`);
}
