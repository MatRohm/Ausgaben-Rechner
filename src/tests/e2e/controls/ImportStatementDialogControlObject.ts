import { expect, type Page } from '@playwright/test';
import { ControlObject } from './ControlObject';
import { ImportStatementRowControlObject } from './ImportStatementRowControlObject';

export class ImportStatementDialogControlObject extends ControlObject {
  constructor(page: Page) {
    super(page, page.locator('.import-modal'));
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async selectPayer(name: string): Promise<void> {
    await this.root.getByLabel('Bezahlt von').selectOption({ label: name });
  }

  async expectParticipantChecked(name: string): Promise<void> {
    await expect(this.root.getByRole('checkbox', { name })).toBeChecked();
  }

  async uploadStatement(filePath: string): Promise<void> {
    await this.root.getByLabel('Kontoauszug (JSON)').setInputFiles(filePath);
  }

  row(index: number): ImportStatementRowControlObject {
    return new ImportStatementRowControlObject(
      this.page,
      this.root.locator('.import-row').nth(index),
    );
  }

  async expectRowCount(count: number): Promise<void> {
    await expect(this.root.locator('.import-row')).toHaveCount(count);
  }

  async expectSummary(text: string | RegExp): Promise<void> {
    await expect(this.root.getByText(text)).toBeVisible();
  }

  async importExpenses(): Promise<void> {
    await this.root.getByRole('button', { name: /Ausgaben importieren/ }).click();
  }

  async expectDuplicateCount(count: number): Promise<void> {
    await expect(this.root.locator('.badge-duplicate')).toHaveCount(count);
  }

  async expectDuplicateText(): Promise<void> {
    await expect(this.root.locator('.badge-duplicate')).toContainText(
      'Möglicherweise bereits importiert',
    );
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async focusCancel(): Promise<void> {
    await this.root.getByRole('button', { name: 'Abbrechen' }).focus();
  }
}
