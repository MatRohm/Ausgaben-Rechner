import { test } from '../fixtures';
import { SettlesPage } from '../pages/SettlesPage';
import { uniqueSuffix } from '../support';

test('settles can be created, renamed, closed, reopened, and deleted', async ({ page, app }) => {
  const suffix = uniqueSuffix();
  const name = `Trip ${suffix}`;
  const renamed = `Trip renamed ${suffix}`;

  const settles = new SettlesPage(page, app.baseUrl);
  settles.acceptBrowserDialogs();
  await settles.open();
  await settles.expectHeading();

  await settles.create(name);
  const card = settles.settle(name);
  await card.expectStatus('Offen');

  await card.rename(renamed);
  const renamedCard = settles.settle(renamed);
  await renamedCard.expectStatus('Offen');

  await renamedCard.close();
  await renamedCard.expectStatus('Abgeschlossen');

  await renamedCard.reopen();
  await renamedCard.expectStatus('Offen');

  await renamedCard.remove();
  await settles.expectSettleCount(renamed, 0);
});
