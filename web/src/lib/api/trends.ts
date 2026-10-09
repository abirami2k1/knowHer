import type { TrendsDto } from '@shared/types';
import { apiFetch } from './client';

/** `today` lets the API read her live cycle as of her own day (D1). */
export function getTrends(today: string): Promise<TrendsDto> {
  return apiFetch<TrendsDto>(`/trends?today=${today}`);
}
