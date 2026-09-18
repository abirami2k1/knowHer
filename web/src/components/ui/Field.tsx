import { useId, type InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Labelled input with optional hint and inline error, wired for screen readers. */
export function Field({ label, hint, error, id, className = '', ...rest }: FieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={`block min-h-12 w-full rounded-card bg-white px-4 text-base text-ink ring-1 ring-primary/20 placeholder:text-muted/70 focus:ring-2 focus:ring-primary focus:outline-none ${error ? 'ring-primary' : ''} ${className}`}
      />
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
