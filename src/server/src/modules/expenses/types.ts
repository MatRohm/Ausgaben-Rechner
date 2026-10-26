export interface ExpenseParticipant {
  /** @isInt */
  personId: number;
  /** @isInt @minimum 0 */
  weight: number;
  name?: string;
}

export interface Expense {
  /** @isInt */
  id: number;
  /** @minLength 1 */
  description: string;
  /** @isInt @minimum 1 */
  amountCents: number;
  /** @isInt */
  paidById: number;
  paidByName?: string;
  /** @isInt */
  settleId: number;
  date: string;
  settled: boolean;
  createdAt: string;
  participants: ExpenseParticipant[];
}

export interface ExpenseParticipantInput {
  /** @isInt */
  personId: number;
  /** @isInt @minimum 0 */
  weight: number;
}

export interface ExpenseInput {
  /** @minLength 1 */
  description: string;
  /** @isInt @minimum 1 */
  amountCents: number;
  /** @isInt */
  paidById: number;
  /** @isInt */
  settleId: number;
  /** Format: YYYY-MM or YYYY-MM-DD. @pattern ^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$ */
  date: string;
  /** @minItems 1 */
  participants: ExpenseParticipantInput[];
}

export interface ExpenseSettledInput {
  settled: boolean;
}

export interface ExpenseImportRow {
  /** @minLength 1 */
  description: string;
  /** @isInt @minimum 1 */
  amountCents: number;
  /** Format: YYYY-MM or YYYY-MM-DD. @pattern ^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$ */
  date: string;
}

export interface ExpenseImportInput {
  /** @isInt */
  settleId: number;
  /** @isInt */
  paidById: number;
  /** @minItems 1 */
  participants: ExpenseParticipantInput[];
  /** @minItems 1 */
  expenses: ExpenseImportRow[];
}
