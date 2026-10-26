import { expect, type Locator, type Page } from '@playwright/test';
import { ControlObject } from './ControlObject';

export class ExpenseFormDialog extends ControlObject {
  constructor(page: Page) {
    super(page, page.locator('.expense-form'));
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async expectNewHeading(): Promise<void> {
    await expect(this.root.getByRole('heading', { name: 'Neue Ausgabe' })).toBeVisible();
  }

  async expectEditHeading(): Promise<void> {
    await expect(this.root.getByRole('heading', { name: 'Ausgabe bearbeiten' })).toBeVisible();
  }

  async fillDescription(value: string): Promise<void> {
    await this.root.getByLabel('Beschreibung').fill(value);
  }

  async expectDescription(value: string): Promise<void> {
    await expect(this.root.getByLabel('Beschreibung')).toHaveValue(value);
  }

  async fillAmount(value: string): Promise<void> {
    await this.root.getByLabel('Betrag (€)').fill(value);
  }

  async selectPayer(name: string): Promise<void> {
    await this.root.getByLabel('Bezahlt von').selectOption({ label: name });
  }

  async fillMonth(value: string): Promise<void> {
    await this.root.getByLabel('Monat').fill(value);
  }

  async expectParticipantChecked(name: string): Promise<void> {
    await expect(this.root.getByRole('checkbox', { name })).toBeChecked();
  }

  async uncheckParticipantsExcept(names: string[]): Promise<void> {
    const rows = this.root.locator('.participant-row');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = await row.innerText();
      if (names.some((name) => text.includes(name))) continue;

      const checkbox = row.getByRole('checkbox');
      if (await checkbox.isChecked()) await checkbox.uncheck();
    }
  }

  async setWeight(name: string, value: string): Promise<void> {
    await this.participantRow(name).locator('.weight-input').fill(value);
  }

  async save(): Promise<void> {
    await this.root.getByRole('button', { name: 'Speichern', exact: true }).click();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  private participantRow(name: string): Locator {
    return this.root.locator('.participant-row').filter({ hasText: name });
  }
}
