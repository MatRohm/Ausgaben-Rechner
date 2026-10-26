import { expect } from '@playwright/test';
import { ControlObject } from './ControlObject';

export class BalanceRowControlObject extends ControlObject {
  async expectBalance(value: string | RegExp): Promise<void> {
    await expect(this.root.locator('.balance-amount')).toHaveText(value);
  }

  async expectPaid(amount: string): Promise<void> {
    await expect(this.root).toContainText(`bezahlt ${amount}`);
  }

  async expectShare(amount: string): Promise<void> {
    await expect(this.root).toContainText(`Anteil ${amount}`);
  }
}
