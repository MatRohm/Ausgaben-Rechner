import type { Expense } from '@/modules/expenses';

export interface SettlementBalance {
  personId: number;
  name: string;
  paidCents: number;
  owedCents: number;
  balanceCents: number;
}

export interface SettlementTransfer {
  fromPersonId: number;
  fromName: string;
  toPersonId: number;
  toName: string;
  amountCents: number;
}

export interface SettlementResult {
  balances: SettlementBalance[];
  transfers: SettlementTransfer[];
  settledExpenses: Expense[];
}
