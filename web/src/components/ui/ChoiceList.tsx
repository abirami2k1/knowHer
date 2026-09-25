interface ChoiceListProps<T extends string> {
  /** Labels the group for screen readers; rendered as the visible legend. */
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  selected: T[];
  onSelect: (value: T) => void;
  multiple?: boolean;
  /** Short labels that read better as a wrapped row of pills. */
  layout?: 'list' | 'pills';
}

/**
 * Tap-first option list. Radio/checkbox semantics come from real inputs, so it
 * stays keyboard-navigable and labelled; the styling sits on the label, making
 * the whole row (or pill) the touch target.
 */
export function ChoiceList<T extends string>({
  legend,
  options,
  selected,
  onSelect,
  multiple = false,
  layout = 'list',
}: ChoiceListProps<T>) {
  const pills = layout === 'pills';

  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-muted">{legend}</legend>
      <div className={pills ? 'flex flex-wrap gap-2' : 'space-y-2'}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const shell = pills
            ? `min-h-11 rounded-pill px-4 py-2.5 text-sm ${
                isSelected
                  ? 'bg-primary text-paper ring-1 ring-primary'
                  : 'bg-surface text-ink-soft ring-1 ring-line hover:bg-surface-sunken'
              }`
            : `min-h-12 w-full gap-3 rounded-2xl px-4 py-3 ${
                isSelected
                  ? 'bg-surface ring-2 ring-primary'
                  : 'bg-surface ring-1 ring-line hover:bg-surface-sunken'
              }`;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${shell}`}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={legend}
                value={option.value}
                checked={isSelected}
                onChange={() => onSelect(option.value)}
                className={pills ? 'sr-only' : 'size-5 shrink-0 accent-primary'}
              />
              <span>
                <span className={pills ? '' : 'block text-base text-ink'}>{option.label}</span>
                {option.hint && !pills && (
                  <span className="mt-0.5 block text-sm text-muted">{option.hint}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
