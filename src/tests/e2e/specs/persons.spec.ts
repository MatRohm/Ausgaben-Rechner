import { test } from '../fixtures';
import { PersonsPageObject } from '../pages/PersonsPageObject';
import { createPerson, uniqueSuffix } from '../support';

test('persons can be added', async ({ page, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = `Alice ${suffix}`;
  const persons = new PersonsPageObject(page, app.baseUrl);
  await persons.open();

  // ACT
  await persons.add(alice);

  // ASSERT
  await persons.person(alice).expectVisible();
});

test('persons can be renamed', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const aliceRenamed = `Alice renamed ${suffix}`;
  const persons = new PersonsPageObject(page, app.baseUrl);
  await persons.open();

  // ACT
  await persons.person(alice.name).rename(aliceRenamed);

  // ASSERT
  await persons.person(aliceRenamed).expectVisible();
});

test('persons can be removed', async ({ page, request, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const persons = new PersonsPageObject(page, app.baseUrl);
  persons.acceptBrowserDialogs();
  await persons.open();

  // ACT
  await persons.person(bob.name).remove();

  // ASSERT
  await persons.expectPersonCount(bob.name, 0);
});
