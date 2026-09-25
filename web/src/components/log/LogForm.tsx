import type { DailyLogDto } from '@shared/types';
import { ENERGY_MAX, ENERGY_MIN } from '@shared/vocab';
import { ChoiceList } from '@/components/ui/ChoiceList';
import { Field } from '@/components/ui/Field';
import type { LogDraft } from '@/hooks/useLogDraft';
import {
  CERVIX_OPTIONS,
  DISTURBED_HINT,
  ENERGY_LABELS,
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  MUCUS_OPTIONS,
  SYMPTOM_OPTIONS,
  TEMP_HINT,
} from '@/pages/log/copy';

const ENERGY_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ({
  value: String(ENERGY_MIN + i),
  label: `${ENERGY_MIN + i} · ${ENERGY_LABELS[i]}`,
}));

interface LogFormProps {
  draft: LogDraft;
  set: (patch: Partial<LogDraft>) => void;
  toggleSymptom: (value: string) => void;
  /** From her profile: the tracker fields only appear for the signals she tracks. */
  trackingBBT: boolean;
  trackingMucus: boolean;
}

/**
 * The fields of one day. Purely presentational: it holds no cycle logic and
 * decides nothing about periods or ovulation — the API does that.
 */
export function LogForm({ draft, set, toggleSymptom, trackingBBT, trackingMucus }: LogFormProps) {
  return (
    <div className="space-y-8 py-2">
      <ChoiceList<NonNullable<DailyLogDto['flow']>>
        legend="Bleeding today"
        options={FLOW_OPTIONS}
        selected={draft.flow ? [draft.flow] : []}
        onSelect={(flow) => set({ flow: draft.flow === flow ? null : flow })}
        layout="pills"
      />

      <ChoiceList
        legend="Mood"
        options={MOOD_OPTIONS}
        selected={draft.mood ? [draft.mood] : []}
        onSelect={(mood) => set({ mood: draft.mood === mood ? null : mood })}
        layout="pills"
      />

      <ChoiceList
        legend="Energy"
        options={ENERGY_OPTIONS}
        selected={draft.energy ? [String(draft.energy)] : []}
        onSelect={(value) => set({ energy: draft.energy === Number(value) ? null : Number(value) })}
      />

      <hr className="border-line" />

      <ChoiceList
        legend="Anything you're feeling"
        options={SYMPTOM_OPTIONS}
        selected={draft.symptoms}
        onSelect={toggleSymptom}
        multiple
        layout="pills"
      />

      {trackingBBT && (
        <section className="space-y-4">
          <Field
            label="Waking temperature (°F)"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={90}
            max={110}
            hint={TEMP_HINT}
            value={draft.bbtF}
            onChange={(e) => set({ bbtF: e.target.value })}
          />
          <Field
            label="Time taken"
            type="time"
            value={draft.tempTakenAt}
            onChange={(e) => set({ tempTakenAt: e.target.value })}
          />
          <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary">
            <input
              type="checkbox"
              checked={draft.isDisturbed}
              onChange={(e) =>
                set({
                  isDisturbed: e.target.checked,
                  ...(e.target.checked ? {} : { disturbedReason: '' }),
                })
              }
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span>
              <span className="block text-base text-ink">This reading was unusual</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                {DISTURBED_HINT}
              </span>
            </span>
          </label>
          {draft.isDisturbed && (
            <Field
              label="What was different? (optional)"
              maxLength={120}
              value={draft.disturbedReason}
              onChange={(e) => set({ disturbedReason: e.target.value })}
            />
          )}
        </section>
      )}

      {trackingMucus && (
        <>
          <ChoiceList<NonNullable<DailyLogDto['cervicalMucus']>>
            legend="Cervical mucus"
            options={MUCUS_OPTIONS}
            selected={draft.cervicalMucus ? [draft.cervicalMucus] : []}
            onSelect={(value) =>
              set({ cervicalMucus: draft.cervicalMucus === value ? null : value })
            }
          />
          <ChoiceList<NonNullable<DailyLogDto['cervixPosition']>>
            legend="Cervix position (optional)"
            options={CERVIX_OPTIONS}
            selected={draft.cervixPosition ? [draft.cervixPosition] : []}
            onSelect={(value) =>
              set({ cervixPosition: draft.cervixPosition === value ? null : value })
            }
          />
        </>
      )}
    </div>
  );
}
