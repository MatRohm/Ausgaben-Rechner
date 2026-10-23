export interface Settle {
  id: number;
  name: string;
  createdAt: string;
  closedAt: string | null;
  expenseCount: number;
  totalCents: number;
}
