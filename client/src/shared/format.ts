const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const monthFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatMoney(cents: number): string {
  return currency.format(cents / 100);
}

/** Parse a euro amount typed with a comma or dot into integer cents. */
export function parseEuroToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

/** Format integer cents for a euro input field, e.g. 555 -> "5,55". */
export function formatCentsForInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

/** Render a stored expense date (YYYY-MM-01) or month (YYYY-MM) as "Juli 2026". */
export function formatMonth(dateStr: string): string {
  if (!dateStr) return '';
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(dateStr);
  if (!match) return dateStr;

  const month = Number(match[2]);
  if (month < 1 || month > 12) return dateStr;

  return monthFormatter.format(new Date(Date.UTC(Number(match[1]), month - 1, 1)));
}

/** Current month in the local timezone, as YYYY-MM for a month input. */
export function currentMonthISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 7);
}
