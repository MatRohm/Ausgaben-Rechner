import { expect, type Page } from '@playwright/test';

/**
 * Base class for pages that tests can navigate to and act on.
 */
export abstract class PageObject {
  constructor(
    protected readonly page: Page,
    private readonly baseUrl: string,
  ) {}

  protected async openPath(path: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  acceptBrowserDialogs(): void {
    this.page.on('dialog', (dialog) => void dialog.accept());
  }

  url(): string {
    return this.page.url();
  }

  async expectUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }
}
