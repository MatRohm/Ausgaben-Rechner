import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  api,
  requestJson,
  startTestServer,
  type TestServer,
} from './helpers';

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
  amountCents: number;
  settled: boolean;
}

interface SettlementResult {
  balances: { personId: number; balanceCents: number }[];
  transfers: { fromPersonId: number; toPersonId: number; amountCents: number }[];
}

let server: TestServer;

beforeAll(async () => {
  server = await startTestServer();
});

afterAll(async () => {
  await server.close();
});

describe('REST API', () => {
  it('runs the persons, settles, expenses, and settlement flow', async () => {
    const alice = await api<Person>(server.baseUrl, '/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    });
    const bob = await api<Person>(server.baseUrl, '/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Bob' }),
    });
    const settle = await api<Settle>(server.baseUrl, '/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name: 'Trip' }),
    });

    const created = await api<Expense>(server.baseUrl, '/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Dinner',
        amountCents: 3000,
        paidById: alice.id,
        settleId: settle.id,
        date: '2025-01-01',
        participants: [
          { personId: alice.id, weight: 1 },
          { personId: bob.id, weight: 1 },
        ],
      }),
    });

    const result = await api<SettlementResult>(
      server.baseUrl,
      `/api/settlement/${settle.id}`,
    );
    expect(result.transfers).toEqual([
      {
        fromPersonId: bob.id,
        fromName: 'Bob',
        toPersonId: alice.id,
        toName: 'Alice',
        amountCents: 1500,
      },
    ]);

    await api<Expense>(server.baseUrl, `/api/expenses/${created.id}/settled`, {
      method: 'PATCH',
      body: JSON.stringify({ settled: true }),
    });

    const afterSettled = await api<SettlementResult>(
      server.baseUrl,
      `/api/settlement/${settle.id}`,
    );
    expect(afterSettled.transfers).toEqual([]);
    expect(
      afterSettled.balances.every((balance) => balance.balanceCents === 0),
    ).toBe(true);
  });

  it('rejects writes to a closed settle', async () => {
    const person = await api<Person>(server.baseUrl, '/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Closed-Test' }),
    });
    const settle = await api<Settle>(server.baseUrl, '/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name: 'Closed settle' }),
    });

    await api<Settle>(server.baseUrl, `/api/settles/${settle.id}/close`, {
      method: 'POST',
    });

    const response = await requestJson(server.baseUrl, '/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Blocked',
        amountCents: 100,
        paidById: person.id,
        settleId: settle.id,
        date: '2025-01-01',
        participants: [{ personId: person.id, weight: 1 }],
      }),
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: expect.stringMatching(/abgeschlossen/) });
  });
});
