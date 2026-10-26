export interface Settle {
  /** @isInt */
  id: number;
  /** @minLength 1 */
  name: string;
  createdAt: string;
  closedAt: string | null;
  /** @isInt @minimum 0 */
  expenseCount: number;
  /** @isInt @minimum 0 */
  totalCents: number;
}

export interface SettleNameInput {
  /** @minLength 1 */
  name: string;
}
