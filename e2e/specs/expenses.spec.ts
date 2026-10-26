import { test } from '../fixtures';
import { ExpensesPageObject } from '../pages/ExpensesPageObject';
import { SettlementPageObject } from '../pages/SettlementPageObject';
import { createPerson, createSettle, uniqueSuffix } from '../support';

test('expenses can be created with a split, edited, marked paid, and deleted', async ({
  page,
  request,
  app,
}) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Expenses ${suffix}`);

  const expenses = new ExpensesPageObject(page, app.baseUrl);
  expenses.acceptBrowserDialogs();
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const form = await expenses.openNewExpense();
  await form.expectParticipantChecked(alice.name);
  await form.expectParticipantChecked(bob.name);

  // ACT
  await form.fillDescription('Dinner');
  await form.fillAmount('20,00');
  await form.selectPayer(alice.name);
  await form.fillMonth('2026-07');
  await form.uncheckParticipantsExcept([alice.name, bob.name]);
  await form.save();

  // ASSERT
  const card = expenses.expenseCard('Dinner');
  await card.expectVisible();
  await card.expectAmount('20,00');
  await card.expectPayer(alice.name);
  await card.expectMonth('Juli 2026');
  await card.expectSplit([alice.name, bob.name]);

  // ACT
  const editForm = await card.openEdit();

  // ASSERT
  await editForm.expectDescription('Dinner');

  // ACT
  await editForm.fillDescription('Dinner edited');
  await editForm.fillAmount('25,00');
  await editForm.save();

  // ASSERT
  const editedCard = expenses.expenseCard('Dinner edited');
  await editedCard.expectAmount('25,00');

  // ACT
  await editedCard.toggleSettled();

  // ASSERT
  await editedCard.expectPaid();

  // ACT
  await editedCard.remove();

  // ASSERT
  await expenses.expectExpenseCount(0);
});

test('expense participants can have a zero weight', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Zero weight ${suffix}`);

  const expenses = new ExpensesPageObject(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const form = await expenses.openNewExpense();

  // ACT
  await form.fillDescription('Hotel');
  await form.fillAmount('20,00');
  await form.selectPayer(alice.name);
  await form.fillMonth('2026-07');
  await form.uncheckParticipantsExcept([alice.name, bob.name]);
  await form.setWeight(bob.name, '0');
  await form.save();

  // ASSERT
  await expenses.expenseCard('Hotel').expectVisible();

  // ACT
  const settlement = new SettlementPageObject(page, app.baseUrl);
  await settlement.open();
  await settlement.selectSettle(settle.name);

  // ASSERT
  await settlement.balance(alice.name).expectShare('20,00');
  await settlement.balance(bob.name).expectShare('0,00');
});

test('escape closes the expense form and import dialog', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Esc ${suffix}`);

  const expenses = new ExpensesPageObject(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  // ACT
  const form = await expenses.openNewExpense();
  await form.pressEscape();

  // ASSERT
  await form.expectHidden();

  // ACT
  const dialog = await expenses.openImportDialog();
  await dialog.pressKey('Escape');

  // ASSERT
  await dialog.expectHidden();
});
