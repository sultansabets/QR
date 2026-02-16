import { describe, it, expect } from 'vitest';
import { CertificateParser } from '../pdfParserService';

describe('CertificateParser', () => {
  const parser = new CertificateParser();

  describe('parseRange', () => {
    it('parses "от 4 до 20 мА"', () => {
      const result = parser.parseRange('от 4 до 20 мА');
      expect(result).toEqual({ min: 4, max: 20, unit: 'мА' });
    });
    it('parses "0-25 МПа"', () => {
      const result = parser.parseRange('0-25 МПа');
      expect(result).toEqual({ min: 0, max: 25, unit: 'МПа' });
    });
    it('parses "от 0 до 100 °C"', () => {
      const result = parser.parseRange('от 0 до 100 °C');
      expect(result).toEqual({ min: 0, max: 100, unit: '°C' });
    });
    it('parses "0...150 мм"', () => {
      const result = parser.parseRange('0...150 мм');
      expect(result).toEqual({ min: 0, max: 150, unit: 'мм' });
    });
  });

  describe('parseAccuracy', () => {
    it('parses "± 0,1 %, рабочего СИ"', () => {
      const result = parser.parseAccuracy('± 0,1 %, рабочего СИ');
      expect(result).toBe('0.1');
    });
    it('parses "1.5"', () => {
      const result = parser.parseAccuracy('1.5');
      expect(result).toBe('1.5');
    });
    it('parses "класс точности 2.5"', () => {
      const result = parser.parseAccuracy('класс точности 2.5');
      expect(result).toBe('2.5');
    });
  });
});
