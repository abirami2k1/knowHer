import { MOODS, SYMPTOMS } from '@shared/vocab';
import type { Option } from '@/pages/onboarding/copy';

/** Display labels for the log fields. The vocabulary itself lives in /shared. */

export const FLOW_OPTIONS: Option<'none' | 'spotting' | 'light' | 'medium' | 'heavy'>[] = [
  { value: 'none', label: 'No bleeding' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

/** Flow levels that ask whether a period has started (spotting never does — D3). */
export const PERIOD_FLOWS = ['light', 'medium', 'heavy'];

export const MUCUS_OPTIONS: Option<'dry' | 'sticky' | 'watery' | 'eggwhite'>[] = [
  { value: 'dry', label: 'Dry', hint: 'Nothing to see or feel.' },
  { value: 'sticky', label: 'Sticky', hint: 'Tacky, crumbly, holds its shape.' },
  { value: 'watery', label: 'Watery / lotion', hint: 'Creamy or thin and wet.' },
  { value: 'eggwhite', label: 'Egg-white', hint: 'Clear and stretchy, like raw egg white.' },
];

export const CERVIX_OPTIONS: Option<'firm' | 'medium' | 'soft'>[] = [
  { value: 'firm', label: 'Firm (F)', hint: 'Like the tip of your nose.' },
  { value: 'medium', label: 'Medium (M)' },
  { value: 'soft', label: 'Soft (S)', hint: 'Like your lips.' },
];

const MOOD_LABELS: Record<string, string> = {
  calm: 'Calm',
  happy: 'Happy',
  energised: 'Energised',
  flat: 'Flat',
  low: 'Low',
  anxious: 'Anxious',
  irritable: 'Irritable',
  tearful: 'Tearful',
  foggy: 'Foggy',
};

export const SYMPTOM_LABELS: Record<string, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  backache: 'Backache',
  bloating: 'Bloating',
  breast_tenderness: 'Breast tenderness',
  nausea: 'Nausea',
  acne: 'Acne',
  cravings: 'Cravings',
  constipation: 'Constipation',
  diarrhoea: 'Diarrhoea',
  insomnia: 'Trouble sleeping',
  fatigue: 'Fatigue',
  dizziness: 'Dizziness',
  joint_pain: 'Joint pain',
  spotting_pain: 'Ovulation twinge',
};

export const MOOD_OPTIONS = MOODS.map((value) => ({ value, label: MOOD_LABELS[value] ?? value }));
export const SYMPTOM_OPTIONS = SYMPTOMS.map((value) => ({
  value,
  label: SYMPTOM_LABELS[value] ?? value,
}));

export const ENERGY_LABELS = ['Running on empty', 'Low', 'Steady', 'Good', 'Full of energy'];

export const TEMP_HINT = 'Taken before you get out of bed, at roughly the same time each morning.';
export const DISTURBED_HINT =
  'Illness, alcohol, poor sleep or a different wake time. Flagged readings are left out of the coverline.';
