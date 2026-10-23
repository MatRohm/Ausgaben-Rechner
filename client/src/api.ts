import type {
  Expense,
  ExpenseDraft,
  Person,
  Settle,
  SettlementResult,
} from './types';

export interface ExpenseInput extends ExpenseDraft {
  settleId: number;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = `Fehler ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore parse errors, keep generic message
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Persons
  listPersons: () => request<Person[]>('/api/persons'),
  createPerson: (name: string) =>
    request<Person>('/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  renamePerson: (id: number, name: string) =>
    request<Person>(`/api/persons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  deletePerson: (id: number) =>
    request<void>(`/api/persons/${id}`, { method: 'DELETE' }),

  // Settles
  listSettles: () => request<Settle[]>('/api/settles'),
  createSettle: (name: string) =>
    request<Settle>('/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  renameSettle: (id: number, name: string) =>
    request<Settle>(`/api/settles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  closeSettle: (id: number) =>
    request<Settle>(`/api/settles/${id}/close`, { method: 'POST' }),
  reopenSettle: (id: number) =>
    request<Settle>(`/api/settles/${id}/reopen`, { method: 'POST' }),
  deleteSettle: (id: number) =>
    request<void>(`/api/settles/${id}`, { method: 'DELETE' }),

  // Expenses
  listExpenses: (settleId?: number) =>
    request<Expense[]>(
      settleId != null ? `/api/expenses?settleId=${settleId}` : '/api/expenses',
    ),
  createExpense: (input: ExpenseInput) =>
    request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateExpense: (id: number, input: ExpenseInput) =>
    request<Expense>(`/api/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteExpense: (id: number) =>
    request<void>(`/api/expenses/${id}`, { method: 'DELETE' }),
  setExpenseSettled: (id: number, settled: boolean) =>
    request<Expense>(`/api/expenses/${id}/settled`, {
      method: 'PATCH',
      body: JSON.stringify({ settled }),
    }),

  // Settlement
  settlement: (settleId: number) =>
    request<SettlementResult>(`/api/settlement/${settleId}`),
};
