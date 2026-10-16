import { Card } from './Card';

/**
 * A placeholder shaped like the thing that is coming, rather than a spinner.
 * The page keeps its height, so nothing jumps when the data lands.
 *
 * The shimmer is a CSS animation, so `prefers-reduced-motion` turns it off in
 * globals.css and the block simply rests — still a placeholder, just a still one.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`skeleton block rounded-pill ${className}`} />;
}

interface SkeletonCardProps {
  /** Placeholder text lines inside the card. */
  lines?: number;
  className?: string;
}

/** A card-shaped placeholder: a short label, then a few lines. */
export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <Card className={`space-y-3 p-5 ${className}`}>
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: lines }, (_, line) => (
        <Skeleton key={line} className={`h-4 ${line === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </Card>
  );
}

/**
 * Wraps a loading region so a screen reader is told something is coming —
 * the shapes themselves are decorative and hidden from it.
 */
export function Loading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
