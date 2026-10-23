const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
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

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Date-only values are calendar dates; avoid a UTC-to-local day shift.
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (isoDate) return `${isoDate[3]}.${isoDate[2]}.${isoDate[1]}`;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
