import path from 'node:path';
import { test } from '../fixtures';
import { ExpensesPageObject } from '../pages/ExpensesPageObject';
import { createPerson, createSettle, uniqueSuffix } from '../support';

const statementFile = path.join(process.cwd(), 'e2e', 'fixtures', 'statement.json');

test('statement import supports editing the preview and flags duplicates', async ({
  page,
  request,
  app,
}) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Import ${suffix}`);

  const expenses = new ExpensesPageObject(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const dialog = await expenses.openImportDialog();
  await dialog.selectPayer(alice.name);
  await dialog.uploadStatement(statementFile);

  // ASSERT
  await dialog.expectParticipantChecked(alice.name);
  await dialog.expectParticipantChecked(bob.name);
  await dialog.expectRowCount(3);
  const creditRow = dialog.row(2);
  await creditRow.expectContains('Gutschrift');
  await creditRow.expectCheckboxDisabled();

  // ACT
  const firstRow = dialog.row(0);
  await firstRow.fillDescription('Edited supermarket');
  await firstRow.fillAmount('19,99');

  // ASSERT
  await dialog.expectSummary(/2 ausgewählt.*24,99/);

  // ACT
  await dialog.importExpenses();

  // ASSERT
  await dialog.expectHidden();
  await expenses.expectExpenseCount(2);
  await expenses.expenseCard('Edited supermarket').expectAmount('19,99');
  await expenses.expenseCard('POS Bäckerei').expectAmount('5,00');

  // ACT
  const duplicateDialog = await expenses.openImportDialog();
  await duplicateDialog.uploadStatement(statementFile);

  // ASSERT
  await duplicateDialog.expectDuplicateCount(1);
  await duplicateDialog.expectDuplicateText();
});

test('statement import navigates rows and fields with alt+arrow keys', async ({
  page,
  request,
  app,
}) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Keys ${suffix}`);

  const expenses = new ExpensesPageObject(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const dialog = await expenses.openImportDialog();
  await dialog.selectPayer(alice.name);
  await dialog.uploadStatement(statementFile);

  const firstRow = dialog.row(0);
  const secondRow = dialog.row(1);

  // ACT
  await firstRow.focusCheckbox();
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await firstRow.expectDescriptionFocusedAndSelected();

  // ACT
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await firstRow.expectAmountFocusedAndSelected();

  // ACT
  await dialog.pressKey('Alt+ArrowLeft');

  // ASSERT
  await firstRow.expectDescriptionFocusedAndSelected();

  // ACT
  await dialog.pressKey('Alt+ArrowLeft');

  // ASSERT
  await firstRow.expectCheckboxFocused();

  // ACT
  await dialog.pressKey('Alt+ArrowDown');

  // ASSERT
  await secondRow.expectCheckboxFocused();

  // ACT
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await secondRow.expectDescriptionFocusedAndSelected();

  // ACT
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await secondRow.expectAmountFocusedAndSelected();

  // ACT
  await dialog.pressKey('Alt+ArrowUp');

  // ASSERT
  await firstRow.expectAmountFocusedAndSelected();

  // ACT
  await dialog.pressKey('Alt+ArrowDown');

  // ASSERT
  await secondRow.expectAmountFocusedAndSelected();

  // ACT
  // Row 3 is not importable, so Alt+ArrowDown keeps focus on row 2.
  await dialog.pressKey('Alt+ArrowDown');

  // ASSERT
  await secondRow.expectAmountFocusedAndSelected();

  // ACT
  // Alt+Left/Right must not navigate browser history while the dialog is open.
  const urlBefore = expenses.url();
  await dialog.focusCancel();
  await dialog.pressKey('Alt+ArrowLeft');
  await dialog.pressKey('Alt+ArrowRight');

  // ASSERT
  await dialog.expectVisible();
  await expenses.expectUrl(urlBefore);
});
