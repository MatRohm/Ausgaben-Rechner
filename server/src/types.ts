export interface Person {
  id: number;
  name: string;
}

export interface Settle {
  id: number;
  name: string;
  createdAt: string;
  closedAt: string | null;
  expenseCount: number;
  totalCents: number;
}

export interface ExpenseParticipant {
  personId: number;
  weight: number;
  name?: string;
}

export interface Expense {
  id: number;
  description: string;
  amountCents: number;
  paidById: number;
  paidByName?: string;
  settleId: number;
  date: string;
  settled: boolean;
  createdAt: string;
  participants: ExpenseParticipant[];
}

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
