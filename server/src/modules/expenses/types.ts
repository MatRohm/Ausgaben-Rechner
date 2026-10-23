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

export interface ExpenseInput {
  description: string;
  amountCents: number;
  paidById: number;
  settleId: number;
  date: string;
  participants: { personId: number; weight: number }[];
}
