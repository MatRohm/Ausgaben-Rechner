import type { Locator, Page } from '@playwright/test';

/**
 * Base class for reusable controls such as dialogs, rows, and selects.
 * Controls own the Playwright interactions for their part of the UI.
 */
export abstract class ControlObject {
  constructor(
    protected readonly page: Page,
    protected readonly root: Locator,
  ) {}
}
