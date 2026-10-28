import { expect, test, type Page } from '@playwright/test';

const names = [
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
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();

  for (const [index, name] of names.entries()) {
    await page
      .getByRole('button', { name: 'Ziel vor Ort gefunden' })
      .click();
    await capture(page, name);
    if (index < names.length - 1) {
      await expect(
        page.getByRole('heading', { name: 'Codierte Fallnotiz' }),
      ).toBeVisible();
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
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();
  await page.reload();

  await expect(page.getByText(/Sprache ohne Beine/)).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
});

test('rejects another station answer without progress', async ({ page }) => {
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();
  await page
    .getByRole('button', { name: 'Ziel vor Ort gefunden' })
    .click();
  await capture(page, 'Hui Buh');

  await expect(page.getByRole('alert')).toContainText('Geist entwischt');
  await expect(page.getByLabel('Name des Geistes')).toBeVisible();
  await expect(page.getByText(/Sprache ohne Beine/)).toHaveCount(0);
});

test('shows the custom message for an empty answer', async ({ page }) => {
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();
  await page
    .getByRole('button', { name: 'Ziel vor Ort gefunden' })
    .click();
  await page.getByRole('button', { name: 'Ziel versiegeln' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Gib den Namen des Geistes ein.',
  );
});

test('supports keyboard submission', async ({ page }) => {
  await page.getByRole('button', { name: 'Jagd beginnen' }).press('Enter');
  await page
    .getByRole('button', { name: 'Ziel vor Ort gefunden' })
    .press('Enter');
  await page.getByLabel('Name des Geistes').fill('Maulende Myrte');
  await page.getByLabel('Name des Geistes').press('Enter');

  await expect(page.getByText(/Drei Zeichen kündigen ihn an/)).toBeVisible();
});

test('requires confirmation before reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Akte zurücksetzen' }).click();
  await expect(page.getByText(/Sprache ohne Beine/)).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Akte zurücksetzen' }).click();
  await expect(
    page.getByRole('button', { name: 'Jagd beginnen' }),
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

test('keeps capture controls touch-friendly on mobile', async ({ page }) => {
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  );
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();
  await page
    .getByRole('button', { name: 'Ziel vor Ort gefunden' })
    .click();

  const input = page.getByLabel('Name des Geistes');
  const submit = page.getByRole('button', { name: 'Ziel versiegeln' });
  await expect(input).toHaveAttribute('enterkeyhint', 'done');
  await expect
    .poll(() => input.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))
    .toBeGreaterThanOrEqual(16);
  await expect
    .poll(() => submit.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(48);
});

test('completes a capture with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Jagd beginnen' }).click();
  await page
    .getByRole('button', { name: 'Ziel vor Ort gefunden' })
    .click();
  await capture(page, 'Maulende Myrte');
  await expect(page.getByText(/Drei Zeichen kündigen ihn an/)).toBeVisible();
});

async function capture(page: Page, name: string): Promise<void> {
  await page.getByLabel('Name des Geistes').fill(name);
  await page.getByRole('button', { name: 'Ziel versiegeln' }).click();
}
