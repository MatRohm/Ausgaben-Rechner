import { describe, expect, it } from 'vitest';
import type { Expense } from '../../server/src/modules/expenses/index';
import type { Person } from '../../server/src/modules/persons/index';
import { calculateSettlement } from '../../server/src/modules/settlement/calc';

const persons: Person[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
];

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: 1,
    description: 'Test',
    amountCents: 3000,
    paidById: 1,
    paidByName: 'Alice',
    settleId: 1,
    date: '2025-01-01',
    settled: false,
    createdAt: '2025-01-01T00:00:00Z',
    participants: [],
    ...overrides,
  };
}

describe('calculateSettlement', () => {
  it('splits evenly and produces the minimal transfer list', () => {
    const result = calculateSettlement(persons, [
      expense({
        participants: [
          { personId: 1, weight: 1 },
          { personId: 2, weight: 1 },
        ],
      }),
    ]);

    expect(result.balances).toEqual([
      {
        personId: 1,
        name: 'Alice',
        paidCents: 3000,
        owedCents: 1500,
        balanceCents: 1500,
      },
      {
        personId: 2,
        name: 'Bob',
        paidCents: 0,
        owedCents: 1500,
        balanceCents: -1500,
      },
      {
        personId: 3,
        name: 'Carol',
        paidCents: 0,
        owedCents: 0,
        balanceCents: 0,
      },
    ]);
    expect(result.transfers).toEqual([
      {
        fromPersonId: 2,
        fromName: 'Bob',
        toPersonId: 1,
        toName: 'Alice',
        amountCents: 1500,
      },
    ]);
  });

  it('keeps shares exact when weights do not divide the amount', () => {
    const result = calculateSettlement(persons, [
      expense({
        amountCents: 100,
        participants: [
          { personId: 1, weight: 1 },
          { personId: 2, weight: 1 },
          { personId: 3, weight: 1 },
        ],
      }),
    ]);

    const owed = result.balances.reduce((sum, b) => sum + b.owedCents, 0);
    const balance = result.balances.reduce((sum, b) => sum + b.balanceCents, 0);
    expect(owed).toBe(100);
    expect(balance).toBe(0);
  });

  it('ignores zero-weight participants and assigns rounding to positive weights', () => {
    const result = calculateSettlement(persons, [
      expense({
        amountCents: 100,
        participants: [
          { personId: 1, weight: 1 },
          { personId: 2, weight: 2 },
          { personId: 3, weight: 0 },
        ],
      }),
    ]);

    expect(result.balances[2]).toMatchObject({ owedCents: 0, balanceCents: 0 });
    expect(result.balances[1]).toMatchObject({ owedCents: 67, balanceCents: -67 });
    expect(result.balances.reduce((sum, b) => sum + b.owedCents, 0)).toBe(100);
    expect(result.balances.reduce((sum, b) => sum + b.balanceCents, 0)).toBe(0);
  });

  it('ignores settled expenses for the balance and reports them separately', () => {
    const settled = expense({ id: 7, settled: true });
    const result = calculateSettlement(persons, [settled]);

    expect(result.settledExpenses).toEqual([settled]);
    expect(result.transfers).toEqual([]);
    expect(result.balances.every((b) => b.balanceCents === 0)).toBe(true);
  });
});
