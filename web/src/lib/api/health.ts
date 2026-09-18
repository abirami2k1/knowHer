import { apiFetch } from './client';

export interface HealthData {
  status: 'ok';
}

export function getHealth(): Promise<HealthData> {
  return apiFetch<HealthData>('/health');
}
