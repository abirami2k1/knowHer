import type { AssessmentResponse } from '@shared/types';

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
        <li key={note} className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
          {note}
        </li>
      ))}
    </ul>
  );
}
