import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney, todayISO } from './format';

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

  it('returns a local ISO date for today', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
