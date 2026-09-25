import type { OnboardingRequest, UserProfile } from '@shared/types';
import { apiFetch } from './client';

/** Saves the whole flow in one write and returns the updated profile. */
export function postOnboarding(body: OnboardingRequest): Promise<UserProfile> {
  return apiFetch<UserProfile>('/onboarding', { method: 'POST', body: JSON.stringify(body) });
}
