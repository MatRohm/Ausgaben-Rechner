import { expect } from '@playwright/test';
import { ControlObject } from './ControlObject';

export type SettleStatus = 'Offen' | 'Abgeschlossen';

export class SettleCard extends ControlObject {
  async expectStatus(status: SettleStatus): Promise<void> {
    await expect(this.root.getByText(status, { exact: true })).toBeVisible();
  }

  async rename(newName: string): Promise<void> {
    await this.root.getByTitle('Umbenennen').click();
    const editCard = this.page
      .locator('.settle-card')
      .filter({ has: this.page.locator('.person-edit-input') });
    await editCard.locator('.person-edit-input').fill(newName);
    await editCard.getByRole('button', { name: 'Speichern' }).click();
  }

  async close(): Promise<void> {
    await this.root.getByRole('button', { name: 'Abschließen' }).click();
  }

  async reopen(): Promise<void> {
    await this.root.getByRole('button', { name: 'Wieder öffnen' }).click();
  }

  async remove(): Promise<void> {
    await this.root.getByTitle('Löschen').click();
  }
}
