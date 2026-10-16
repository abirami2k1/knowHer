import { useReducedMotion, type Transition } from 'framer-motion';

/**
 * Motion tokens. Durations and easings were drifting across the screens — a
 * page at 0.2s, a sheet at 0.28, onboarding at 0.3 — which reads as three
 * different apps. They live here now for the same reason the colours do.
 *
 * The character: warm, brief, and settling rather than springing. Nothing
 * overshoots; nothing bounces. This app is calm on purpose.
 */
export const MOTION = {
  /** Small things: a banner, a backdrop, a swap in place. */
  quick: 0.18,
  /** The default — a page, a card, a step. */
  base: 0.24,
  /** Something travelling a real distance, like the sheet from the bottom. */
  travel: 0.3,
  /** How far a thing rises as it arrives, in pixels. */
  lift: 8,
  /** Decelerating: fast to start, resting at the end. */
  ease: [0.22, 0.61, 0.36, 1] as const,
  /** A longer tail, for anything crossing the screen. */
  easeTravel: [0.22, 1, 0.36, 1] as const,
} as const;

export interface Motion {
  /** True when she has asked for less movement; every distance collapses to zero. */
  reduce: boolean;
  /** Fade in, with a small rise. The app's standard entrance. */
  rise: (distance?: number) => {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    exit: { opacity: number; y: number };
    transition: Transition;
  };
  /** Fade alone, for backdrops and anything already in place. */
  fade: {
    initial: { opacity: number };
    animate: { opacity: number };
    exit: { opacity: number };
    transition: Transition;
  };
  /** Up from the bottom edge — the sheet. */
  fromBottom: {
    initial: { y: number | string };
    animate: { y: number };
    exit: { y: number | string };
    transition: Transition;
  };
}

/**
 * The tokens, already resolved against `prefers-reduced-motion` — so no screen
 * has to remember to check, which is how a stray animation slips through.
 */
export function useMotion(): Motion {
  const reduce = useReducedMotion() ?? false;
  const seconds = (value: number) => (reduce ? 0 : value);

  return {
    reduce,
    rise: (distance = MOTION.lift) => {
      const y = reduce ? 0 : distance;
      return {
        initial: { opacity: 0, y },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -y },
        transition: { duration: seconds(MOTION.base), ease: MOTION.ease },
      };
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: seconds(MOTION.quick) },
    },
    fromBottom: {
      initial: { y: reduce ? 0 : '100%' },
      animate: { y: 0 },
      exit: { y: reduce ? 0 : '100%' },
      transition: { duration: seconds(MOTION.travel), ease: MOTION.easeTravel },
    },
  };
}
