import { expect } from '@playwright/test';
import { ControlObject } from './ControlObject';

export class SettleSelect extends ControlObject {
  async select(name: string): Promise<void> {
    await expect(this.root).toContainText(name);
    await this.root.selectOption({ label: name });
  }
}
