import type { CycleDto } from '@shared/types';
import { apiFetch } from './client';

export function getCycles(): Promise<CycleDto[]> {
  return apiFetch<CycleDto[]>('/cycles');
}

/** Record a period start — always an explicit choice, never inferred from a log. */
export function postCycleStart(startDate: string, today: string): Promise<CycleDto> {
  return apiFetch<CycleDto>('/cycles', {
    method: 'POST',
    body: JSON.stringify({ startDate, today }),
  });
}
