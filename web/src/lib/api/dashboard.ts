import type { DashboardDto } from '@shared/types';
import { apiFetch } from './client';

/** `today` is the user's own calendar day — the API refuses to assume one (D1). */
export function getDashboard(today: string): Promise<DashboardDto> {
  return apiFetch<DashboardDto>(`/dashboard?today=${today}`);
}
