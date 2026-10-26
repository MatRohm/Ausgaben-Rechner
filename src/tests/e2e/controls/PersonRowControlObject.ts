import { expect } from '@playwright/test';
import { ControlObject } from './ControlObject';

export class PersonRowControlObject extends ControlObject {
  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async rename(newName: string): Promise<void> {
    await this.root.getByTitle('Umbenennen').click();
    const editRow = this.page
      .locator('.person-row')
      .filter({ has: this.page.locator('.person-edit-input') });
    await editRow.locator('.person-edit-input').fill(newName);
    await editRow.getByRole('button', { name: 'Speichern' }).click();
  }

  async remove(): Promise<void> {
    await this.root.getByTitle('Entfernen').click();
  }
}
