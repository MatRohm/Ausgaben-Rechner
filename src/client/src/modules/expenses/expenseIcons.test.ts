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

  it('matches shopping and clothing descriptions', () => {
    expect(findExpenseIcon('Amazon')).toEqual({ icon: '📦', label: 'Shopping' });
    expect(findExpenseIcon('304-2409157-9312326 AMZN Mktp DE')).toEqual({
      icon: '📦',
      label: 'Shopping',
    });
    expect(findExpenseIcon('H&M')).toEqual({ icon: '👕', label: 'Kleidung' });
    expect(findExpenseIcon('H & M')).toEqual({ icon: '👕', label: 'Kleidung' });
    expect(findExpenseIcon('Primark - Kleidung')).toEqual({
      icon: '👕',
      label: 'Kleidung',
    });
  });

  it('returns null for unmatched or empty descriptions', () => {
    expect(findExpenseIcon('Miete')).toBeNull();
    expect(findExpenseIcon('Sparkasse')).toBeNull();
    expect(findExpenseIcon('   ')).toBeNull();
  });
});
