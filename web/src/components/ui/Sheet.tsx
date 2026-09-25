import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pinned under the scrolling content — where the save button lives. */
  footer?: ReactNode;
}

/**
 * Bottom sheet: the app's primary way of entering things on a phone.
 * Escape closes it, the backdrop closes it, and focus moves inside on open so a
 * keyboard or screen-reader user is not left behind on the page underneath.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    // The page behind must not scroll while the sheet is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-bg-soft shadow-xl outline-none"
            initial={{ y: reduceMotion ? 0 : '100%' }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : '100%' }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-card px-3 text-sm font-medium text-muted hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
            {footer && (
              <div className="border-t border-primary/10 bg-bg-soft px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
