import { UNITS, type Unit } from '@/constants/units';

describe('units', () => {
  describe('UNITS', () => {
    it('should contain all expected unit values', () => {
      expect(UNITS).toEqual([
        'pcs', 'g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'oz', 'lbs',
      ]);
    });

    it('should have 10 units', () => {
      expect(UNITS).toHaveLength(10);
    });

    it('should include common weight units', () => {
      expect(UNITS).toContain('g');
      expect(UNITS).toContain('kg');
      expect(UNITS).toContain('oz');
      expect(UNITS).toContain('lbs');
    });

    it('should include common volume units', () => {
      expect(UNITS).toContain('ml');
      expect(UNITS).toContain('L');
      expect(UNITS).toContain('cups');
      expect(UNITS).toContain('tbsp');
      expect(UNITS).toContain('tsp');
    });

    it('should include pieces unit', () => {
      expect(UNITS).toContain('pcs');
    });
  });
});
