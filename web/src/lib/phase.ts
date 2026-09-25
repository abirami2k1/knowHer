import type { Phase } from '@shared/types';

/**
 * The visual language of the cycle. A phase is not decoration here — it is the
 * one thing the app knows that a calendar does not, so it gets its own colour,
 * surface and mark, and they stay consistent everywhere they appear.
 *
 * Wording still comes from the API's copy map; only the look lives here.
 */
export interface PhaseStyle {
  label: string;
  /** Text and marks. */
  ink: string;
  /** A surface the ink can be read on. */
  tint: string;
  /** For rules, dots and progress fills. */
  fill: string;
  mark: string;
}

export const PHASE_STYLE: Record<Phase, PhaseStyle> = {
  menstrual: {
    label: 'Menstrual',
    ink: 'text-menstrual',
    tint: 'bg-menstrual-tint',
    fill: 'bg-menstrual',
    mark: '◗',
  },
  follicular: {
    label: 'Follicular',
    ink: 'text-follicular',
    tint: 'bg-follicular-tint',
    fill: 'bg-follicular',
    mark: '◔',
  },
  ovulatory: {
    label: 'Ovulatory',
    ink: 'text-ovulatory',
    tint: 'bg-ovulatory-tint',
    fill: 'bg-ovulatory',
    mark: '◉',
  },
  luteal: {
    label: 'Luteal',
    ink: 'text-luteal',
    tint: 'bg-luteal-tint',
    fill: 'bg-luteal',
    mark: '◕',
  },
  unknown: {
    label: 'Today',
    ink: 'text-unknown',
    tint: 'bg-unknown-tint',
    fill: 'bg-unknown',
    mark: '○',
  },
};
