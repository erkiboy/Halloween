import { expect, test, type Page } from '@playwright/test';

const names = [
  'Moaning Myrtle',
  'Hash-Slinging Slasher',
  'Hui Buh',
  'Freddy',
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('completes the fixed five-ghost route', async ({ page }) => {
  await page.getByRole('button', { name: 'Start the hunt' }).click();

  for (const [index, name] of names.entries()) {
    await page
      .getByRole('button', { name: 'Target located' })
      .click();
    await capture(page, name);
    if (index < names.length - 1) {
      await expect(
        page.getByRole('heading', { name: 'Encoded case note' }),
      ).toBeVisible();
    }
  }

  await expect(
    page.getByText('Mission complete: All five ghosts captured.'),
  ).toBeVisible();
  await expect(
    page.getByText(/Show this screen at Office Management/),
  ).toBeVisible();
});

test('restores progress after reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Start the hunt' }).click();
  await page.reload();

  await expect(page.getByText(/language without legs/)).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
});

test('rejects another station answer without progress', async ({ page }) => {
  await page.getByRole('button', { name: 'Start the hunt' }).click();
  await page
    .getByRole('button', { name: 'Target located' })
    .click();
  await capture(page, 'Hui Buh');

  await expect(page.getByRole('alert')).toContainText('Ghost escaped');
  await expect(page.getByLabel('Ghost name')).toBeVisible();
  await expect(page.getByText(/language without legs/)).toHaveCount(0);
});

test('shows the custom message for an empty answer', async ({ page }) => {
  await page.getByRole('button', { name: 'Start the hunt' }).click();
  await page
    .getByRole('button', { name: 'Target located' })
    .click();
  await page.getByRole('button', { name: 'Seal target' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Enter the ghost name.',
  );
});

test('supports keyboard submission', async ({ page }) => {
  await page.getByRole('button', { name: 'Start the hunt' }).press('Enter');
  await page
    .getByRole('button', { name: 'Target located' })
    .press('Enter');
  await page.getByLabel('Ghost name').fill('Moaning Myrtle');
  await page.getByLabel('Ghost name').press('Enter');

  await expect(page.getByText(/Three signs announce him/)).toBeVisible();
});

test('requires confirmation before reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Start the hunt' }).click();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset case file' }).click();
  await expect(page.getByText(/language without legs/)).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset case file' }).click();
  await expect(
    page.getByRole('button', { name: 'Start the hunt' }),
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
  await page.getByRole('button', { name: 'Start the hunt' }).click();
  await page
    .getByRole('button', { name: 'Target located' })
    .click();

  const input = page.getByLabel('Ghost name');
  const submit = page.getByRole('button', { name: 'Seal target' });
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
  await page.getByRole('button', { name: 'Start the hunt' }).click();
  await page
    .getByRole('button', { name: 'Target located' })
    .click();
  await capture(page, 'Moaning Myrtle');
  await expect(page.getByText(/Three signs announce him/)).toBeVisible();
});

async function capture(page: Page, name: string): Promise<void> {
  await page.getByLabel('Ghost name').fill(name);
  await page.getByRole('button', { name: 'Seal target' }).click();
}
