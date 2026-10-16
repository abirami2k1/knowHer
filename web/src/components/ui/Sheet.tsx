import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { useMotion } from '@/lib/motion';

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
  const { fade, fromBottom } = useMotion();

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
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            {...fade}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-[2rem] bg-paper shadow-[var(--shadow-lift)] outline-none"
            {...fromBottom}
          >
            {/* Grab handle: signals "this pulls down" before anyone reads a word. */}
            <div aria-hidden className="mx-auto mt-3 h-1 w-10 rounded-pill bg-line" />
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <h2 className="text-title text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-pill px-3 text-sm font-medium text-muted hover:bg-surface-sunken"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer && (
              <div className="border-t border-line bg-paper px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
