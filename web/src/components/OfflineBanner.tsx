import { motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { useMotion } from '@/lib/motion';

/**
 * One quiet line when the connection is gone, and a word about anything still
 * waiting. It says what is true — the day is safe on the device — rather than
 * suggesting something went wrong.
 */
export function OfflineBanner() {
  const { isOnline, pending } = useOffline();
  const { rise } = useMotion();
  if (isOnline && !pending) return null;

  const message = !isOnline
    ? pending
      ? `You're offline. ${pending === 1 ? 'One day is' : `${pending} days are`} saved here and will sync when you're back.`
      : "You're offline. You can still log — it'll sync when you're back."
    : `${pending === 1 ? 'One day is' : `${pending} days are`} waiting to sync.`;

  return (
    <motion.div
      {...rise()}
      role="status"
      className="mx-auto mb-5 flex w-full max-w-md items-start gap-2.5 rounded-2xl bg-surface-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft ring-1 ring-line"
    >
      <CloudOff aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
      <p>{message}</p>
    </motion.div>
  );
}
