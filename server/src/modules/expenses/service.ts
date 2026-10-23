import { AppError } from '../../shared/http.js';
import { getSettle } from '../settles/index.js';
import * as repository from './repository.js';
import type { Expense, ExpenseInput } from './types.js';

function assertSettleOpen(settleId: number): void {
  const settle = getSettle(settleId);
  if (!settle) throw new AppError(400, 'Abrechnung nicht gefunden.');
  if (settle.closedAt) {
    throw new AppError(400, 'Abrechnung ist abgeschlossen und kann nicht mehr bearbeitet werden.');
  }
}

export function listExpenses(settleId?: number): Expense[] {
  return repository.listExpenses(settleId);
}

export function getExpense(id: number): Expense | undefined {
  return repository.getExpense(id);
}

export function createExpense(input: ExpenseInput): Expense {
  assertSettleOpen(input.settleId);
  return repository.createExpense(input);
}

export function updateExpense(id: number, input: ExpenseInput): Expense | undefined {
  assertSettleOpen(input.settleId);
  return repository.updateExpense(id, input);
}

export function deleteExpense(id: number): void {
  const expense = repository.getExpense(id);
  if (!expense) throw new AppError(404, 'Ausgabe nicht gefunden.');
  assertSettleOpen(expense.settleId);
  repository.deleteExpense(id);
}

export function setExpenseSettled(id: number, settled: boolean): Expense {
  const expense = repository.getExpense(id);
  if (!expense) throw new AppError(404, 'Ausgabe nicht gefunden.');
  assertSettleOpen(expense.settleId);
  return repository.setExpenseSettled(id, settled);
}
