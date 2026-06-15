import { test, expect } from '@playwright/test';

test.describe('QR Generator Render Tests', () => {
  test('homepage renders the SPA shell without startup errors', async ({ page }) => {
    const startupErrors: string[] = [];

    page.on('pageerror', (error) => {
      startupErrors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        startupErrors.push(msg.text());
      }
    });

    await page.goto('/');

    await expect(page.locator('#app > .app')).toBeVisible();
    await expect(page.locator('.header__title')).toHaveText('QR Generator');
    await expect(page.getByLabel('Contenido del QR')).toBeVisible();
    await expect(page.locator('.qr-preview__placeholder')).toContainText('Ingresa contenido para generar un código QR');
    await expect(page.locator('#error-log')).toBeEmpty();

    expect(startupErrors).toEqual([]);
  });

  test('QR code updates when input changes', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel('Contenido del QR');
    await expect(input).toBeVisible();

    await input.fill('https://example.com');

    await expect(page.locator('.qr-preview__placeholder')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /PNG/i })).toBeEnabled();
    await expect(page.getByRole('button', { name: /SVG/i })).toBeEnabled();
  });

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});
