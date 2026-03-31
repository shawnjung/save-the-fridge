export type ItemCategory = 'produce' | 'dairy' | 'meat' | 'grain' | 'condiment' | 'beverage' | 'other';

export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  produce: '🥬',
  dairy: '🧀',
  meat: '🥩',
  grain: '🌾',
  condiment: '🧂',
  beverage: '🥤',
  other: '📦',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  meat: 'Meat',
  grain: 'Grain',
  condiment: 'Condiment',
  beverage: 'Beverage',
  other: 'Other',
};

export const CATEGORIES: ItemCategory[] = [
  'produce',
  'dairy',
  'meat',
  'grain',
  'condiment',
  'beverage',
  'other',
];
