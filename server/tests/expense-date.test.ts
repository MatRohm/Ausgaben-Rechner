import { describe, expect, it } from 'vitest';
import { normalizeExpenseDate } from '../src/modules/expenses/date';

describe('normalizeExpenseDate', () => {
  it('normalizes months and full dates to the first day of the month', () => {
    expect(normalizeExpenseDate('2026-07')).toBe('2026-07-01');
    expect(normalizeExpenseDate('2026-07-31')).toBe('2026-07-01');
    expect(normalizeExpenseDate('2026-12-01')).toBe('2026-12-01');
    expect(normalizeExpenseDate(' 2026-07 ')).toBe('2026-07-01');
    expect(normalizeExpenseDate('2024-02-29')).toBe('2024-02-01');
  });

  it('rejects invalid months and days', () => {
    expect(normalizeExpenseDate('')).toBeNull();
    expect(normalizeExpenseDate('foo')).toBeNull();
    expect(normalizeExpenseDate('2026-7')).toBeNull();
    expect(normalizeExpenseDate('2026-00')).toBeNull();
    expect(normalizeExpenseDate('2026-13')).toBeNull();
    expect(normalizeExpenseDate('2026-04-31')).toBeNull();
    expect(normalizeExpenseDate('2026-02-29')).toBeNull();
  });
});
