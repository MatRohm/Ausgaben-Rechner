import { describe, expect, it } from 'vitest';
import { findExpenseIcon } from './expenseIcons';

describe('findExpenseIcon', () => {
  it('matches supermarket descriptions case-insensitively', () => {
    expect(findExpenseIcon('Einkauf Supermarkt')).toEqual({
      icon: '🛒',
      label: 'Supermarkt',
    });
    expect(findExpenseIcon('ALDI')).toEqual({ icon: '🛒', label: 'Supermarkt' });
  });

  it('returns null for unmatched or empty descriptions', () => {
    expect(findExpenseIcon('Miete')).toBeNull();
    expect(findExpenseIcon('Sparkasse')).toBeNull();
    expect(findExpenseIcon('   ')).toBeNull();
  });
});
