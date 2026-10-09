import type { Confidence, FallbackReason, Flag, Phase } from './types';

/**
 * The ONLY place cycle wording lives. Served to the client inside API responses;
 * the UI renders these strings and never composes its own. Sivi rewrites at will.
 * Tone: warm, calm, second person, no alarm. Never a promise, never a diagnosis.
 */
export type CopyKey =
  | Flag
  | `confidence.${Confidence}`
  | `phase.${Phase}`
  | `insight.${Phase}`
  | `fallback.${FallbackReason}`
  | `trends.${TrendNote}`;

/** The states the Trends screen can be in, each with its own honest sentence. */
export type TrendNote =
  | 'lengths.none'
  | 'lengths.few'
  | 'lengths.steady'
  | 'lengths.varied'
  | 'luteal.none'
  | 'luteal.about'
  | 'energy.none'
  | 'energy.about'
  | 'energy.estimated'
  | 'symptoms.none'
  | 'symptoms.about';

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

  // ── Life-to-cycle insight (Task 8 dashboard) ───────────────────────────────
  // What today might feel like, and what it is worth spending energy on. Framed
  // as a tendency, never a prescription, and never a claim about her body today.
  'insight.menstrual':
    'If you can, make today lighter than usual. Warmth, food you like, and fewer demands go a long way.',
  'insight.follicular':
    'Ideas and stamina often come easier here. A good stretch for new work, hard conversations and plans.',
  'insight.ovulatory':
    'Many feel most social and articulate around now — worth putting the things that need other people here.',
  'insight.luteal':
    'Focus often turns inward. Finishing beats starting, and a smaller list is not a failure of will.',
  'insight.unknown':
    'Whatever today feels like is worth noting. The more you log, the more the pattern speaks for itself.',

  // ── Honest fallbacks (Task 8 dashboard) ────────────────────────────────────
  'fallback.long':
    "This cycle is running longer than your usual. That's information, not a problem; keep logging.",
  'fallback.irregular':
    "Your cycles vary quite a bit, so we won't guess a phase. What you log is what we go by.",
  'fallback.no_history': "Log your next period start and we'll begin charting from there.",

  // ── Trends (Task 10) ───────────────────────────────────────────────────────
  // Patterns, never scores. Nothing here grades a cycle as good or bad, and a
  // short or varied cycle is described, not flagged.
  'trends.lengths.none':
    'Your cycle lengths will show here once a cycle closes — that happens when you log your next period start.',
  'trends.lengths.few':
    'One cycle so far. A pattern needs a few more; keep logging and it will take shape.',
  'trends.lengths.steady': 'Your cycles have kept to a fairly steady length.',
  'trends.lengths.varied':
    "Your cycle lengths vary quite a bit. That's common, and it's why we go by what you log rather than a 28-day model.",
  'trends.luteal.none':
    'Luteal length appears once a cycle closes with a confirmed temperature shift. Cycles without one are simply left out.',
  'trends.luteal.about':
    'The days from a confirmed ovulation to your next period. Only cycles with a confirmed temperature shift are counted.',
  'trends.energy.none':
    'Log your energy on a few days in each phase and your pattern will start to show here.',
  'trends.energy.about':
    'How your energy has tended to run through each phase. A tendency, not a rule — any day can be different.',
  'trends.energy.estimated':
    'Where a cycle had no confirmed temperature shift, its days were placed by counting back from the next period, so read those phases as approximate.',
  'trends.symptoms.none': 'No symptoms noted in your recent cycles.',
  'trends.symptoms.about':
    "What you've noted most across your recent cycles, and the phase each tends to turn up in.",
});
