import { useMemo, useReducer, useState } from 'react';
import type { AgeBand, Condition, Goal, OnboardingRequest } from '@shared/types';
import { todayIsoDate } from '@/lib/dates';
import { EXCLUSIVE_CONDITIONS, TRACKING_GOAL } from '@/pages/onboarding/copy';

/** The steps, in order. The tracking step only appears for the ovulation goal. */
export const STEP_IDS = [
  'welcome',
  'profile',
  'history',
  'health',
  'goals',
  'tracking',
  'confirm',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export interface OnboardingDraft {
  displayName: string;
  ageBand: AgeBand | null;
  /** null until she answers; 'not_sure' is a real answer, not a skip. */
  knowsLastPeriod: 'yes' | 'not_sure' | null;
  lastPeriodStart: string;
  /** Kept as text so an empty box means "not sure" rather than 0. */
  avgCycleLength: string;
  avgPeriodLength: string;
  conditions: Condition[];
  goals: Goal[];
  trackingBBT: boolean;
  trackingMucus: boolean;
}

const EMPTY_DRAFT: OnboardingDraft = {
  displayName: '',
  ageBand: null,
  knowsLastPeriod: null,
  lastPeriodStart: '',
  avgCycleLength: '',
  avgPeriodLength: '',
  conditions: [],
  goals: [],
  trackingBBT: false,
  trackingMucus: false,
};

type Action =
  | { type: 'set'; patch: Partial<OnboardingDraft> }
  | { type: 'toggleCondition'; value: Condition }
  | { type: 'toggleGoal'; value: Goal };

/** Selecting a real condition drops "none"/"unsure", and vice versa (the API refuses the mix). */
function toggleCondition(conditions: Condition[], value: Condition): Condition[] {
  if (conditions.includes(value)) return conditions.filter((c) => c !== value);
  if (EXCLUSIVE_CONDITIONS.includes(value)) return [value];
  return [...conditions.filter((c) => !EXCLUSIVE_CONDITIONS.includes(c)), value];
}

function reducer(draft: OnboardingDraft, action: Action): OnboardingDraft {
  switch (action.type) {
    case 'set':
      return { ...draft, ...action.patch };
    case 'toggleCondition':
      return { ...draft, conditions: toggleCondition(draft.conditions, action.value) };
    case 'toggleGoal': {
      const goals = draft.goals.includes(action.value)
        ? draft.goals.filter((g) => g !== action.value)
        : [...draft.goals, action.value];
      // Dropping the ovulation goal hides the tracking step, so don't keep its answers.
      const wantsTracking = goals.includes(TRACKING_GOAL);
      return {
        ...draft,
        goals,
        trackingBBT: wantsTracking && draft.trackingBBT,
        trackingMucus: wantsTracking && draft.trackingMucus,
      };
    }
  }
}

/** Which steps this draft actually shows. */
function stepsFor(draft: OnboardingDraft): StepId[] {
  return STEP_IDS.filter((id) => id !== 'tracking' || draft.goals.includes(TRACKING_GOAL));
}

/** Whether the current step has what it needs to advance. */
function canAdvance(step: StepId, draft: OnboardingDraft): boolean {
  switch (step) {
    case 'profile':
      return draft.displayName.trim().length > 0 && draft.ageBand !== null;
    case 'history':
      // "Not sure" advances freely; a known date must actually be picked.
      return draft.knowsLastPeriod === 'not_sure' || draft.lastPeriodStart !== '';
    case 'health':
      return draft.conditions.length > 0;
    case 'goals':
      return draft.goals.length > 0;
    default:
      return true;
  }
}

function optionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : undefined;
}

/** The draft turned into the one request the flow submits. */
export function buildRequest(draft: OnboardingDraft, today = todayIsoDate()): OnboardingRequest {
  const knowsDate = draft.knowsLastPeriod === 'yes' && draft.lastPeriodStart !== '';
  return {
    displayName: draft.displayName.trim(),
    ageBand: draft.ageBand as AgeBand,
    conditions: draft.conditions,
    goals: draft.goals,
    trackingBBT: draft.trackingBBT,
    trackingMucus: draft.trackingMucus,
    ...(optionalInt(draft.avgCycleLength) !== undefined && {
      avgCycleLength: optionalInt(draft.avgCycleLength),
    }),
    ...(optionalInt(draft.avgPeriodLength) !== undefined && {
      avgPeriodLength: optionalInt(draft.avgPeriodLength),
    }),
    // The date and the user's own today travel together (D1) or not at all.
    ...(knowsDate && { lastPeriodStart: draft.lastPeriodStart, today }),
  };
}

/**
 * Holds the whole flow in memory and writes once at the end (no per-step saves),
 * so a half-finished onboarding leaves nothing behind.
 */
export function useOnboarding() {
  const [draft, dispatch] = useReducer(reducer, EMPTY_DRAFT);
  const [stepIndex, setStepIndex] = useState(0);
  const goToStep = (next: number) => setStepIndex(Math.max(0, next));

  const steps = useMemo(() => stepsFor(draft), [draft]);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];

  return {
    draft,
    step,
    /** 1-based, for "Step 2 of 7". */
    stepNumber: index + 1,
    stepCount: steps.length,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    canAdvance: canAdvance(step, draft),
    set: (patch: Partial<OnboardingDraft>) => dispatch({ type: 'set', patch }),
    toggleCondition: (value: Condition) => dispatch({ type: 'toggleCondition', value }),
    toggleGoal: (value: Goal) => dispatch({ type: 'toggleGoal', value }),
    next: () => goToStep(index + 1),
    back: () => goToStep(index - 1),
  };
}
