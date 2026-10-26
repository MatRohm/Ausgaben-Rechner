import { test } from '../fixtures';
import { ExpensesPage } from '../pages/ExpensesPage';
import { SettlementPage } from '../pages/SettlementPage';
import { createPerson, createSettle, uniqueSuffix } from '../support';

test('expenses can be created with a split, edited, marked paid, and deleted', async ({
  page,
  request,
  app,
}) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Expenses ${suffix}`);

  const expenses = new ExpensesPage(page, app.baseUrl);
  expenses.acceptBrowserDialogs();
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const form = await expenses.openNewExpense();
  await form.fillDescription('Dinner');
  await form.fillAmount('20,00');
  await form.selectPayer(alice.name);
  await form.fillMonth('2026-07');
  await form.expectParticipantChecked(alice.name);
  await form.expectParticipantChecked(bob.name);
  await form.uncheckParticipantsExcept([alice.name, bob.name]);
  await form.save();

  const card = expenses.expenseCard('Dinner');
  await card.expectVisible();
  await card.expectAmount('20,00');
  await card.expectPayer(alice.name);
  await card.expectMonth('Juli 2026');
  await card.expectSplit([alice.name, bob.name]);

  const editForm = await card.openEdit();
  await editForm.expectDescription('Dinner');
  await editForm.fillDescription('Dinner edited');
  await editForm.fillAmount('25,00');
  await editForm.save();

  const editedCard = expenses.expenseCard('Dinner edited');
  await editedCard.expectAmount('25,00');

  await editedCard.toggleSettled();
  await editedCard.expectPaid();

  await editedCard.remove();
  await expenses.expectExpenseCount(0);
});

test('expense participants can have a zero weight', async ({ page, request, app }) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Zero weight ${suffix}`);

  const expenses = new ExpensesPage(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const form = await expenses.openNewExpense();
  await form.fillDescription('Hotel');
  await form.fillAmount('20,00');
  await form.selectPayer(alice.name);
  await form.fillMonth('2026-07');
  await form.uncheckParticipantsExcept([alice.name, bob.name]);
  await form.setWeight(bob.name, '0');
  await form.save();

  await expenses.expenseCard('Hotel').expectVisible();

  const settlement = new SettlementPage(page, app.baseUrl);
  await settlement.open();
  await settlement.selectSettle(settle.name);
  await settlement.balance(alice.name).expectShare('20,00');
  await settlement.balance(bob.name).expectShare('0,00');
});

test('escape closes the expense form and import dialog', async ({ page, request, app }) => {
  const suffix = uniqueSuffix();
  await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Esc ${suffix}`);

  const expenses = new ExpensesPage(page, app.baseUrl);
  await expenses.open();
  await expenses.selectSettle(settle.name);

  const form = await expenses.openNewExpense();
  await form.pressEscape();
  await form.expectHidden();

  const dialog = await expenses.openImportDialog();
  await dialog.pressKey('Escape');
  await dialog.expectHidden();
});
