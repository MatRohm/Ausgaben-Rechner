import type { components } from '@/shared/api-types';

export type ExpenseParticipant = components['schemas']['ExpenseParticipant'];
export type Expense = components['schemas']['Expense'];
export type ExpenseInput = components['schemas']['ExpenseInput'];
export type ExpenseImportInput = components['schemas']['ExpenseImportInput'];
export type ExpenseImportRow = components['schemas']['ExpenseImportRow'];
export type ExpenseDraft = Omit<ExpenseInput, 'settleId'>;
