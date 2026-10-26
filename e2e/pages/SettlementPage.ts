import { expect, type Page } from '@playwright/test';
import { BalanceRow } from '../controls/BalanceRow';
import { SettleSelect } from '../controls/SettleSelect';
import { TransferRow } from '../controls/TransferRow';
import { PageObject } from './PageObject';

export class SettlementPage extends PageObject {
  private readonly settleSelect: SettleSelect;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.settleSelect = new SettleSelect(page, page.locator('.settle-select'));
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

  balance(name: string): BalanceRow {
    return new BalanceRow(this.page, this.page.locator('.balance-row').filter({ hasText: name }));
  }

  transfer(fromName: string): TransferRow {
    return new TransferRow(
      this.page,
      this.page.locator('.transfer-row').filter({ hasText: fromName }),
    );
  }
}
