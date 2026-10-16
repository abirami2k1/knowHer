import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { useMotion } from '@/lib/motion';

/**
 * A subtle fade + lift between routes — warm, never bouncy. The timing is the
 * app's shared `rise`, already resolved against prefers-reduced-motion.
 * useOutlet() (not <Outlet/>) so the exiting page keeps rendering its own content.
 *
 * It also moves focus to the new page, which a single-page app has to do by
 * hand. Without it, a keyboard or screen-reader user taps a nav item and stays
 * exactly where they were, at the bottom of a page that is now gone. (The page
 * title is set by TitleSync, which wraps the routes outside the shell too.)
 */
export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const { rise } = useMotion();
  const regionRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Not on first load: focus belongs wherever the browser put it until she moves.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    regionRef.current?.focus();
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        ref={regionRef}
        tabIndex={-1}
        className="outline-none"
        {...rise()}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
