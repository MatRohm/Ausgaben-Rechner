import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpense,
  getSettle,
  listExpenses,
  setExpenseSettled,
  updateExpense,
  type ExpenseInput,
} from '../repository.js';

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

function settleMustBeOpen(settleId: number): string | null {
  const settle = getSettle(settleId);
  if (!settle) return 'Abrechnung nicht gefunden.';
  if (settle.closedAt) {
    return 'Abrechnung ist abgeschlossen und kann nicht mehr bearbeitet werden.';
  }
  return null;
}

expensesRouter.get('/', (req, res) => {
  const settleId = req.query.settleId != null ? Number(req.query.settleId) : undefined;
  res.json(listExpenses(settleId));
});

expensesRouter.post('/', (req, res) => {
  const input = parseExpenseInput(req.body);
  if ('error' in input) {
    res.status(400).json({ error: input.error });
    return;
  }
  const settleError = settleMustBeOpen(input.settleId);
  if (settleError) {
    res.status(400).json({ error: settleError });
    return;
  }
  try {
    res.status(201).json(createExpense(input));
  } catch {
    res
      .status(400)
      .json({ error: 'Konnte Ausgabe nicht speichern. Prüfe Personen und Betrag.' });
  }
});

expensesRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const input = parseExpenseInput(req.body);
  if ('error' in input) {
    res.status(400).json({ error: input.error });
    return;
  }
  const settleError = settleMustBeOpen(input.settleId);
  if (settleError) {
    res.status(400).json({ error: settleError });
    return;
  }
  try {
    const expense = updateExpense(id, input);
    if (!expense) {
      res.status(404).json({ error: 'Ausgabe nicht gefunden.' });
      return;
    }
    res.json(expense);
  } catch {
    res.status(400).json({ error: 'Konnte Ausgabe nicht aktualisieren.' });
  }
});

expensesRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const expense = getExpense(id);
  if (!expense) {
    res.status(404).json({ error: 'Ausgabe nicht gefunden.' });
    return;
  }
  const settle = getSettle(expense.settleId);
  if (settle?.closedAt) {
    res.status(400).json({ error: 'Abrechnung ist abgeschlossen.' });
    return;
  }
  deleteExpense(id);
  res.status(204).end();
});

expensesRouter.patch('/:id/settled', (req, res) => {
  const id = Number(req.params.id);
  const settled = req.body?.settled === true;
  const expense = getExpense(id);
  if (!expense) {
    res.status(404).json({ error: 'Ausgabe nicht gefunden.' });
    return;
  }
  const settle = getSettle(expense.settleId);
  if (settle?.closedAt) {
    res.status(400).json({ error: 'Abrechnung ist abgeschlossen.' });
    return;
  }
  const updated = setExpenseSettled(id, settled);
  res.json(updated);
});
