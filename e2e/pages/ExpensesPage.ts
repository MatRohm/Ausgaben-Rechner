import { expect, type Page } from '@playwright/test';
import { ExpenseCard } from '../controls/ExpenseCard';
import { ExpenseFormDialog } from '../controls/ExpenseFormDialog';
import { ImportStatementDialog } from '../controls/ImportStatementDialog';
import { SettleSelect } from '../controls/SettleSelect';
import { PageObject } from './PageObject';

export class ExpensesPage extends PageObject {
  private readonly settleSelect: SettleSelect;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.settleSelect = new SettleSelect(page, page.locator('.settle-select'));
  }

  async open(): Promise<void> {
    await this.openPath('/');
  }

  async selectSettle(name: string): Promise<void> {
    await this.settleSelect.select(name);
  }

  expenseCard(description: string): ExpenseCard {
    return new ExpenseCard(
      this.page,
      this.page.locator('.expense-card').filter({ hasText: description }),
    );
  }

  async expectExpenseCount(count: number): Promise<void> {
    await expect(this.page.locator('.expense-card')).toHaveCount(count);
  }

  async openNewExpense(): Promise<ExpenseFormDialog> {
    await this.page.getByRole('button', { name: '+ Neue Ausgabe' }).click();
    const dialog = new ExpenseFormDialog(this.page);
    await dialog.expectNewHeading();
    return dialog;
  }

  async openImportDialog(): Promise<ImportStatementDialog> {
    await this.page.getByRole('button', { name: 'Aus Kontoauszug importieren' }).click();
    const dialog = new ImportStatementDialog(this.page);
    await dialog.expectVisible();
    return dialog;
  }
}
