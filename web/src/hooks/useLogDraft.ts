import { useEffect, useReducer } from 'react';
import type { DailyLogDto } from '@shared/types';
import type { UpsertLogBody } from '@/lib/api/logs';

/**
 * The day currently being edited. Text fields stay strings so an empty box means
 * "nothing recorded" rather than zero; `toBody` turns them back into values or
 * explicit nulls, which is how the API clears a field.
 */
export interface LogDraft {
  flow: DailyLogDto['flow'];
  mood: string | null;
  energy: number | null;
  symptoms: string[];
  bbtF: string;
  tempTakenAt: string;
  isDisturbed: boolean;
  disturbedReason: string;
  cervicalMucus: DailyLogDto['cervicalMucus'];
  cervixPosition: DailyLogDto['cervixPosition'];
}

const EMPTY: LogDraft = {
  flow: null,
  mood: null,
  energy: null,
  symptoms: [],
  bbtF: '',
  tempTakenAt: '',
  isDisturbed: false,
  disturbedReason: '',
  cervicalMucus: null,
  cervixPosition: null,
};

export function draftFrom(log: DailyLogDto | null): LogDraft {
  if (!log) return EMPTY;
  return {
    flow: log.flow,
    mood: log.mood,
    energy: log.energy,
    symptoms: log.symptoms,
    bbtF: log.bbtF === null ? '' : String(log.bbtF),
    tempTakenAt: log.tempTakenAt ?? '',
    isDisturbed: log.isDisturbed,
    disturbedReason: log.disturbedReason ?? '',
    cervicalMucus: log.cervicalMucus,
    cervixPosition: log.cervixPosition,
  };
}

type Action =
  | { type: 'set'; patch: Partial<LogDraft> }
  | { type: 'toggleSymptom'; value: string }
  | { type: 'reset'; log: DailyLogDto | null };

function reducer(draft: LogDraft, action: Action): LogDraft {
  switch (action.type) {
    case 'set':
      return { ...draft, ...action.patch };
    case 'toggleSymptom':
      return {
        ...draft,
        symptoms: draft.symptoms.includes(action.value)
          ? draft.symptoms.filter((s) => s !== action.value)
          : [...draft.symptoms, action.value],
      };
    case 'reset':
      return draftFrom(action.log);
  }
}

/** A blank-or-empty temperature clears the field; anything else is sent as a number. */
function temperature(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
}

/** The draft as the request body. Every field is sent, so clearing one works. */
export function toBody(draft: LogDraft, date: string, today: string): UpsertLogBody {
  return {
    date,
    today,
    flow: draft.flow,
    mood: draft.mood,
    energy: draft.energy,
    symptoms: draft.symptoms,
    bbtF: temperature(draft.bbtF),
    tempTakenAt: draft.tempTakenAt.trim() === '' ? null : draft.tempTakenAt,
    isDisturbed: draft.isDisturbed,
    disturbedReason:
      draft.isDisturbed && draft.disturbedReason.trim() !== ''
        ? draft.disturbedReason.trim()
        : null,
    cervicalMucus: draft.cervicalMucus,
    cervixPosition: draft.cervixPosition,
  };
}

/** Holds the day being edited, and reloads when the saved day arrives or changes. */
export function useLogDraft(log: DailyLogDto | null, date: string) {
  const [draft, dispatch] = useReducer(reducer, log, draftFrom);

  // Switching day, or the day's saved values arriving, replaces what is on screen.
  useEffect(() => {
    dispatch({ type: 'reset', log });
  }, [log, date]);

  return {
    draft,
    set: (patch: Partial<LogDraft>) => dispatch({ type: 'set', patch }),
    toggleSymptom: (value: string) => dispatch({ type: 'toggleSymptom', value }),
  };
}
