import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-accent disabled:bg-primary/50',
  secondary:
    'bg-white text-primary ring-1 ring-primary/30 hover:bg-bg-soft disabled:text-primary/50',
  ghost: 'text-primary hover:bg-primary/5 disabled:text-primary/50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Shows a spinner label and disables the button. */
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
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-card px-4 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${VARIANT[variant]} ${className}`}
    >
      {loading ? 'One moment…' : children}
    </button>
  );
}
