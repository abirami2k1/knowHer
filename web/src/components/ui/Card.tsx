import type { ElementType, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** 'plain' for content, 'quiet' for asides that should recede. */
  tone?: 'plain' | 'quiet';
  as?: ElementType;
  className?: string;
}

/** The one card in the system. Paper-white, hairline edge, barely-there lift. */
export function Card({ children, tone = 'plain', as: Tag = 'div', className = '' }: CardProps) {
  const base =
    tone === 'quiet'
      ? 'bg-surface-sunken'
      : 'bg-surface shadow-[var(--shadow-card)] ring-1 ring-line';
  return <Tag className={`rounded-card ${base} ${className}`}>{children}</Tag>;
}

/** Small uppercase label above a heading — the editorial tell. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow text-muted ${className}`}>{children}</p>;
}
