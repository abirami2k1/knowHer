/**
 * Controlled vocabulary for the free-ish daily-log fields.
 *
 * These live in /shared (not the database) so both apps use the same words and
 * Trends can aggregate without string soup. Adding a word is safe; renaming or
 * removing one orphans existing rows, so treat these as append-mostly.
 *
 * This is vocabulary, not cycle logic — no rules or thresholds belong here.
 */

export const MOODS = [
  'calm',
  'happy',
  'energised',
  'flat',
  'low',
  'anxious',
  'irritable',
  'tearful',
  'foggy',
] as const;
export type Mood = (typeof MOODS)[number];

export const SYMPTOMS = [
  'cramps',
  'headache',
  'backache',
  'bloating',
  'breast_tenderness',
  'nausea',
  'acne',
  'cravings',
  'constipation',
  'diarrhoea',
  'insomnia',
  'fatigue',
  'dizziness',
  'joint_pain',
  'spotting_pain',
] as const;
export type Symptom = (typeof SYMPTOMS)[number];

/** 1 = running on empty, 5 = full of energy. */
export const ENERGY_MIN = 1;
export const ENERGY_MAX = 5;
