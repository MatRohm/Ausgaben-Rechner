import path from 'node:path';
import type { APIRequestContext, Page } from '@playwright/test';
import { test } from '../fixtures';
import { ExpensesPageObject } from '../pages/ExpensesPageObject';
import { createExpense, createPerson, createSettle, uniqueSuffix } from '../support';

const statementFile = path.join(process.cwd(), 'e2e', 'fixtures', 'statement.json');

async function arrangeImport(
  page: Page,
  request: APIRequestContext,
  baseUrl: string,
  label: string,
) {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, baseUrl, `${label} ${suffix}`);

  const expenses = new ExpensesPageObject(page, baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const dialog = await expenses.openImportDialog();
  await dialog.selectPayer(alice.name);

  return { alice, bob, settle, expenses, dialog };
}

test('statement import shows the parsed preview', async ({ page, request, app }) => {
  // ARRANGE
  const { alice, bob, dialog } = await arrangeImport(page, request, app.baseUrl, 'Import preview');

  // ACT
  await dialog.uploadStatement(statementFile);

  // ASSERT
  await dialog.expectParticipantChecked(alice.name);
  await dialog.expectParticipantChecked(bob.name);
  await dialog.expectRowCount(3);
  const creditRow = dialog.row(2);
  await creditRow.expectContains('Gutschrift');
  await creditRow.expectCheckboxDisabled();
});

test('statement import supports editing the preview', async ({ page, request, app }) => {
  // ARRANGE
  const { dialog } = await arrangeImport(page, request, app.baseUrl, 'Import edit');
  await dialog.uploadStatement(statementFile);
  const firstRow = dialog.row(0);

  // ACT
  await firstRow.fillDescription('Edited supermarket');
  await firstRow.fillAmount('19,99');

  // ASSERT
  await dialog.expectSummary(/2 ausgewählt.*24,99/);
});

test('statement import imports the selected rows', async ({ page, request, app }) => {
  // ARRANGE
  const { expenses, dialog } = await arrangeImport(page, request, app.baseUrl, 'Import rows');
  await dialog.uploadStatement(statementFile);

  // ACT
  await dialog.importExpenses();

  // ASSERT
  await dialog.expectHidden();
  await expenses.expectExpenseCount(2);
  await expenses.expenseCard('POS Supermarkt').expectAmount('12,50');
  await expenses.expenseCard('POS Bäckerei').expectAmount('5,00');
});

test('statement import flags duplicates', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Import duplicate ${suffix}`);
  await createExpense(request, app.baseUrl, {
    description: 'POS Supermarkt',
    amountCents: 1_250,
    paidById: alice.id,
    settleId: settle.id,
    date: '2026-07-01',
    participantIds: [alice.id, bob.id],
  });

  const expenses = new ExpensesPageObject(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);
  const dialog = await expenses.openImportDialog();
  await dialog.selectPayer(alice.name);

  // ACT
  await dialog.uploadStatement(statementFile);

  // ASSERT
  await dialog.expectDuplicateCount(1);
  await dialog.expectDuplicateText();
});

test('alt+right moves focus from the checkbox to the amount', async ({ page, request, app }) => {
  // ARRANGE
  const { dialog } = await arrangeImport(page, request, app.baseUrl, 'Keys right');
  await dialog.uploadStatement(statementFile);
  const firstRow = dialog.row(0);
  await firstRow.focusCheckbox();

  // ACT
  await dialog.pressKey('Alt+ArrowRight');
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await firstRow.expectAmountFocusedAndSelected();
});

test('alt+left moves focus from the amount to the checkbox', async ({ page, request, app }) => {
  // ARRANGE
  const { dialog } = await arrangeImport(page, request, app.baseUrl, 'Keys left');
  await dialog.uploadStatement(statementFile);
  const firstRow = dialog.row(0);
  await firstRow.focusAmount();

  // ACT
  await dialog.pressKey('Alt+ArrowLeft');
  await dialog.pressKey('Alt+ArrowLeft');

  // ASSERT
  await firstRow.expectCheckboxFocused();
});

test('alt+down keeps the amount column and skips non-importable rows', async ({
  page,
  request,
  app,
}) => {
  // ARRANGE
  const { dialog } = await arrangeImport(page, request, app.baseUrl, 'Keys down');
  await dialog.uploadStatement(statementFile);
  const firstRow = dialog.row(0);
  const secondRow = dialog.row(1);
  await firstRow.focusAmount();

  // ACT
  await dialog.pressKey('Alt+ArrowDown');
  await dialog.pressKey('Alt+ArrowDown');

  // ASSERT
  await secondRow.expectAmountFocusedAndSelected();
});

test('alt+up keeps the amount column', async ({ page, request, app }) => {
  // ARRANGE
  const { dialog } = await arrangeImport(page, request, app.baseUrl, 'Keys up');
  await dialog.uploadStatement(statementFile);
  const firstRow = dialog.row(0);
  const secondRow = dialog.row(1);
  await secondRow.focusAmount();

  // ACT
  await dialog.pressKey('Alt+ArrowUp');

  // ASSERT
  await firstRow.expectAmountFocusedAndSelected();
});

test('alt+left and alt+right do not navigate browser history', async ({ page, request, app }) => {
  // ARRANGE
  const { expenses, dialog } = await arrangeImport(page, request, app.baseUrl, 'Keys history');
  await dialog.uploadStatement(statementFile);
  await dialog.focusCancel();
  const urlBefore = expenses.url();

  // ACT
  await dialog.pressKey('Alt+ArrowLeft');
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await dialog.expectVisible();
  await expenses.expectUrl(urlBefore);
});
