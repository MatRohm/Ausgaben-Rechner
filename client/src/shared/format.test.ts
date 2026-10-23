import { describe, expect, it } from 'vitest';
import { formatCentsForInput, formatDate, formatMoney, parseEuroToCents, todayISO } from './format';

describe('format utilities', () => {
  it('formats money in euro cents', () => {
    expect(formatMoney(0)).toContain('0,00');
    expect(formatMoney(1234)).toContain('12,34');
  });

  it('formats ISO dates for the German UI', () => {
    expect(formatDate('2025-01-15')).toBe('15.01.2025');
    expect(formatDate('2025-01-15T00:00:00')).toBe('15.01.2025');
    expect(formatDate('')).toBe('');
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

  it('returns a local ISO date for today', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
