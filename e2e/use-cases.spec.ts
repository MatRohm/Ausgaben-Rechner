import path from 'node:path';
import type { Locator } from '@playwright/test';
import { expect, test } from './fixtures';
import {
  acceptDialogs,
  createExpense,
  createPerson,
  createSettle,
  selectSettle,
  uniqueSuffix,
} from './support';

const statementFile = path.join(process.cwd(), 'e2e', 'fixtures', 'statement.json');

async function expectFocusedAndSelected(locator: Locator): Promise<void> {
  await expect(locator).toBeFocused();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const input = element as HTMLInputElement;
        return input.selectionStart === 0 && input.selectionEnd === input.value.length;
      }),
    )
    .toBe(true);
}

test('persons can be added, renamed, and removed', async ({ page, app }) => {
  const suffix = uniqueSuffix();
  const alice = `Alice ${suffix}`;
  const bob = `Bob ${suffix}`;
  const aliceRenamed = `Alice renamed ${suffix}`;

  acceptDialogs(page);

  await page.goto(`${app.baseUrl}/personen`);
  await expect(page.getByRole('heading', { name: 'Personen' })).toBeVisible();

  await page.getByPlaceholder('Name der Person').fill(alice);
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
  const aliceRow = page.locator('.person-row').filter({ hasText: alice });
  await expect(aliceRow).toBeVisible();

  await page.getByPlaceholder('Name der Person').fill(bob);
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
  const bobRow = page.locator('.person-row').filter({ hasText: bob });
  await expect(bobRow).toBeVisible();

  await aliceRow.getByTitle('Umbenennen').click();
  const aliceEditRow = page
    .locator('.person-row')
    .filter({ has: page.locator('.person-edit-input') });
  await aliceEditRow.locator('.person-edit-input').fill(aliceRenamed);
  await aliceEditRow.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.locator('.person-row').filter({ hasText: aliceRenamed })).toBeVisible();

  await page.locator('.person-row').filter({ hasText: bob }).getByTitle('Entfernen').click();
  await expect(page.locator('.person-row').filter({ hasText: bob })).toHaveCount(0);
});

test('settles can be created, renamed, closed, reopened, and deleted', async ({ page, app }) => {
  const suffix = uniqueSuffix();
  const name = `Trip ${suffix}`;
  const renamed = `Trip renamed ${suffix}`;

  acceptDialogs(page);

  await page.goto(`${app.baseUrl}/abrechnungen`);
  await expect(page.getByRole('heading', { name: 'Abrechnungen' })).toBeVisible();

  await page.getByPlaceholder('Name der Abrechnung (z. B. September)').fill(name);
  await page.getByRole('button', { name: 'Neue Abrechnung' }).click();

  const card = page.locator('.settle-card').filter({ hasText: name });
  await expect(card.getByText('Offen', { exact: true })).toBeVisible();

  await card.getByTitle('Umbenennen').click();
  const editCard = page.locator('.settle-card').filter({ has: page.locator('.person-edit-input') });
  await editCard.locator('.person-edit-input').fill(renamed);
  await editCard.getByRole('button', { name: 'Speichern' }).click();

  const renamedCard = page.locator('.settle-card').filter({ hasText: renamed });
  await expect(renamedCard.getByText('Offen', { exact: true })).toBeVisible();

  await renamedCard.getByRole('button', { name: 'Abschließen' }).click();
  await expect(renamedCard.getByText('Abgeschlossen', { exact: true })).toBeVisible();

  await renamedCard.getByRole('button', { name: 'Wieder öffnen' }).click();
  await expect(renamedCard.getByText('Offen', { exact: true })).toBeVisible();

  await renamedCard.getByTitle('Löschen').click();
  await expect(page.locator('.settle-card').filter({ hasText: renamed })).toHaveCount(0);
});

test('expenses can be created with a split, edited, marked paid, and deleted', async ({
  page,
  request,
  app,
}) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Expenses ${suffix}`);

  acceptDialogs(page);

  await page.goto(app.baseUrl);
  await selectSettle(page, settle.name);
  await page.getByRole('button', { name: '+ Neue Ausgabe' }).click();

  const form = page.locator('.expense-form');
  await expect(form.getByRole('heading', { name: 'Neue Ausgabe' })).toBeVisible();
  await form.getByLabel('Beschreibung').fill('Dinner');
  await form.getByLabel('Betrag (€)').fill('20,00');
  await form.getByLabel('Bezahlt von').selectOption({ label: alice.name });
  await form.getByLabel('Monat').fill('2026-07');
  await expect(form.getByRole('checkbox', { name: alice.name })).toBeChecked();
  await expect(form.getByRole('checkbox', { name: bob.name })).toBeChecked();

  const otherParticipants = form
    .locator('.participant-row')
    .filter({ hasNotText: alice.name })
    .filter({ hasNotText: bob.name });
  for (const row of await otherParticipants.all()) {
    const checkbox = row.getByRole('checkbox');
    if (await checkbox.isChecked()) await checkbox.uncheck();
  }

  await form.getByRole('button', { name: 'Speichern', exact: true }).click();

  const card = page.locator('.expense-card').filter({ hasText: 'Dinner' });
  await expect(card).toContainText('20,00');
  await expect(card).toContainText(`${alice.name} hat bezahlt`);
  await expect(card).toContainText('Juli 2026');
  await expect(card).toContainText(`Aufgeteilt auf: ${alice.name}, ${bob.name}`);

  await card.getByTitle('Bearbeiten').click();
  const editForm = page.locator('.expense-form');
  await expect(editForm.getByRole('heading', { name: 'Ausgabe bearbeiten' })).toBeVisible();
  await expect(editForm.getByLabel('Beschreibung')).toHaveValue('Dinner');
  await editForm.getByLabel('Beschreibung').fill('Dinner edited');
  await editForm.getByLabel('Betrag (€)').fill('25,00');
  await editForm.getByRole('button', { name: 'Speichern', exact: true }).click();

  const editedCard = page.locator('.expense-card').filter({ hasText: 'Dinner edited' });
  await expect(editedCard).toContainText('25,00');

  await editedCard.getByRole('button', { name: /Bezahlt/ }).click();
  await expect(editedCard.locator('.badge-paid')).toBeVisible();

  await editedCard.getByTitle('Löschen').click();
  await expect(page.locator('.expense-card').filter({ hasText: 'Dinner edited' })).toHaveCount(0);
});

test('settlement shows balances and the minimal transfer', async ({ page, request, app }) => {
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

  await page.goto(`${app.baseUrl}/ausgleich`);
  await selectSettle(page, settle.name);

  await expect(page.getByRole('heading', { name: 'Kontostände' })).toBeVisible();

  const aliceBalance = page.locator('.balance-row').filter({ hasText: alice.name });
  await expect(aliceBalance.locator('.balance-amount')).toHaveText(/5,00\s*€/);
  await expect(aliceBalance).toContainText('bezahlt 10,00');
  await expect(aliceBalance).toContainText('Anteil 5,00');

  const bobBalance = page.locator('.balance-row').filter({ hasText: bob.name });
  await expect(bobBalance.locator('.balance-amount')).toHaveText(/-5,00\s*€/);

  const transfer = page.locator('.transfer-row').filter({ hasText: bob.name });
  await expect(transfer).toContainText(alice.name);
  await expect(transfer.locator('.transfer-amount')).toHaveText(/5,00\s*€/);
});

test('statement import supports editing the preview and flags duplicates', async ({
  page,
  request,
  app,
}) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const bob = await createPerson(request, app.baseUrl, `Bob ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Import ${suffix}`);

  await page.goto(app.baseUrl);
  await selectSettle(page, settle.name);

  await page.getByRole('button', { name: 'Aus Kontoauszug importieren' }).click();
  const dialog = page.locator('.import-modal');
  await expect(dialog.getByRole('heading', { name: 'Aus Kontoauszug importieren' })).toBeVisible();
  await dialog.getByLabel('Bezahlt von').selectOption({ label: alice.name });
  await expect(dialog.getByRole('checkbox', { name: alice.name })).toBeChecked();
  await expect(dialog.getByRole('checkbox', { name: bob.name })).toBeChecked();
  await dialog.getByLabel('Kontoauszug (JSON)').setInputFiles(statementFile);

  const rows = dialog.locator('.import-row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(2)).toContainText('Gutschrift');
  await expect(rows.nth(2).locator('input[type="checkbox"]')).toBeDisabled();

  await rows.nth(0).getByLabel('Name der Ausgabe').fill('Edited supermarket');
  await rows.nth(0).getByLabel('Betrag').fill('19,99');
  await expect(dialog.getByText(/2 ausgewählt.*24,99/)).toBeVisible();

  await dialog.getByRole('button', { name: '2 Ausgaben importieren' }).click();
  await expect(dialog).toBeHidden();

  const cards = page.locator('.expense-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.filter({ hasText: 'Edited supermarket' })).toContainText('19,99');
  await expect(cards.filter({ hasText: 'POS Bäckerei' })).toContainText('5,00');

  await page.getByRole('button', { name: 'Aus Kontoauszug importieren' }).click();
  const duplicateDialog = page.locator('.import-modal');
  await duplicateDialog.getByLabel('Kontoauszug (JSON)').setInputFiles(statementFile);

  const duplicates = duplicateDialog.locator('.badge-duplicate');
  await expect(duplicates).toHaveCount(1);
  await expect(duplicates).toContainText('Möglicherweise bereits importiert');
});

test('statement import navigates rows and fields with alt+arrow keys', async ({
  page,
  request,
  app,
}) => {
  const suffix = uniqueSuffix();
  const alice = await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Keys ${suffix}`);

  await page.goto(app.baseUrl);
  await selectSettle(page, settle.name);
  await page.getByRole('button', { name: 'Aus Kontoauszug importieren' }).click();

  const dialog = page.locator('.import-modal');
  await dialog.getByLabel('Bezahlt von').selectOption({ label: alice.name });
  await dialog.getByLabel('Kontoauszug (JSON)').setInputFiles(statementFile);

  const rows = dialog.locator('.import-row');
  const firstCheckbox = rows.nth(0).locator('input[type="checkbox"]');
  const firstDescription = rows.nth(0).getByLabel('Name der Ausgabe');
  const firstAmount = rows.nth(0).getByLabel('Betrag');
  const secondCheckbox = rows.nth(1).locator('input[type="checkbox"]');
  const secondDescription = rows.nth(1).getByLabel('Name der Ausgabe');
  const secondAmount = rows.nth(1).getByLabel('Betrag');

  await firstCheckbox.focus();
  await page.keyboard.press('Alt+ArrowRight');
  await expectFocusedAndSelected(firstDescription);

  await page.keyboard.press('Alt+ArrowRight');
  await expectFocusedAndSelected(firstAmount);

  await page.keyboard.press('Alt+ArrowLeft');
  await expectFocusedAndSelected(firstDescription);

  await page.keyboard.press('Alt+ArrowLeft');
  await expect(firstCheckbox).toBeFocused();

  await page.keyboard.press('Alt+ArrowDown');
  await expect(secondCheckbox).toBeFocused();

  await page.keyboard.press('Alt+ArrowRight');
  await expectFocusedAndSelected(secondDescription);

  await page.keyboard.press('Alt+ArrowRight');
  await expectFocusedAndSelected(secondAmount);

  await page.keyboard.press('Alt+ArrowUp');
  await expectFocusedAndSelected(firstAmount);

  await page.keyboard.press('Alt+ArrowDown');
  await expectFocusedAndSelected(secondAmount);

  // Row 3 is not importable, so Alt+ArrowDown keeps focus on row 2.
  await page.keyboard.press('Alt+ArrowDown');
  await expectFocusedAndSelected(secondAmount);

  // Alt+Left/Right must not navigate browser history while the dialog is open.
  const urlBefore = page.url();
  await dialog.getByRole('button', { name: 'Abbrechen' }).focus();
  await page.keyboard.press('Alt+ArrowLeft');
  await page.keyboard.press('Alt+ArrowRight');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(urlBefore);
});

test('escape closes the expense form and import dialog', async ({ page, request, app }) => {
  const suffix = uniqueSuffix();
  await createPerson(request, app.baseUrl, `Alice ${suffix}`);
  const settle = await createSettle(request, app.baseUrl, `Esc ${suffix}`);

  await page.goto(app.baseUrl);
  await selectSettle(page, settle.name);

  await page.getByRole('button', { name: '+ Neue Ausgabe' }).click();
  await expect(page.getByRole('heading', { name: 'Neue Ausgabe' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Neue Ausgabe' })).toBeHidden();

  await page.getByRole('button', { name: 'Aus Kontoauszug importieren' }).click();
  const importDialog = page.locator('.import-modal');
  await expect(
    importDialog.getByRole('heading', { name: 'Aus Kontoauszug importieren' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(importDialog).toBeHidden();
});
