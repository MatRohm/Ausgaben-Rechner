import { test } from '../fixtures';
import { SettlesPageObject } from '../pages/SettlesPageObject';
import { uniqueSuffix } from '../support';

test('settles can be created, renamed, closed, reopened, and deleted', async ({ page, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const name = `Trip ${suffix}`;
  const renamed = `Trip renamed ${suffix}`;

  const settles = new SettlesPageObject(page, app.baseUrl);
  settles.acceptBrowserDialogs();
  await settles.open();
  await settles.expectHeading();

  // ACT
  await settles.create(name);

  // ASSERT
  const card = settles.settle(name);
  await card.expectStatus('Offen');

  // ACT
  await card.rename(renamed);

  // ASSERT
  const renamedCard = settles.settle(renamed);
  await renamedCard.expectStatus('Offen');

  // ACT
  await renamedCard.close();

  // ASSERT
  await renamedCard.expectStatus('Abgeschlossen');

  // ACT
  await renamedCard.reopen();

  // ASSERT
  await renamedCard.expectStatus('Offen');

  // ACT
  await renamedCard.remove();

  // ASSERT
  await settles.expectSettleCount(renamed, 0);
});
