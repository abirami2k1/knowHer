import type { AgeBand, Condition, Goal } from '@shared/types';

/**
 * All onboarding wording and option labels live here, so the tone can be tuned
 * without touching flow logic. Each step carries a short "why we ask" line —
 * nothing is requested without a reason the user can see.
 */

export interface Option<T> {
  value: T;
  label: string;
  hint?: string;
}

export const AGE_BAND_OPTIONS: Option<AgeBand>[] = [
  { value: 'under18', label: 'Under 18' },
  { value: 'b18_24', label: '18–24' },
  { value: 'b25_34', label: '25–34' },
  { value: 'b35_44', label: '35–44' },
  { value: 'b45_plus', label: '45 or older' },
];

export const CONDITION_OPTIONS: Option<Condition>[] = [
  { value: 'pcod', label: 'PCOD / PCOS' },
  { value: 'pmdd', label: 'PMDD' },
  { value: 'endo', label: 'Endometriosis' },
  { value: 'none', label: 'None of these' },
  { value: 'unsure', label: "I'm not sure" },
];

/** 'none' and 'unsure' are answers on their own — the API enforces this too. */
export const EXCLUSIVE_CONDITIONS: Condition[] = ['none', 'unsure'];

export const GOAL_OPTIONS: Option<Goal>[] = [
  { value: 'understand_body', label: 'Understand my body better' },
  { value: 'track_period', label: 'Keep track of my period' },
  { value: 'ovulation_awareness', label: 'Know when I ovulate' },
  { value: 'plan_life', label: 'Plan my life around my cycle' },
  { value: 'manage_condition', label: 'Manage a condition' },
  { value: 'learn', label: 'Just learning for now' },
];

/** Choosing this opens the optional BBT/mucus step. */
export const TRACKING_GOAL: Goal = 'ovulation_awareness';

export const WHY = {
  profile: 'Your name is just so the app can greet you. Age helps us read your cycle in context.',
  history:
    "This gives your first cycle a starting point. Not sure? That's genuinely fine — we'll begin when your next period does.",
  health: 'So we never force a 28-day model onto a body that does not work that way.',
  goals: 'This shapes what you see first. You can change your mind any time.',
  tracking:
    'Temperature and mucus are what let us confirm ovulation afterwards — never predict it in advance.',
} as const;

export const CYCLE_LENGTH_HINT =
  'Roughly how many days from one period to the next? Leave blank if you are not sure.';
export const PERIOD_LENGTH_HINT =
  'How many days does your bleeding usually last? Leave blank if it varies.';
