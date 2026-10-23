import type { Server } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

export interface ApiResponse<T> {
  status: number;
  body: T;
}

/**
 * Start the Express app on an ephemeral port with a fresh temporary SQLite
 * database. Each test file should start at most one server because the
 * database module is a process-wide singleton.
 */
export async function startTestServer(): Promise<TestServer> {
  const dataDir = mkdtempSync(join(tmpdir(), 'ausgaben-test-'));
  const previousDataDir = process.env.DATA_DIR;
  process.env.DATA_DIR = dataDir;

  // Import after DATA_DIR is set: the database module initializes on import.
  const { createApp } = await import('../src/app/app');
  const app = createApp();
  const server = await new Promise<Server>((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    baseUrl,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      const { closeDatabase } = await import('../src/shared/database');
      closeDatabase();
      rmSync(dataDir, { recursive: true, force: true });
      if (previousDataDir === undefined) delete process.env.DATA_DIR;
      else process.env.DATA_DIR = previousDataDir;
    },
  };
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = response.status === 204 ? undefined : await response.json();
  return { status: response.status, body: body as T };
}

/** Request a JSON endpoint and throw unless the response is 2xx. */
export async function api<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const { status, body } = await requestJson<T>(baseUrl, path, init);
  if (status < 200 || status >= 300) {
    throw new Error(
      `HTTP ${status}: ${(body as { error?: string } | undefined)?.error ?? 'unknown'}`,
    );
  }
  return body as T;
}
