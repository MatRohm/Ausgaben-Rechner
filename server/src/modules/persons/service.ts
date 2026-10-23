import * as repository from './repository.js';
import type { Person } from './types.js';

export function listPersons(): Person[] {
  return repository.listPersons();
}

export function getPerson(id: number): Person | undefined {
  return repository.getPerson(id);
}

export function createPerson(name: string): Person {
  return repository.insertPerson(name);
}

export function renamePerson(id: number, name: string): Person | undefined {
  return repository.renamePerson(id, name);
}

export function deletePerson(id: number): void {
  repository.deletePerson(id);
}
