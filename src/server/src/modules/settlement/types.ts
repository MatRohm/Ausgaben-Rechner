import type { Expense } from '../expenses/index.js';

export interface SettlementBalance {
  /** @isInt */
  personId: number;
  name: string;
  /** @isInt */
  paidCents: number;
  /** @isInt */
  owedCents: number;
  /** @isInt */
  balanceCents: number;
}

export interface SettlementTransfer {
  /** @isInt */
  fromPersonId: number;
  fromName: string;
  /** @isInt */
  toPersonId: number;
  toName: string;
  /** @isInt */
  amountCents: number;
}

export interface SettlementResult {
  balances: SettlementBalance[];
  transfers: SettlementTransfer[];
  settledExpenses: Expense[];
}
