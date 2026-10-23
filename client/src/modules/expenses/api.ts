import { request } from '@/shared/http';
import type { Expense, ExpenseInput } from './types';

export const expensesApi = {
  list: (settleId?: number) =>
    request<Expense[]>(
      settleId != null ? `/api/expenses?settleId=${settleId}` : '/api/expenses',
    ),
  create: (input: ExpenseInput) =>
    request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: number, input: ExpenseInput) =>
    request<Expense>(`/api/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  remove: (id: number) => request<void>(`/api/expenses/${id}`, { method: 'DELETE' }),
  setSettled: (id: number, settled: boolean) =>
    request<Expense>(`/api/expenses/${id}/settled`, {
      method: 'PATCH',
      body: JSON.stringify({ settled }),
    }),
};
