import { expect, type Page } from '@playwright/test';
import { ExpenseCardControlObject } from '../controls/ExpenseCardControlObject';
import { ExpenseFormDialogControlObject } from '../controls/ExpenseFormDialogControlObject';
import { ImportStatementDialogControlObject } from '../controls/ImportStatementDialogControlObject';
import { SettleSelectControlObject } from '../controls/SettleSelectControlObject';
import { PageObject } from './PageObject';

export class ExpensesPageObject extends PageObject {
  private readonly settleSelect: SettleSelectControlObject;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.settleSelect = new SettleSelectControlObject(page, page.locator('.settle-select'));
  }

  async open(): Promise<void> {
    await this.openPath('/');
  }

  async selectSettle(name: string): Promise<void> {
    await this.settleSelect.select(name);
  }

  expenseCard(description: string): ExpenseCardControlObject {
    return new ExpenseCardControlObject(
      this.page,
      this.page.locator('.expense-card').filter({ hasText: description }),
    );
  }

  async expectExpenseCount(count: number): Promise<void> {
    await expect(this.page.locator('.expense-card')).toHaveCount(count);
  }

  async openNewExpense(): Promise<ExpenseFormDialogControlObject> {
    await this.page.getByRole('button', { name: '+ Neue Ausgabe' }).click();
    const dialog = new ExpenseFormDialogControlObject(this.page);
    await dialog.expectNewHeading();
    return dialog;
  }

  async openImportDialog(): Promise<ImportStatementDialogControlObject> {
    await this.page.getByRole('button', { name: 'Aus Kontoauszug importieren' }).click();
    const dialog = new ImportStatementDialogControlObject(this.page);
    await dialog.expectVisible();
    return dialog;
  }
}
