import type { Confidence, FallbackReason, Flag, Phase } from './types';

/**
 * The ONLY place cycle wording lives. Served to the client inside API responses;
 * the UI renders these strings and never composes its own. Sivi rewrites at will.
 * Tone: warm, calm, second person, no alarm. Never a promise, never a diagnosis.
 */
export type CopyKey =
  Flag | `confidence.${Confidence}` | `phase.${Phase}` | `fallback.${FallbackReason}`;

export const CYCLE_COPY: Readonly<Record<CopyKey, string>> = Object.freeze({
  // ── Flags ──────────────────────────────────────────────────────────────────
  low_data: 'A few more morning readings and we can start drawing your chart.',
  no_temp_data:
    "You're not tracking temperature this cycle, so there's no coverline to draw. Your mucus notes still count.",
  no_mucus_data:
    "You're not tracking cervical mucus this cycle, so we're reading temperatures on their own.",
  disturbed_excluded:
    'One or more readings were marked unusual and left out of the rules, so this reading is a little less certain.',
  false_shift_invalidated:
    'Your temperatures rose and then dropped back once before the real shift. That happens; only the sustained rise counts.',
  shift_pending:
    'Watching for a sustained rise. Ovulation is only ever confirmed a few days after it happens.',
  peak_pending:
    "Egg-white mucus was logged. We'll mark peak day once a couple of non-egg-white days follow.",
  signal_disagreement:
    'Your mucus pointed to one day and your temperatures to another. Both are shown — patterns matter more than any single day.',
  anovulatory:
    "No ovulation detected this cycle. That happens; keep charting and we'll look at the next one together.",

  // ── Confidence tiers ───────────────────────────────────────────────────────
  'confidence.full': 'Your temperatures and mucus agree — this is a clear chart.',
  'confidence.reduced':
    'We can see the shift, but one signal is missing or unusual, so hold this a little loosely.',
  'confidence.none': "There isn't enough to draw a conclusion from this cycle yet.",

  // ── Phases (Task 8 dashboard) ──────────────────────────────────────────────
  'phase.menstrual': "You're on your period. Rest where you can; energy often sits lowest here.",
  'phase.follicular': 'Energy tends to build through this stretch. A good time to start things.',
  'phase.ovulatory': 'Around your estimated ovulation. Many feel most outgoing and energised now.',
  'phase.luteal': 'The weeks after ovulation. Slower, steadier days; be gentle with your plans.',
  'phase.unknown': "We can't place today in a phase yet. Keep logging and it will come into focus.",

  // ── Honest fallbacks (Task 8 dashboard) ────────────────────────────────────
  'fallback.long':
    "This cycle is running longer than your usual. That's information, not a problem; keep logging.",
  'fallback.irregular':
    "Your cycles vary quite a bit, so we won't guess a phase. What you log is what we go by.",
  'fallback.no_history': "Log your next period start and we'll begin charting from there.",
});
