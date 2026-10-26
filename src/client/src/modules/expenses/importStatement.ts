export type ImportSkipReason = 'credit' | 'zero';

export interface StatementCandidate {
  id: number;
  date: string;
  description: string;
  partnerName?: string;
  amountCents: number;
  importable: boolean;
  reason?: ImportSkipReason;
}

export interface ParsedStatement {
  candidates: StatementCandidate[];
  skippedOtherCurrency: number;
}

interface RawAmount {
  value?: unknown;
  precision?: unknown;
  currency?: unknown;
}

interface RawTransaction {
  booking?: unknown;
  amount?: RawAmount;
  reference?: unknown;
  partnerName?: unknown;
}

/**
 * Parse a George/Erste Bank JSON statement export into import candidates.
 * The raw statement stays in the browser; this function is pure.
 */
export function parseStatementJson(text: string): ParsedStatement {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }

  if (!Array.isArray(data)) {
    throw new Error('Die Datei muss eine Liste von Transaktionen enthalten.');
  }

  const candidates: StatementCandidate[] = [];
  let skippedOtherCurrency = 0;

  data.forEach((entry, index) => {
    const position = index + 1;
    if (entry == null || typeof entry !== 'object') {
      throw new Error(`Transaktion ${position}: Ungültiger Eintrag.`);
    }

    const transaction = entry as RawTransaction;
    const booking = typeof transaction.booking === 'string' ? transaction.booking : '';
    const month = booking.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error(`Transaktion ${position}: Buchungsdatum fehlt oder ist ungültig.`);
    }
    const date = `${month}-01`;

    const amount = transaction.amount;
    const value = typeof amount?.value === 'number' ? amount.value : NaN;
    const precision = typeof amount?.precision === 'number' ? amount.precision : NaN;
    if (!Number.isInteger(value) || precision !== 2) {
      throw new Error(`Transaktion ${position}: Betrag fehlt oder ist ungültig.`);
    }

    const currency = typeof amount?.currency === 'string' ? amount.currency : '';
    if (!currency) {
      throw new Error(`Transaktion ${position}: Währung fehlt.`);
    }
    if (currency !== 'EUR') {
      skippedOtherCurrency += 1;
      return;
    }

    const reference = typeof transaction.reference === 'string' ? transaction.reference.trim() : '';
    const partnerName =
      typeof transaction.partnerName === 'string' ? transaction.partnerName.trim() : '';
    const amountCents = Math.abs(value);
    const importable = value < 0;

    candidates.push({
      id: index,
      date,
      description: reference || partnerName || 'Kontoauszug-Import',
      partnerName: partnerName || undefined,
      amountCents,
      importable,
      reason: importable ? undefined : value === 0 ? 'zero' : 'credit',
    });
  });

  return { candidates, skippedOtherCurrency };
}
