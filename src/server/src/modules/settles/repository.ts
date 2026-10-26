import { db } from '../../shared/database.js';
import type { Settle } from './types.js';

// The aggregate columns read the expenses table directly. This is a deliberate
// read-only coupling on the shared SQLite schema; writes to expenses still go
// exclusively through the expenses module. See docs/architecture.md.
const settleSelect = `
  SELECT s.id, s.name, s.created_at AS createdAt, s.closed_at AS closedAt,
         COUNT(e.id) AS expenseCount,
         COALESCE(SUM(e.amount_cents), 0) AS totalCents
  FROM settles s
  LEFT JOIN expenses e ON e.settle_id = s.id
`;

export function listSettles(): Settle[] {
  return db
    .prepare(`${settleSelect} GROUP BY s.id ORDER BY s.created_at DESC, s.id DESC`)
    .all() as Settle[];
}

export function getSettle(id: number): Settle | undefined {
  return db.prepare(`${settleSelect} WHERE s.id = ? GROUP BY s.id`).get(id) as Settle | undefined;
}

export function insertSettle(name: string): Settle {
  const info = db.prepare('INSERT INTO settles (name) VALUES (?)').run(name);
  return getSettle(Number(info.lastInsertRowid))!;
}

export function renameSettle(id: number, name: string): Settle | undefined {
  db.prepare('UPDATE settles SET name = ? WHERE id = ?').run(name, id);
  return getSettle(id);
}

export function closeSettle(id: number): Settle | undefined {
  db.prepare("UPDATE settles SET closed_at = datetime('now') WHERE id = ?").run(id);
  return getSettle(id);
}

export function reopenSettle(id: number): Settle | undefined {
  db.prepare('UPDATE settles SET closed_at = NULL WHERE id = ?').run(id);
  return getSettle(id);
}

export function deleteSettle(id: number): void {
  db.prepare('DELETE FROM settles WHERE id = ?').run(id);
}
