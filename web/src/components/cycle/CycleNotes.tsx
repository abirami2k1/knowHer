import type { AssessmentResponse } from '@shared/types';
import { Card } from '@/components/ui/Card';

/**
 * Every state the engine reported, in the engine's own words. The UI never writes
 * cycle wording of its own — these strings come from the API's copy map.
 */
export function CycleNotes({ assessment, copy }: AssessmentResponse) {
  const keys = [...assessment.flags, `confidence.${assessment.confidence}`];
  const notes = keys.map((key) => copy[key]).filter(Boolean);

  if (notes.length === 0) return null;

  return (
    <ul className="space-y-2" aria-label="What this chart shows">
      {notes.map((note) => (
        <li key={note}>
          <Card tone="quiet" className="p-4">
            <p className="text-[15px] leading-relaxed text-ink-soft">{note}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
