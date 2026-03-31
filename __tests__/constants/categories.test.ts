import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABELS, type ItemCategory } from '@/constants/categories';

describe('categories', () => {
  describe('CATEGORIES', () => {
    it('should contain all expected category values', () => {
      expect(CATEGORIES).toEqual([
        'produce',
        'dairy',
        'meat',
        'grain',
        'condiment',
        'beverage',
        'other',
      ]);
    });

    it('should have 7 categories', () => {
      expect(CATEGORIES).toHaveLength(7);
    });
  });

  describe('CATEGORY_EMOJI', () => {
    it('should have an emoji for each category', () => {
      for (const category of CATEGORIES) {
        expect(CATEGORY_EMOJI[category]).toBeDefined();
        expect(typeof CATEGORY_EMOJI[category]).toBe('string');
        expect(CATEGORY_EMOJI[category].length).toBeGreaterThan(0);
      }
    });

    it('should map to expected emojis', () => {
      expect(CATEGORY_EMOJI.produce).toBe('🥬');
      expect(CATEGORY_EMOJI.dairy).toBe('🧀');
      expect(CATEGORY_EMOJI.meat).toBe('🥩');
      expect(CATEGORY_EMOJI.grain).toBe('🌾');
      expect(CATEGORY_EMOJI.condiment).toBe('🧂');
      expect(CATEGORY_EMOJI.beverage).toBe('🥤');
      expect(CATEGORY_EMOJI.other).toBe('📦');
    });
  });

  describe('CATEGORY_LABELS', () => {
    it('should have a label for each category', () => {
      for (const category of CATEGORIES) {
        expect(CATEGORY_LABELS[category]).toBeDefined();
        expect(typeof CATEGORY_LABELS[category]).toBe('string');
      }
    });

    it('should map to expected labels', () => {
      expect(CATEGORY_LABELS.produce).toBe('Produce');
      expect(CATEGORY_LABELS.dairy).toBe('Dairy');
      expect(CATEGORY_LABELS.meat).toBe('Meat');
      expect(CATEGORY_LABELS.grain).toBe('Grain');
      expect(CATEGORY_LABELS.condiment).toBe('Condiment');
      expect(CATEGORY_LABELS.beverage).toBe('Beverage');
      expect(CATEGORY_LABELS.other).toBe('Other');
    });
  });
});
