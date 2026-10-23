import type { Server } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface Person {
  id: number;
  name: string;
}

interface Settle {
  id: number;
  name: string;
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

let server: Server;
let baseUrl: string;
let dataDir: string;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${(body as { error?: string } | undefined)?.error ?? 'unknown'}`,
    );
  }
  return body as T;
}

beforeAll(async () => {
  dataDir = mkdtempSync(join(tmpdir(), 'ausgaben-test-'));
  process.env.DATA_DIR = dataDir;

  // Import after DATA_DIR is set: the database module initializes on import.
  const { createApp } = await import('../src/app/app');
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  rmSync(dataDir, { recursive: true, force: true });
});

describe('REST API', () => {
  it('runs the persons, settles, expenses, and settlement flow', async () => {
    const alice = await api<Person>('/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    });
    const bob = await api<Person>('/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Bob' }),
    });
    const settle = await api<Settle>('/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name: 'Trip' }),
    });

    const created = await api<Expense>('/api/expenses', {
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

    const result = await api<SettlementResult>(`/api/settlement/${settle.id}`);
    expect(result.transfers).toEqual([
      {
        fromPersonId: bob.id,
        fromName: 'Bob',
        toPersonId: alice.id,
        toName: 'Alice',
        amountCents: 1500,
      },
    ]);

    await api<Expense>(`/api/expenses/${created.id}/settled`, {
      method: 'PATCH',
      body: JSON.stringify({ settled: true }),
    });

    const afterSettled = await api<SettlementResult>(
      `/api/settlement/${settle.id}`,
    );
    expect(afterSettled.transfers).toEqual([]);
    expect(
      afterSettled.balances.every((balance) => balance.balanceCents === 0),
    ).toBe(true);
  });

  it('rejects writes to a closed settle', async () => {
    const person = await api<Person>('/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Closed-Test' }),
    });
    const settle = await api<Settle>('/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name: 'Closed settle' }),
    });

    await api<Settle>(`/api/settles/${settle.id}/close`, { method: 'POST' });

    await expect(
      api('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Blocked',
          amountCents: 100,
          paidById: person.id,
          settleId: settle.id,
          date: '2025-01-01',
          participants: [{ personId: person.id, weight: 1 }],
        }),
      }),
    ).rejects.toThrow(/abgeschlossen/);
  });
});
