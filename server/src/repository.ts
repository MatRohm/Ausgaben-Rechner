import { db } from './db.js';
import type { Expense, Person, Settle } from './types.js';

// ----- Persons -----

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

export function createPerson(name: string): Person {
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

// ----- Settles -----

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
  return db
    .prepare(`${settleSelect} WHERE s.id = ? GROUP BY s.id`)
    .get(id) as Settle | undefined;
}

export function createSettle(name: string): Settle {
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

// ----- Expenses -----

interface ExpenseRow {
  id: number;
  description: string;
  amount_cents: number;
  paid_by_id: number;
  settle_id: number;
  date: string;
  settled: number;
  created_at: string;
  paid_by_name: string;
}

interface ParticipantRow {
  person_id: number;
  weight: number;
  name: string;
}

const expenseSelect = `
  SELECT e.id, e.description, e.amount_cents, e.paid_by_id, e.settle_id, e.date, e.settled,
         e.created_at,
         p.name AS paid_by_name
  FROM expenses e
  JOIN persons p ON p.id = e.paid_by_id
`;

function participantsFor(expenseId: number): ParticipantRow[] {
  return db
    .prepare(
      `
      SELECT ep.person_id, ep.weight, p.name
      FROM expense_participants ep
      JOIN persons p ON p.id = ep.person_id
      WHERE ep.expense_id = ?
      ORDER BY p.name COLLATE NOCASE
    `,
    )
    .all(expenseId) as ParticipantRow[];
}

function rowToExpense(row: ExpenseRow, participants: ParticipantRow[]): Expense {
  return {
    id: row.id,
    description: row.description,
    amountCents: row.amount_cents,
    paidById: row.paid_by_id,
    paidByName: row.paid_by_name,
    settleId: row.settle_id,
    date: row.date,
    settled: !!row.settled,
    createdAt: row.created_at,
    participants: participants.map((p) => ({
      personId: p.person_id,
      weight: p.weight,
      name: p.name,
    })),
  };
}

export function listExpenses(settleId?: number): Expense[] {
  const rows = (settleId == null
    ? db.prepare(`${expenseSelect} ORDER BY e.date DESC, e.id DESC`).all()
    : db
        .prepare(`${expenseSelect} WHERE e.settle_id = ? ORDER BY e.date DESC, e.id DESC`)
        .all(settleId)) as ExpenseRow[];
  return rows.map((r) => rowToExpense(r, participantsFor(r.id)));
}

export function getExpense(id: number): Expense | undefined {
  const row = db
    .prepare(`${expenseSelect} WHERE e.id = ?`)
    .get(id) as ExpenseRow | undefined;
  if (!row) return undefined;
  return rowToExpense(row, participantsFor(row.id));
}

export interface ExpenseInput {
  description: string;
  amountCents: number;
  paidById: number;
  settleId: number;
  date: string;
  participants: { personId: number; weight: number }[];
}

const createExpenseTx = db.transaction((input: ExpenseInput) => {
  const info = db
    .prepare(
      'INSERT INTO expenses (description, amount_cents, paid_by_id, settle_id, date) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      input.description,
      input.amountCents,
      input.paidById,
      input.settleId,
      input.date,
    );
  const id = Number(info.lastInsertRowid);
  const insertPart = db.prepare(
    'INSERT INTO expense_participants (expense_id, person_id, weight) VALUES (?, ?, ?)',
  );
  for (const p of input.participants) {
    insertPart.run(id, p.personId, p.weight);
  }
  return id;
});

export function createExpense(input: ExpenseInput): Expense {
  const id = createExpenseTx(input);
  return getExpense(id)!;
}

const updateExpenseTx = db.transaction((id: number, input: ExpenseInput) => {
  db.prepare(
    'UPDATE expenses SET description = ?, amount_cents = ?, paid_by_id = ?, settle_id = ?, date = ? WHERE id = ?',
  ).run(
    input.description,
    input.amountCents,
    input.paidById,
    input.settleId,
    input.date,
    id,
  );
  db.prepare('DELETE FROM expense_participants WHERE expense_id = ?').run(id);
  const insertPart = db.prepare(
    'INSERT INTO expense_participants (expense_id, person_id, weight) VALUES (?, ?, ?)',
  );
  for (const p of input.participants) {
    insertPart.run(id, p.personId, p.weight);
  }
});

export function updateExpense(id: number, input: ExpenseInput): Expense | undefined {
  updateExpenseTx(id, input);
  return getExpense(id);
}

export function deleteExpense(id: number): void {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
}

export function setExpenseSettled(id: number, settled: boolean): Expense | undefined {
  db.prepare('UPDATE expenses SET settled = ? WHERE id = ?').run(settled ? 1 : 0, id);
  return getExpense(id);
}
