import type { PushKeyDto, PushPreferenceDto, SavePushSubscriptionRequest } from '@shared/types';
import { apiFetch } from './client';

export function getPushKey(): Promise<PushKeyDto> {
  return apiFetch<PushKeyDto>('/push/key');
}

export function getPushSubscriptions(): Promise<PushPreferenceDto[]> {
  return apiFetch<PushPreferenceDto[]>('/push/subscriptions');
}

export function savePushSubscription(
  body: SavePushSubscriptionRequest,
): Promise<PushPreferenceDto> {
  return apiFetch<PushPreferenceDto>('/push/subscriptions', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function removePushSubscription(endpoint: string): Promise<{ removed: boolean }> {
  return apiFetch<{ removed: boolean }>('/push/subscriptions', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  });
}
