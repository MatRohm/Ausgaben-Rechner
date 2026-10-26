import path from 'node:path';
import { test } from '../fixtures';
import { ExpensesPage } from '../pages/ExpensesPage';
import { createPerson, createSettle, uniqueSuffix } from '../support';

const statementFile = path.join(process.cwd(), 'e2e', 'fixtures', 'statement.json');

test('statement import supports editing the preview and flags duplicates', async ({
  page,
  request,
  app,
}) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Import ${suffix}`);

  const expenses = new ExpensesPage(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const dialog = await expenses.openImportDialog();
  await dialog.selectPayer(alice.name);
  await dialog.expectParticipantChecked(alice.name);
  await dialog.expectParticipantChecked(bob.name);
  await dialog.uploadStatement(statementFile);

  await dialog.expectRowCount(3);
  const creditRow = dialog.row(2);
  await creditRow.expectContains('Gutschrift');
  await creditRow.expectCheckboxDisabled();

  const firstRow = dialog.row(0);
  await firstRow.fillDescription('Edited supermarket');
  await firstRow.fillAmount('19,99');
  await dialog.expectSummary(/2 ausgewählt.*24,99/);

  await dialog.importExpenses();
  await dialog.expectHidden();

  await expenses.expectExpenseCount(2);
  await expenses.expenseCard('Edited supermarket').expectAmount('19,99');
  await expenses.expenseCard('POS Bäckerei').expectAmount('5,00');

  const duplicateDialog = await expenses.openImportDialog();
  await duplicateDialog.uploadStatement(statementFile);
  await duplicateDialog.expectDuplicateCount(1);
  await duplicateDialog.expectDuplicateText();
});

test('statement import navigates rows and fields with alt+arrow keys', async ({
  page,
  request,
  app,
}) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Keys ${suffix}`);

  const expenses = new ExpensesPage(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const dialog = await expenses.openImportDialog();
  await dialog.selectPayer(alice.name);
  await dialog.uploadStatement(statementFile);

  const firstRow = dialog.row(0);
  const secondRow = dialog.row(1);

  await firstRow.focusCheckbox();
  await dialog.pressKey('Alt+ArrowRight');
  await firstRow.expectDescriptionFocusedAndSelected();

  await dialog.pressKey('Alt+ArrowRight');
  await firstRow.expectAmountFocusedAndSelected();

  await dialog.pressKey('Alt+ArrowLeft');
  await firstRow.expectDescriptionFocusedAndSelected();

  await dialog.pressKey('Alt+ArrowLeft');
  await firstRow.expectCheckboxFocused();

  await dialog.pressKey('Alt+ArrowDown');
  await secondRow.expectCheckboxFocused();

  await dialog.pressKey('Alt+ArrowRight');
  await secondRow.expectDescriptionFocusedAndSelected();

  await dialog.pressKey('Alt+ArrowRight');
  await secondRow.expectAmountFocusedAndSelected();

  await dialog.pressKey('Alt+ArrowUp');
  await firstRow.expectAmountFocusedAndSelected();

  await dialog.pressKey('Alt+ArrowDown');
  await secondRow.expectAmountFocusedAndSelected();

  // Row 3 is not importable, so Alt+ArrowDown keeps focus on row 2.
  await dialog.pressKey('Alt+ArrowDown');
  await secondRow.expectAmountFocusedAndSelected();

  // Alt+Left/Right must not navigate browser history while the dialog is open.
  const urlBefore = expenses.url();
  await dialog.focusCancel();
  await dialog.pressKey('Alt+ArrowLeft');
  await dialog.pressKey('Alt+ArrowRight');
  await dialog.expectVisible();
  await expenses.expectUrl(urlBefore);
});
