import type { UserProfile } from '@shared/types';
import { apiFetch } from './client';

export function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/me');
}
