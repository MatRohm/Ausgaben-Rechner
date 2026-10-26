import { expect } from '@playwright/test';
import { ControlObject } from './ControlObject';
import { ExpenseFormDialog } from './ExpenseFormDialog';

export class ExpenseCard extends ControlObject {
  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async expectAmount(amount: string | RegExp): Promise<void> {
    await expect(this.root).toContainText(amount);
  }

  async expectPayer(name: string): Promise<void> {
    await expect(this.root).toContainText(`${name} hat bezahlt`);
  }

  async expectMonth(month: string): Promise<void> {
    await expect(this.root).toContainText(month);
  }

  async expectSplit(names: string[]): Promise<void> {
    await expect(this.root).toContainText(`Aufgeteilt auf: ${names.join(', ')}`);
  }

  async openEdit(): Promise<ExpenseFormDialog> {
    await this.root.getByTitle('Bearbeiten').click();
    const dialog = new ExpenseFormDialog(this.page);
    await dialog.expectEditHeading();
    return dialog;
  }

  async toggleSettled(): Promise<void> {
    await this.root.getByRole('button', { name: /Bezahlt/ }).click();
  }

  async expectPaid(): Promise<void> {
    await expect(this.root.locator('.badge-paid')).toBeVisible();
  }

  async remove(): Promise<void> {
    await this.root.getByTitle('Löschen').click();
  }
}
