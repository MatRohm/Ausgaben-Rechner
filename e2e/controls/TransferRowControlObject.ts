import { expect } from '@playwright/test';
import { ControlObject } from './ControlObject';

export class TransferRowControlObject extends ControlObject {
  async expectFrom(name: string): Promise<void> {
    await expect(this.root.locator('.transfer-from')).toHaveText(name);
  }

  async expectTo(name: string): Promise<void> {
    await expect(this.root.locator('.transfer-to')).toHaveText(name);
  }

  async expectAmount(value: string | RegExp): Promise<void> {
    await expect(this.root.locator('.transfer-amount')).toHaveText(value);
  }
}
