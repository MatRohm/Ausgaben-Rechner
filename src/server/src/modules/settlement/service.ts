import { listExpenses } from '../expenses/index.js';
import { listPersons } from '../persons/index.js';
import { calculateSettlement } from './calc.js';
import type { SettlementResult } from './types.js';

export function computeSettlement(settleId: number): SettlementResult {
  return calculateSettlement(listPersons(), listExpenses(settleId));
}
