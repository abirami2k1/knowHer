interface ChoiceListProps<T extends string> {
  /** Labels the group for screen readers; rendered as the visible legend. */
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  selected: T[];
  onSelect: (value: T) => void;
  multiple?: boolean;
}

/**
 * Tap-first option list used across onboarding. Radio/checkbox semantics come
 * from real inputs (keyboard-navigable, labelled); the styling sits on the label
 * so the whole 48px row is the touch target.
 */
export function ChoiceList<T extends string>({
  legend,
  options,
  selected,
  onSelect,
  multiple = false,
}: ChoiceListProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <label
            key={option.value}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-card bg-white px-4 py-3 ring-1 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
              isSelected ? 'ring-2 ring-primary' : 'ring-primary/20 hover:bg-bg-soft'
            }`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={legend}
              value={option.value}
              checked={isSelected}
              onChange={() => onSelect(option.value)}
              className="size-5 shrink-0 accent-primary"
            />
            <span>
              <span className="block text-base text-ink">{option.label}</span>
              {option.hint && <span className="block text-sm text-muted">{option.hint}</span>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
