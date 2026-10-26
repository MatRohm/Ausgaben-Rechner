import { test } from '../fixtures';
import { SettlementPageObject } from '../pages/SettlementPageObject';
import { createExpense, createPerson, createSettle, uniqueSuffix } from '../support';

test('settlement shows balances and the minimal transfer', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Settlement ${suffix}`);
  await createExpense(request, app.baseUrl, {
    description: 'Hotel',
    amountCents: 1_000,
    paidById: alice.id,
    settleId: settle.id,
    participantIds: [alice.id, bob.id],
  });

  const settlement = new SettlementPageObject(page, app.baseUrl);

  // ACT
  await settlement.open();
  await settlement.selectSettle(settle.name);

  // ASSERT
  await settlement.expectBalancesHeading();
  const aliceBalance = settlement.balance(alice.name);
  await aliceBalance.expectBalance(/5,00\s*€/);
  await aliceBalance.expectPaid('10,00');
  await aliceBalance.expectShare('5,00');

  const bobBalance = settlement.balance(bob.name);
  await bobBalance.expectBalance(/-5,00\s*€/);

  const transfer = settlement.transfer(bob.name);
  await transfer.expectFrom(bob.name);
  await transfer.expectTo(alice.name);
  await transfer.expectAmount(/5,00\s*€/);
});
