import type { AccountExport, DeleteAccountRequest } from '@shared/types';
import { apiFetch } from './client';

export function getAccountExport(): Promise<AccountExport> {
  return apiFetch<AccountExport>('/account/export');
}

export function deleteAccount(): Promise<{ outcome: string }> {
  const body: DeleteAccountRequest = { confirm: 'delete my account' };
  return apiFetch<{ outcome: string }>('/account', {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
}
