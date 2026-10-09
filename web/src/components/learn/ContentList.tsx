import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';

export interface ContentItem {
  to: string;
  title: string;
  meta?: string;
}

/** A titled run of things to read. Renders nothing when the run is empty. */
export function ContentList({ heading, items }: { heading: string; items: ContentItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={heading} className="space-y-2.5">
      <h2 className="eyebrow text-muted">{heading}</h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="block rounded-card focus-visible:outline-2">
              <Card className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-sunken">
                <span className="flex-1">
                  <span className="block font-display text-lg leading-snug text-ink">
                    {item.title}
                  </span>
                  {item.meta && <span className="mt-1 block text-sm text-muted">{item.meta}</span>}
                </span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-muted" />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
