import type { AssessmentResponse } from '@shared/types';
import { apiFetch } from './client';

/** `today` lets the engine assess a live cycle as of the user's own day (D1). */
export function getAssessment(cycleId: string, today: string): Promise<AssessmentResponse> {
  return apiFetch<AssessmentResponse>(`/cycles/${cycleId}/assessment?today=${today}`);
}
