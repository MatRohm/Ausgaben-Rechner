import { Router } from 'express';
import { sendError } from '../../shared/http.js';
import {
  createExpense,
  deleteExpense,
  importExpenses,
  listExpenses,
  setExpenseSettled,
  updateExpense,
} from './service.js';
import type { ExpenseImportInput, ExpenseImportRow, ExpenseInput } from './types.js';

export const expensesRouter = Router();

function parseExpenseInput(body: unknown): ExpenseInput | { error: string } {
  const b = body as Record<string, unknown>;
  const description = typeof b?.description === 'string' ? b.description.trim() : '';
  const amountCents = Number(b?.amountCents);
  const paidById = Number(b?.paidById);
  const settleId = Number(b?.settleId);
  const date = typeof b?.date === 'string' ? b.date : '';
  const participants = Array.isArray(b?.participants) ? b.participants : [];

  if (!description) return { error: 'Beschreibung ist erforderlich.' };
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { error: 'Betrag muss eine positive ganze Zahl (Cent) sein.' };
  }
  if (!Number.isInteger(paidById)) return { error: 'Bezahler ist erforderlich.' };
  if (!Number.isInteger(settleId)) return { error: 'Abrechnung ist erforderlich.' };
  if (!date) return { error: 'Datum ist erforderlich.' };

  const parsedParticipants = participants.map((p) => {
    const pp = p as Record<string, unknown>;
    return {
      personId: Number(pp.personId),
      weight: Number(pp.weight) || 1,
    };
  });

  if (parsedParticipants.length === 0) {
    return { error: 'Mindestens ein Teilnehmer ist erforderlich.' };
  }
  if (
    !parsedParticipants.every(
      (p) => Number.isInteger(p.personId) && Number.isInteger(p.weight) && p.weight > 0,
    )
  ) {
    return { error: 'Ungültige Teilnehmerdaten.' };
  }

  return {
    description,
    amountCents,
    paidById,
    settleId,
    date,
    participants: parsedParticipants,
  };
}

function parseImportInput(body: unknown): ExpenseImportInput | { error: string } {
  const b = body as Record<string, unknown>;
  const settleId = Number(b?.settleId);
  const paidById = Number(b?.paidById);
  const participants = Array.isArray(b?.participants) ? b.participants : [];
  const expenses = Array.isArray(b?.expenses) ? b.expenses : [];

  if (!Number.isInteger(settleId) || settleId <= 0) {
    return { error: 'Abrechnung ist erforderlich.' };
  }
  if (!Number.isInteger(paidById) || paidById <= 0) {
    return { error: 'Bezahler ist erforderlich.' };
  }
  if (participants.length === 0) {
    return { error: 'Mindestens ein Teilnehmer ist erforderlich.' };
  }

  const parsedParticipants = participants.map((p) => {
    const pp = p as Record<string, unknown>;
    return {
      personId: Number(pp.personId),
      weight: Number(pp.weight),
    };
  });
  if (
    !parsedParticipants.every(
      (p) =>
        Number.isInteger(p.personId) &&
        p.personId > 0 &&
        Number.isInteger(p.weight) &&
        p.weight > 0,
    )
  ) {
    return { error: 'Ungültige Teilnehmerdaten.' };
  }

  if (expenses.length === 0) {
    return { error: 'Mindestens eine Ausgabe ist erforderlich.' };
  }

  const parsedExpenses: ExpenseImportRow[] = [];
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i] as Record<string, unknown>;
    const description = typeof e?.description === 'string' ? e.description.trim() : '';
    const amountCents = Number(e?.amountCents);
    const date = typeof e?.date === 'string' ? e.date : '';

    if (!description) {
      return { error: `Ausgabe ${i + 1}: Beschreibung ist erforderlich.` };
    }
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return { error: `Ausgabe ${i + 1}: Betrag muss eine positive ganze Zahl (Cent) sein.` };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { error: `Ausgabe ${i + 1}: Ungültiges Datum.` };
    }

    parsedExpenses.push({ description, amountCents, date });
  }

  return { settleId, paidById, participants: parsedParticipants, expenses: parsedExpenses };
}

expensesRouter.get('/', (req, res) => {
  const settleId = req.query.settleId != null ? Number(req.query.settleId) : undefined;
  res.json(listExpenses(settleId));
});

expensesRouter.post('/import', (req, res) => {
  const input = parseImportInput(req.body);
  if ('error' in input) {
    res.status(400).json({ error: input.error });
    return;
  }
  try {
    res.status(201).json(importExpenses(input));
  } catch (error) {
    sendError(res, error, 'Konnte Ausgaben nicht importieren. Prüfe Personen und Beträge.');
  }
});

expensesRouter.post('/', (req, res) => {
  const input = parseExpenseInput(req.body);
  if ('error' in input) {
    res.status(400).json({ error: input.error });
    return;
  }
  try {
    res.status(201).json(createExpense(input));
  } catch (error) {
    sendError(res, error, 'Konnte Ausgabe nicht speichern. Prüfe Personen und Betrag.');
  }
});

expensesRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const input = parseExpenseInput(req.body);
  if ('error' in input) {
    res.status(400).json({ error: input.error });
    return;
  }
  try {
    const expense = updateExpense(id, input);
    if (!expense) {
      res.status(404).json({ error: 'Ausgabe nicht gefunden.' });
      return;
    }
    res.json(expense);
  } catch (error) {
    sendError(res, error, 'Konnte Ausgabe nicht aktualisieren.');
  }
});

expensesRouter.delete('/:id', (req, res) => {
  try {
    deleteExpense(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    sendError(res, error, 'Konnte Ausgabe nicht löschen.');
  }
});

expensesRouter.patch('/:id/settled', (req, res) => {
  const id = Number(req.params.id);
  const settled = req.body?.settled === true;
  try {
    res.json(setExpenseSettled(id, settled));
  } catch (error) {
    sendError(res, error, 'Konnte Ausgabe nicht aktualisieren.');
  }
});
