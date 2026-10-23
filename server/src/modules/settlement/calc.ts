import type { Expense } from '../expenses/index.js';
import type { Person } from '../persons/index.js';
import type {
  SettlementBalance,
  SettlementResult,
  SettlementTransfer,
} from './types.js';

/**
 * Pure settlement calculation: given all persons and the expenses of one
 * settle, produce balances, the minimal transfer list, and the expenses that
 * are already marked as paid.
 */
export function calculateSettlement(
  persons: Person[],
  expenses: Expense[],
): SettlementResult {
  const unsettled = expenses.filter((e) => !e.settled);

  const balanceMap = new Map<number, number>();
  const paidMap = new Map<number, number>();
  const owedMap = new Map<number, number>();
  for (const p of persons) {
    balanceMap.set(p.id, 0);
    paidMap.set(p.id, 0);
    owedMap.set(p.id, 0);
  }

  for (const e of unsettled) {
    // The payer is owed the full amount.
    paidMap.set(e.paidById, (paidMap.get(e.paidById) ?? 0) + e.amountCents);
    balanceMap.set(e.paidById, (balanceMap.get(e.paidById) ?? 0) + e.amountCents);

    const totalWeight = e.participants.reduce((s, p) => s + p.weight, 0);
    if (totalWeight <= 0) continue;

    // Distribute the amount across participants, ensuring the shares sum exactly
    // to the amount (the last participant absorbs any rounding remainder).
    let remaining = e.amountCents;
    for (let i = 0; i < e.participants.length; i++) {
      const p = e.participants[i];
      const isLast = i === e.participants.length - 1;
      const share = isLast
        ? remaining
        : Math.floor((e.amountCents * p.weight) / totalWeight);
      owedMap.set(p.personId, (owedMap.get(p.personId) ?? 0) + share);
      balanceMap.set(p.personId, (balanceMap.get(p.personId) ?? 0) - share);
      remaining -= share;
    }
  }

  const balances: SettlementBalance[] = persons.map((p) => ({
    personId: p.id,
    name: p.name,
    paidCents: paidMap.get(p.id) ?? 0,
    owedCents: owedMap.get(p.id) ?? 0,
    balanceCents: balanceMap.get(p.id) ?? 0,
  }));

  const debtors = balances
    .filter((b) => b.balanceCents < 0)
    .map((b) => ({ personId: b.personId, name: b.name, amount: -b.balanceCents }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.balanceCents > 0)
    .map((b) => ({ personId: b.personId, name: b.name, amount: b.balanceCents }))
    .sort((a, b) => b.amount - a.amount);

  // Greedy matching to minimize the number of transfers.
  const transfers: SettlementTransfer[] = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const amount = Math.min(debtor.amount, creditor.amount);
    transfers.push({
      fromPersonId: debtor.personId,
      fromName: debtor.name,
      toPersonId: creditor.personId,
      toName: creditor.name,
      amountCents: amount,
    });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount === 0) d++;
    if (creditor.amount === 0) c++;
  }

  return { balances, transfers, settledExpenses: expenses.filter((e) => e.settled) };
}
