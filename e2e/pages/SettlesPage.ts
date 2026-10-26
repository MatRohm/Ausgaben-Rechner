import { expect, type Page } from '@playwright/test';
import { SettleCard } from '../controls/SettleCard';
import { PageObject } from './PageObject';

export class SettlesPage extends PageObject {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  async open(): Promise<void> {
    await this.openPath('/abrechnungen');
  }

  async expectHeading(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Abrechnungen' })).toBeVisible();
  }

  async create(name: string): Promise<void> {
    await this.page.getByPlaceholder('Name der Abrechnung (z. B. September)').fill(name);
    await this.page.getByRole('button', { name: 'Neue Abrechnung' }).click();
  }

  settle(name: string): SettleCard {
    return new SettleCard(this.page, this.page.locator('.settle-card').filter({ hasText: name }));
  }

  async expectSettleCount(name: string, count: number): Promise<void> {
    await expect(this.page.locator('.settle-card').filter({ hasText: name })).toHaveCount(count);
  }
}
