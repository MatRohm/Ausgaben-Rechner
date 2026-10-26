import { test } from '../fixtures';
import { SettlesPageObject } from '../pages/SettlesPageObject';
import { closeSettle, createSettle, uniqueSuffix } from '../support';

test('settles can be created', async ({ page, app }) => {
  // ARRANGE
  const name = `Trip ${uniqueSuffix()}`;
  const settles = new SettlesPageObject(page, app.baseUrl);
  await settles.open();

  // ACT
  await settles.create(name);

  // ASSERT
  await settles.settle(name).expectStatus('Offen');
});

test('settles can be renamed', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const settle = await createSettle(request, app.baseUrl, `Trip ${suffix}`);
  const renamed = `Trip renamed ${suffix}`;
  const settles = new SettlesPageObject(page, app.baseUrl);
  await settles.open();

  // ACT
  await settles.settle(settle.name).rename(renamed);

  // ASSERT
  await settles.settle(renamed).expectStatus('Offen');
});

test('settles can be closed', async ({ page, request, app }) => {
  // ARRANGE
  const settle = await createSettle(request, app.baseUrl, `Trip ${uniqueSuffix()}`);
  const settles = new SettlesPageObject(page, app.baseUrl);
  await settles.open();

  // ACT
  await settles.settle(settle.name).close();

  // ASSERT
  await settles.settle(settle.name).expectStatus('Abgeschlossen');
});

test('settles can be reopened', async ({ page, request, app }) => {
  // ARRANGE
  const settle = await createSettle(request, app.baseUrl, `Trip ${uniqueSuffix()}`);
  await closeSettle(request, app.baseUrl, settle.id);
  const settles = new SettlesPageObject(page, app.baseUrl);
  await settles.open();

  // ACT
  await settles.settle(settle.name).reopen();

  // ASSERT
  await settles.settle(settle.name).expectStatus('Offen');
});

test('settles can be deleted', async ({ page, request, app }) => {
  // ARRANGE
  const settle = await createSettle(request, app.baseUrl, `Trip ${uniqueSuffix()}`);
  const settles = new SettlesPageObject(page, app.baseUrl);
  settles.acceptBrowserDialogs();
  await settles.open();

  // ACT
  await settles.settle(settle.name).remove();

  // ASSERT
  await settles.expectSettleCount(settle.name, 0);
});
