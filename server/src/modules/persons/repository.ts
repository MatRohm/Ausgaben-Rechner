import { db } from '../../shared/database.js';
import type { Person } from './types.js';

export function listPersons(): Person[] {
  return db
    .prepare('SELECT id, name FROM persons ORDER BY name COLLATE NOCASE')
    .all() as Person[];
}

export function getPerson(id: number): Person | undefined {
  return db.prepare('SELECT id, name FROM persons WHERE id = ?').get(id) as
    | Person
    | undefined;
}

export function insertPerson(name: string): Person {
  const info = db.prepare('INSERT INTO persons (name) VALUES (?)').run(name);
  return { id: Number(info.lastInsertRowid), name };
}

export function renamePerson(id: number, name: string): Person | undefined {
  db.prepare('UPDATE persons SET name = ? WHERE id = ?').run(name, id);
  return getPerson(id);
}

export function deletePerson(id: number): void {
  db.prepare('DELETE FROM persons WHERE id = ?').run(id);
}
