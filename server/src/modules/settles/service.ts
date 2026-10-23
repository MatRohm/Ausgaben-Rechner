import * as repository from './repository.js';
import type { Settle } from './types.js';

export function listSettles(): Settle[] {
  return repository.listSettles();
}

export function getSettle(id: number): Settle | undefined {
  return repository.getSettle(id);
}

export function createSettle(name: string): Settle {
  return repository.insertSettle(name);
}

export function renameSettle(id: number, name: string): Settle | undefined {
  return repository.renameSettle(id, name);
}

export function closeSettle(id: number): Settle | undefined {
  return repository.closeSettle(id);
}

export function reopenSettle(id: number): Settle | undefined {
  return repository.reopenSettle(id);
}

export function deleteSettle(id: number): void {
  repository.deleteSettle(id);
}
