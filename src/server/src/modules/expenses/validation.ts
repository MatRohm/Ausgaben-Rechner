import { normalizeExpenseDate } from './date.js';
import type { ExpenseImportInput, ExpenseImportRow, ExpenseInput } from './types.js';

export function parseExpenseInput(body: unknown): ExpenseInput | { error: string } {
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

  const normalizedDate = normalizeExpenseDate(date);
  if (!normalizedDate) return { error: 'Bitte Monat und Jahr angeben.' };

  const parsedParticipants = participants.map((p) => {
    const pp = p as Record<string, unknown>;
    return {
      personId: Number(pp.personId),
      weight: Number(pp.weight),
    };
  });

  if (parsedParticipants.length === 0) {
    return { error: 'Mindestens ein Teilnehmer ist erforderlich.' };
  }
  if (
    !parsedParticipants.every(
      (p) => Number.isInteger(p.personId) && Number.isInteger(p.weight) && p.weight >= 0,
    )
  ) {
    return { error: 'Ungültige Teilnehmerdaten.' };
  }
  if (!parsedParticipants.some((p) => p.weight > 0)) {
    return { error: 'Mindestens ein Teilnehmer muss ein Gewicht größer als 0 haben.' };
  }

  return {
    description,
    amountCents,
    paidById,
    settleId,
    date: normalizedDate,
    participants: parsedParticipants,
  };
}

export function parseImportInput(body: unknown): ExpenseImportInput | { error: string } {
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
        p.weight >= 0,
    )
  ) {
    return { error: 'Ungültige Teilnehmerdaten.' };
  }
  if (!parsedParticipants.some((p) => p.weight > 0)) {
    return { error: 'Mindestens ein Teilnehmer muss ein Gewicht größer als 0 haben.' };
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

    const normalizedDate = normalizeExpenseDate(date);
    if (!normalizedDate) {
      return { error: `Ausgabe ${i + 1}: Bitte Monat und Jahr angeben.` };
    }

    parsedExpenses.push({ description, amountCents, date: normalizedDate });
  }

  return { settleId, paidById, participants: parsedParticipants, expenses: parsedExpenses };
}
