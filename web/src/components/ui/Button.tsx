import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-paper hover:bg-primary/90 disabled:bg-primary/40',
  secondary:
    'bg-surface text-primary ring-1 ring-line hover:bg-surface-sunken disabled:text-primary/40',
  ghost: 'text-ink-soft hover:bg-surface-sunken disabled:text-muted/50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Shows a waiting label and disables the button. */
  loading?: boolean;
}

/** ≥44px tall, full-width by default — this is a thumb-first app. */
export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-pill px-5 text-base font-medium tracking-tight transition-colors disabled:cursor-not-allowed ${VARIANT[variant]} ${className}`}
    >
      {loading ? 'One moment…' : children}
    </button>
  );
}
