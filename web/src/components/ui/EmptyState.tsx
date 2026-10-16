import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  icon?: LucideIcon;
  /** What is not here yet — stated as a fact, never as a failing. */
  title: string;
  /** What fills it, in one line. */
  body: string;
  /** An optional way to start. */
  action?: ReactNode;
}

/**
 * Nothing here yet. The tone matters: an empty screen in a health app can read
 * as "you are behind", so these say what the space is for and leave it there.
 */
export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <Card tone="quiet" className="space-y-3 p-6 text-center">
      {Icon && (
        <span className="mx-auto flex size-11 items-center justify-center rounded-pill bg-surface text-muted">
          <Icon aria-hidden className="size-5" strokeWidth={1.8} />
        </span>
      )}
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
      {action && <div className="pt-1">{action}</div>}
    </Card>
  );
}
