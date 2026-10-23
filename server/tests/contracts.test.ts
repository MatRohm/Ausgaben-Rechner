import type { ValidateFunction } from 'ajv';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { requestJson, startTestServer, type TestServer } from './helpers';

interface JsonSchema {
  [key: string]: unknown;
}

interface OpenApiOperation {
  responses: Record<
    string,
    {
      content?: Record<string, { schema?: JsonSchema }>;
    }
  >;
}

interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
}

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
}

let server: TestServer;
let document: OpenApiDocument;
let compile: (schema: JsonSchema) => ValidateFunction;

const validators = new Map<string, ValidateFunction>();

function validatorFor(
  pathTemplate: string,
  method: string,
  status: number,
): ValidateFunction | undefined {
  const operation = document.paths[pathTemplate]?.[method];
  if (!operation) {
    throw new Error(`OpenAPI has no operation ${method.toUpperCase()} ${pathTemplate}`);
  }
  const response = operation.responses[String(status)];
  if (!response) {
    throw new Error(
      `OpenAPI has no ${status} response for ${method.toUpperCase()} ${pathTemplate}`,
    );
  }
  const schema = response.content?.['application/json']?.schema;
  if (!schema) return undefined;

  const key = `${method} ${pathTemplate} ${status}`;
  let validate = validators.get(key);
  if (!validate) {
    validate = compile(schema);
    validators.set(key, validate);
  }
  return validate;
}

async function call<T>(
  pathTemplate: string,
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { status, body } = await requestJson<T>(server.baseUrl, path, init);
  expect(status, `${method.toUpperCase()} ${path}`).toBeGreaterThanOrEqual(200);
  expect(status, `${method.toUpperCase()} ${path}`).toBeLessThan(300);

  const validate = validatorFor(pathTemplate, method, status);
  if (status !== 204) {
    expect(
      validate,
      `OpenAPI documents no JSON schema for ${method.toUpperCase()} ${pathTemplate} ${status}`,
    ).toBeDefined();
    if (validate) {
      const valid = validate(body);
      expect(valid, `${method.toUpperCase()} ${path}: ${JSON.stringify(validate.errors)}`).toBe(
        true,
      );
    }
  }
  return body as T;
}

beforeAll(async () => {
  // Start the server first so better-sqlite3 is initialized before the schema
  // tooling. Loading the native module after Ajv/SwaggerParser makes its
  // cleanup hooks race with Vitest's worker teardown on Node 24.
  server = await startTestServer();

  const [{ default: SwaggerParser }, { default: Ajv }, { default: addFormats }] = await Promise.all(
    [import('@apidevtools/swagger-parser'), import('ajv'), import('ajv-formats')],
  );
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  compile = (schema) => ajv.compile(schema);

  document = (await SwaggerParser.validate('contracts/openapi.yaml')) as unknown as OpenApiDocument;
});

afterAll(async () => {
  await server.close();
});

describe('OpenAPI contract', () => {
  it('validates every successful response against the published schemas', async () => {
    await call<{ ok: boolean }>('/api/health', 'get', '/api/health');

    const alice = await call<Person>('/api/persons', 'post', '/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    });
    const bob = await call<Person>('/api/persons', 'post', '/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Bob' }),
    });
    await call<Person[]>('/api/persons', 'get', '/api/persons');
    await call<Person>('/api/persons/{id}', 'patch', `/api/persons/${bob.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Robert' }),
    });

    const settle = await call<Settle>('/api/settles', 'post', '/api/settles', {
      method: 'POST',
      body: JSON.stringify({ name: 'Contract trip' }),
    });
    await call<Settle[]>('/api/settles', 'get', '/api/settles');
    await call<Settle>('/api/settles/{id}', 'patch', `/api/settles/${settle.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Contract trip 2025' }),
    });

    const expense = await call<Expense>('/api/expenses', 'post', '/api/expenses', {
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
    await call<Expense[]>('/api/expenses', 'get', `/api/expenses?settleId=${settle.id}`);
    const imported = await call<Expense[]>('/api/expenses/import', 'post', '/api/expenses/import', {
      method: 'POST',
      body: JSON.stringify({
        settleId: settle.id,
        paidById: alice.id,
        participants: [
          { personId: alice.id, weight: 1 },
          { personId: bob.id, weight: 1 },
        ],
        expenses: [
          {
            description: 'Imported statement row',
            amountCents: 1500,
            date: '2025-02-01',
          },
        ],
      }),
    });
    expect(imported).toHaveLength(1);
    await call<Expense>('/api/expenses/{id}', 'patch', `/api/expenses/${expense.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        description: 'Dinner and drinks',
        amountCents: 4000,
        paidById: alice.id,
        settleId: settle.id,
        date: '2025-01-01',
        participants: [
          { personId: alice.id, weight: 1 },
          { personId: bob.id, weight: 1 },
        ],
      }),
    });
    await call<Expense>(
      '/api/expenses/{id}/settled',
      'patch',
      `/api/expenses/${expense.id}/settled`,
      {
        method: 'PATCH',
        body: JSON.stringify({ settled: true }),
      },
    );
    await call<unknown>('/api/settlement/{settleId}', 'get', `/api/settlement/${settle.id}`);

    await call<Settle>('/api/settles/{id}/close', 'post', `/api/settles/${settle.id}/close`, {
      method: 'POST',
    });
    await call<Settle>('/api/settles/{id}/reopen', 'post', `/api/settles/${settle.id}/reopen`, {
      method: 'POST',
    });

    await call<void>('/api/expenses/{id}', 'delete', `/api/expenses/${expense.id}`, {
      method: 'DELETE',
    });
    await call<void>('/api/persons/{id}', 'delete', `/api/persons/${bob.id}`, {
      method: 'DELETE',
    });
    await call<void>('/api/settles/{id}', 'delete', `/api/settles/${settle.id}`, {
      method: 'DELETE',
    });
  });

  it('validates documented error responses', async () => {
    const response = await requestJson<{ error: string }>(server.baseUrl, '/api/persons', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    });

    expect(response.status).toBe(409);
    const validate = validatorFor('/api/persons', 'post', response.status);
    expect(validate).toBeDefined();
    if (validate) {
      const valid = validate(response.body);
      expect(valid, JSON.stringify(validate.errors)).toBe(true);
    }
  });
});
