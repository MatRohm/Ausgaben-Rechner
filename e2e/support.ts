import type { APIRequestContext } from '@playwright/test';

interface Person {
  id: number;
  name: string;
}

interface Settle {
  id: number;
  name: string;
  closedAt: string | null;
}

interface Expense {
  id: number;
  description: string;
  amountCents: number;
  date: string;
}

interface ExpenseSeed {
  description: string;
  amountCents: number;
  paidById: number;
  settleId: number;
  date?: string;
  participantIds?: number[];
}

let sequence = 0;

export function uniqueSuffix(): string {
  sequence += 1;
  return `${Date.now().toString(36)}-${sequence}`;
}

async function post<T>(request: APIRequestContext, url: string, data: unknown): Promise<T> {
  const response = await request.post(url, { data });
  if (!response.ok()) {
    throw new Error(`POST ${url} failed with ${response.status()}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

export function createPerson(
  request: APIRequestContext,
  baseUrl: string,
  name: string,
): Promise<Person> {
  return post<Person>(request, `${baseUrl}/api/persons`, { name });
}

export function createSettle(
  request: APIRequestContext,
  baseUrl: string,
  name: string,
): Promise<Settle> {
  return post<Settle>(request, `${baseUrl}/api/settles`, { name });
}

export function createExpense(
  request: APIRequestContext,
  baseUrl: string,
  input: ExpenseSeed,
): Promise<Expense> {
  const participantIds = input.participantIds ?? [input.paidById];
  return post<Expense>(request, `${baseUrl}/api/expenses`, {
    description: input.description,
    amountCents: input.amountCents,
    paidById: input.paidById,
    settleId: input.settleId,
    date: input.date ?? '2026-07-01',
    participants: participantIds.map((personId) => ({ personId, weight: 1 })),
  });
}
