import { expect, type Page } from '@playwright/test';
import { PersonRow } from '../controls/PersonRow';
import { PageObject } from './PageObject';

export class PersonsPage extends PageObject {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  async open(): Promise<void> {
    await this.openPath('/personen');
  }

  async expectHeading(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Personen' })).toBeVisible();
  }

  async add(name: string): Promise<void> {
    await this.page.getByPlaceholder('Name der Person').fill(name);
    await this.page.getByRole('button', { name: 'Hinzufügen' }).click();
  }

  person(name: string): PersonRow {
    return new PersonRow(this.page, this.page.locator('.person-row').filter({ hasText: name }));
  }

  async expectPersonCount(name: string, count: number): Promise<void> {
    await expect(this.page.locator('.person-row').filter({ hasText: name })).toHaveCount(count);
  }
}
