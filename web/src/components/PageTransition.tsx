import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

/**
 * A subtle fade + lift between routes — warm, never bouncy.
 * With prefers-reduced-motion the swap is instant.
 * useOutlet() (not <Outlet/>) so the exiting page keeps rendering its own content.
 */
export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();
  const lift = reduceMotion ? 0 : 8;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: lift }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -lift }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
