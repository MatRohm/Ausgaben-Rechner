import { test } from '../fixtures';
import { PersonsPageObject } from '../pages/PersonsPageObject';
import { uniqueSuffix } from '../support';

test('persons can be added, renamed, and removed', async ({ page, app }) => {
  // ARRANGE
  const suffix = uniqueSuffix();
  const alice = `Alice ${suffix}`;
  const bob = `Bob ${suffix}`;
  const aliceRenamed = `Alice renamed ${suffix}`;

  const persons = new PersonsPageObject(page, app.baseUrl);
  persons.acceptBrowserDialogs();
  await persons.open();
  await persons.expectHeading();

  // ACT
  await persons.add(alice);
  await persons.add(bob);

  // ASSERT
  await persons.person(alice).expectVisible();
  await persons.person(bob).expectVisible();

  // ACT
  await persons.person(alice).rename(aliceRenamed);

  // ASSERT
  await persons.person(aliceRenamed).expectVisible();

  // ACT
  await persons.person(bob).remove();

  // ASSERT
  await persons.expectPersonCount(bob, 0);
});
