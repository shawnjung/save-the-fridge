export const UNITS = [
  'pcs',
  'g',
  'kg',
  'ml',
  'L',
  'cups',
  'tbsp',
  'tsp',
  'oz',
  'lbs',
] as const;

export type Unit = (typeof UNITS)[number];
