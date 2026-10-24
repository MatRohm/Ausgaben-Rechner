const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_OR_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

/**
 * Accept `YYYY-MM` or `YYYY-MM-DD` and normalize to the first day of the
 * month. Expenses are tracked per month, so the day is not stored.
 */
export function normalizeExpenseDate(value: string): string | null {
  const match = MONTH_OR_DATE.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1 || month < 1 || month > 12) return null;

  if (match[3]) {
    const day = Number(match[3]);
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const maxDay = month === 2 && isLeapYear ? 29 : DAYS_IN_MONTH[month - 1];
    if (day < 1 || day > maxDay) return null;
  }

  return `${match[1]}-${match[2]}-01`;
}
