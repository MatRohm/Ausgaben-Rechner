import { expect, type Page } from '@playwright/test';
import { BalanceRowControlObject } from '../controls/BalanceRowControlObject';
import { SettleSelectControlObject } from '../controls/SettleSelectControlObject';
import { TransferRowControlObject } from '../controls/TransferRowControlObject';
import { PageObject } from './PageObject';

export class SettlementPageObject extends PageObject {
  private readonly settleSelect: SettleSelectControlObject;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.settleSelect = new SettleSelectControlObject(page, page.locator('.settle-select'));
  }

  async open(): Promise<void> {
    await this.openPath('/ausgleich');
  }

  async selectSettle(name: string): Promise<void> {
    await this.settleSelect.select(name);
  }

  async expectBalancesHeading(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Kontostände' })).toBeVisible();
  }

  balance(name: string): BalanceRowControlObject {
    return new BalanceRowControlObject(
      this.page,
      this.page.locator('.balance-row').filter({ hasText: name }),
    );
  }

  transfer(fromName: string): TransferRowControlObject {
    return new TransferRowControlObject(
      this.page,
      this.page.locator('.transfer-row').filter({ hasText: fromName }),
    );
  }
}
