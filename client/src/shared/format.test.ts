import { describe, expect, it } from 'vitest';
import {
  currentMonthISO,
  formatCentsForInput,
  formatMoney,
  formatMonth,
  parseEuroToCents,
} from './format';

describe('format utilities', () => {
  it('formats money in euro cents', () => {
    expect(formatMoney(0)).toContain('0,00');
    expect(formatMoney(1234)).toContain('12,34');
  });

  it('formats month/year for the German UI', () => {
    expect(formatMonth('2025-01-15')).toBe('Januar 2025');
    expect(formatMonth('2025-01')).toBe('Januar 2025');
    expect(formatMonth('2025-12-01')).toBe('Dezember 2025');
    expect(formatMonth('')).toBe('');
    expect(formatMonth('keine Angabe')).toBe('keine Angabe');
  });

  it('parses euro input into integer cents', () => {
    expect(parseEuroToCents('5,55')).toBe(555);
    expect(parseEuroToCents('5.55')).toBe(555);
    expect(parseEuroToCents('5')).toBe(500);
    expect(parseEuroToCents('12,5')).toBe(1250);
    expect(parseEuroToCents('0,005')).toBe(1);
    expect(parseEuroToCents('0,004')).toBe(0);
  });

  it('rejects empty, invalid, zero, and negative euro input', () => {
    expect(parseEuroToCents('')).toBeNull();
    expect(parseEuroToCents('   ')).toBeNull();
    expect(parseEuroToCents('abc')).toBeNull();
    expect(parseEuroToCents('0')).toBeNull();
    expect(parseEuroToCents('-5')).toBeNull();
  });

  it('formats cents for euro input fields', () => {
    expect(formatCentsForInput(555)).toBe('5,55');
    expect(formatCentsForInput(500)).toBe('5,00');
  });

  it('returns the current month as YYYY-MM', () => {
    expect(currentMonthISO()).toMatch(/^\d{4}-\d{2}$/);
  });
});
