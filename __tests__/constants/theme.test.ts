import { COLORS, FONTS } from '@/constants/theme';

describe('theme', () => {
  describe('COLORS', () => {
    it('should have all required color keys', () => {
      const requiredKeys = [
        'primary',
        'primaryLight',
        'primaryDark',
        'secondary',
        'secondaryLight',
        'background',
        'surface',
        'text',
        'textSecondary',
        'border',
        'danger',
        'warning',
        'success',
      ];

      for (const key of requiredKeys) {
        expect(COLORS).toHaveProperty(key);
      }
    });

    it('should have valid hex color values', () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      for (const [key, value] of Object.entries(COLORS)) {
        expect(value).toMatch(hexPattern);
      }
    });

    it('should have the correct primary color (orange)', () => {
      expect(COLORS.primary).toBe('#F97316');
    });

    it('should have white surface color', () => {
      expect(COLORS.surface).toBe('#FFFFFF');
    });

    it('should have warm orange background', () => {
      expect(COLORS.background).toBe('#FFF7ED');
    });
  });

  describe('FONTS', () => {
    it('should have all font weight variants', () => {
      expect(FONTS).toHaveProperty('regular');
      expect(FONTS).toHaveProperty('medium');
      expect(FONTS).toHaveProperty('bold');
    });

    it('should use System font for all variants', () => {
      expect(FONTS.regular).toBe('System');
      expect(FONTS.medium).toBe('System');
      expect(FONTS.bold).toBe('System');
    });
  });
});
