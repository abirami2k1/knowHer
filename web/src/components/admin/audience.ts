import type { Audience } from '@shared/types';

/** Who a post is for, in the words an author would use. */
export const AUDIENCE_LABEL: Record<Audience, string> = {
  user: 'readers',
  supporter: 'supporters',
  both: 'everyone',
};

export const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  { value: 'user', label: 'Readers', hint: 'Shows under From Sivi.' },
  { value: 'supporter', label: 'Supporters', hint: 'Shows under For supporters.' },
  { value: 'both', label: 'Everyone', hint: 'Shows in both sections.' },
];
