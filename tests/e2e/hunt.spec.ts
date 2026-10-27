import { expect, test, type Page } from '@playwright/test';

const names = [
  'king boo',
  'Maulende Myrte',
  'Hackfleisch-hassender Zerhacker',
  'Hui Buh',
  'Freddy',
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('completes the fixed five-ghost route', async ({ page }) => {
  await page.getByRole('button', { name: 'Geisterjagd starten' }).click();

  for (const [index, name] of names.entries()) {
    await capture(page, name);
    if (index < names.length - 1) {
      await expect(
        page.getByRole('heading', { name: 'Wo spukt es als Nächstes?' }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Ich habe den Geist gefunden' })
        .click();
    }
  }

  await expect(
    page.getByText('Mission erfüllt: Alle fünf Geister wurden eingefangen.'),
  ).toBeVisible();
  await expect(
    page.getByText(/Zeig diesen Bildschirm beim Office Management/),
  ).toBeVisible();
});

test('restores progress after reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Geisterjagd starten' }).click();
  await capture(page, 'Buu Huu');
  await page.reload();

  await expect(page.getByText(/Wasser rauscht/)).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
});

test('rejects another station answer without progress', async ({ page }) => {
  await page.getByRole('button', { name: 'Geisterjagd starten' }).click();
  await capture(page, 'Hui Buh');

  await expect(page.getByRole('alert')).toContainText('Geist entwischt');
  await expect(page.getByLabel('Name des Geistes')).toBeVisible();
  await expect(page.getByText(/Wasser rauscht/)).toHaveCount(0);
});

test('shows the custom message for an empty answer', async ({ page }) => {
  await page.getByRole('button', { name: 'Geisterjagd starten' }).click();
  await page.getByRole('button', { name: 'Einsaugen' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Gib den Namen des Geistes ein.',
  );
});

test('supports keyboard submission', async ({ page }) => {
  await page.getByRole('button', { name: 'Geisterjagd starten' }).press('Enter');
  await page.getByLabel('Name des Geistes').fill('König Buu Huu');
  await page.getByLabel('Name des Geistes').press('Enter');

  await expect(page.getByText(/Wasser rauscht/)).toBeVisible();
});

test('requires confirmation before reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Geisterjagd starten' }).click();
  await capture(page, 'King Boo');

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Fortschritt zurücksetzen' }).click();
  await expect(page.getByText(/Wasser rauscht/)).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Fortschritt zurücksetzen' }).click();
  await expect(
    page.getByRole('button', { name: 'Geisterjagd starten' }),
  ).toBeVisible();
});

test('does not overflow a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});

test('completes a capture with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Geisterjagd starten' }).click();
  await capture(page, 'King Boo');
  await expect(page.getByText(/Wasser rauscht/)).toBeVisible();
});

async function capture(page: Page, name: string): Promise<void> {
  await page.getByLabel('Name des Geistes').fill(name);
  await page.getByRole('button', { name: 'Einsaugen' }).click();
}
