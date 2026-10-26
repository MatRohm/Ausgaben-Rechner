import { expect, type Locator } from '@playwright/test';
import { ControlObject } from './ControlObject';

export class ImportStatementRowControlObject extends ControlObject {
  async expectContains(text: string | RegExp): Promise<void> {
    await expect(this.root).toContainText(text);
  }

  async expectCheckboxDisabled(): Promise<void> {
    await expect(this.checkbox()).toBeDisabled();
  }

  async fillDescription(value: string): Promise<void> {
    await this.description().fill(value);
  }

  async fillAmount(value: string): Promise<void> {
    await this.amount().fill(value);
  }

  async focusCheckbox(): Promise<void> {
    await this.checkbox().focus();
  }

  async expectCheckboxFocused(): Promise<void> {
    await expect(this.checkbox()).toBeFocused();
  }

  async expectDescriptionFocusedAndSelected(): Promise<void> {
    await this.expectFocusedAndSelected(this.description());
  }

  async expectAmountFocusedAndSelected(): Promise<void> {
    await this.expectFocusedAndSelected(this.amount());
  }

  private checkbox(): Locator {
    return this.root.locator('input[type="checkbox"]');
  }

  private description(): Locator {
    return this.root.getByLabel('Name der Ausgabe');
  }

  private amount(): Locator {
    return this.root.getByLabel('Betrag');
  }

  private async expectFocusedAndSelected(locator: Locator): Promise<void> {
    await expect(locator).toBeFocused();
    await expect
      .poll(() =>
        locator.evaluate((element) => {
          const input = element as HTMLInputElement;
          return input.selectionStart === 0 && input.selectionEnd === input.value.length;
        }),
      )
      .toBe(true);
  }
}
