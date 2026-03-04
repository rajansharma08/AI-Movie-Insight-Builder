import { classifySentiment } from '@/utils/sentimentHelper';
import { validateIMDbId } from '@/utils/validate';

describe('Validation Utilities', () => {
  describe('validateIMDbId', () => {
    it('should accept valid IMDb IDs', () => {
      expect(validateIMDbId('tt0133093')).toBe(true);
      expect(validateIMDbId('tt0000001')).toBe(true);
      expect(validateIMDbId('TT0133093')).toBe(true);
    });

    it('should reject invalid IMDb IDs', () => {
      expect(validateIMDbId('tt123')).toBe(false);
      expect(validateIMDbId('0133093')).toBe(false);
      expect(validateIMDbId('tt')).toBe(false);
      expect(validateIMDbId('')).toBe(false);
      expect(validateIMDbId('invalid')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateIMDbId(null as any)).toBe(false);
      expect(validateIMDbId(undefined as any)).toBe(false);
      expect(validateIMDbId(123 as any)).toBe(false);
    });
  });

  describe('classifySentiment', () => {
    it('should classify positive sentiment', () => {
      const text = 'This movie is absolutely brilliant and amazing!';
      const result = classifySentiment(text);
      expect(result).toBe('Positive');
    });

    it('should classify negative sentiment', () => {
      const text = 'This film is terrible and awful. Waste of time.';
      const result = classifySentiment(text);
      expect(result).toBe('Negative');
    });

    it('should classify mixed sentiment', () => {
      const text = 'Some good parts but overall disappointing.';
      const result = classifySentiment(text);
      expect(result).toBe('Mixed');
    });

    it('should return Mixed for neutral text', () => {
      const text = 'The movie exists and has actors.';
      const result = classifySentiment(text);
      expect(result).toBe('Mixed');
    });
  });
});
