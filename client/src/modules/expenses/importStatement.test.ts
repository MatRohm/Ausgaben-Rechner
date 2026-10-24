import { describe, expect, it } from 'vitest';
import { parseStatementJson } from './importStatement';

const debit = {
  booking: '2026-07-31T00:00:00.000+0200',
  amount: { value: -555, precision: 2, currency: 'EUR' },
  reference: 'POS 5,55 Test Shop',
  partnerName: 'Test Shop',
};

const credit = {
  booking: '2026-06-30T00:00:00.000+0200',
  amount: { value: 273373, precision: 2, currency: 'EUR' },
  reference: 'Lohn/Gehalt',
  partnerName: 'Test Employer',
};

describe('parseStatementJson', () => {
  it('maps debits and credits with month dates and absolute cents', () => {
    const { candidates, skippedOtherCurrency } = parseStatementJson(
      JSON.stringify([debit, credit]),
    );

    expect(skippedOtherCurrency).toBe(0);
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({
      id: 0,
      date: '2026-07-01',
      description: 'POS 5,55 Test Shop',
      partnerName: 'Test Shop',
      amountCents: 555,
      importable: true,
    });
    expect(candidates[0].reason).toBeUndefined();
    expect(candidates[1]).toMatchObject({
      id: 1,
      date: '2026-06-01',
      description: 'Lohn/Gehalt',
      amountCents: 273373,
      importable: false,
      reason: 'credit',
    });
  });

  it('maps the booking month to the first day of the month', () => {
    const { candidates } = parseStatementJson(
      JSON.stringify([
        {
          ...debit,
          booking: '2026-07-01T00:00:00.000+0200',
        },
      ]),
    );

    expect(candidates[0].date).toBe('2026-07-01');
  });

  it('falls back to partnerName and then to a default description', () => {
    const { candidates } = parseStatementJson(
      JSON.stringify([
        { ...debit, reference: null, partnerName: 'Fallback Shop' },
        { ...debit, reference: null, partnerName: null },
      ]),
    );

    expect(candidates[0].description).toBe('Fallback Shop');
    expect(candidates[1].description).toBe('Kontoauszug-Import');
  });

  it('marks zero amounts as non-importable', () => {
    const { candidates } = parseStatementJson(
      JSON.stringify([
        {
          ...debit,
          amount: { value: 0, precision: 2, currency: 'EUR' },
        },
      ]),
    );

    expect(candidates[0]).toMatchObject({ amountCents: 0, importable: false, reason: 'zero' });
  });

  it('skips transactions in another currency', () => {
    const { candidates, skippedOtherCurrency } = parseStatementJson(
      JSON.stringify([{ ...debit, amount: { value: -100, precision: 2, currency: 'USD' } }, debit]),
    );

    expect(skippedOtherCurrency).toBe(1);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].id).toBe(1);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseStatementJson('{')).toThrow('kein gültiges JSON');
  });

  it('rejects a non-array document', () => {
    expect(() => parseStatementJson('{}')).toThrow('Liste von Transaktionen');
  });

  it('rejects malformed transactions with their position', () => {
    expect(() => parseStatementJson(JSON.stringify([{ ...debit, booking: 'invalid' }]))).toThrow(
      'Transaktion 1: Buchungsdatum',
    );

    expect(() =>
      parseStatementJson(
        JSON.stringify([
          debit,
          { ...debit, amount: { value: 12.5, precision: 2, currency: 'EUR' } },
        ]),
      ),
    ).toThrow('Transaktion 2: Betrag');

    expect(() =>
      parseStatementJson(JSON.stringify([{ ...debit, amount: { value: -100, precision: 2 } }])),
    ).toThrow('Transaktion 1: Währung');

    expect(() => parseStatementJson(JSON.stringify([null]))).toThrow(
      'Transaktion 1: Ungültiger Eintrag',
    );
  });
});
