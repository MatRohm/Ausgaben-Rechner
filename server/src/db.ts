import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'ausgaben.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    paid_by_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    settle_id INTEGER NOT NULL REFERENCES settles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    settled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expense_participants (
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    weight INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (expense_id, person_id)
  );
`);

// Migration: databases created before the "settles" feature lack the settle_id column.
const columns = db.prepare('PRAGMA table_info(expenses)').all() as { name: string }[];
if (!columns.some((c) => c.name === 'settle_id')) {
  db.exec(
    'ALTER TABLE expenses ADD COLUMN settle_id INTEGER REFERENCES settles(id) ON DELETE CASCADE;',
  );
  const orphan = db
    .prepare('SELECT COUNT(*) AS c FROM expenses WHERE settle_id IS NULL')
    .get() as { c: number };
  if (orphan.c > 0) {
    const info = db.prepare('INSERT INTO settles (name) VALUES (?)').run('Standard');
    db.prepare('UPDATE expenses SET settle_id = ? WHERE settle_id IS NULL').run(
      Number(info.lastInsertRowid),
    );
  }
}

// Migration: databases created before the "bezahlt" feature lack the settled column.
if (!columns.some((c) => c.name === 'settled')) {
  db.exec('ALTER TABLE expenses ADD COLUMN settled INTEGER NOT NULL DEFAULT 0;');
}
