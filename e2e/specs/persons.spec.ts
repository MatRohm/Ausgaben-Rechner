import { test } from '../fixtures';
import { PersonsPage } from '../pages/PersonsPage';
import { uniqueSuffix } from '../support';

test('persons can be added, renamed, and removed', async ({ page, app }) => {
  const suffix = uniqueSuffix();
  const alice = `Alice ${suffix}`;
  const bob = `Bob ${suffix}`;
  const aliceRenamed = `Alice renamed ${suffix}`;

  const persons = new PersonsPage(page, app.baseUrl);
  persons.acceptBrowserDialogs();
  await persons.open();
  await persons.expectHeading();

  await persons.add(alice);
  await persons.person(alice).expectVisible();

  await persons.add(bob);
  await persons.person(bob).expectVisible();

  await persons.person(alice).rename(aliceRenamed);
  await persons.person(aliceRenamed).expectVisible();

  await persons.person(bob).remove();
  await persons.expectPersonCount(bob, 0);
});
