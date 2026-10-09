import type { ReactNode } from 'react';
import { Card, Eyebrow } from '@/components/ui/Card';

interface TrendSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  /** The API's sentence for this section's state. */
  note: string;
  children?: ReactNode;
}

/** One trend: a heading, the API's words for it, then whatever it has to show. */
export function TrendSection({ id, eyebrow, title, note, children }: TrendSectionProps) {
  return (
    <section aria-labelledby={id}>
      <Card className="space-y-4 p-5">
        <header>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={id} className="mt-1.5 font-display text-title text-ink">
            {title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{note}</p>
        </header>
        {children}
      </Card>
    </section>
  );
}
