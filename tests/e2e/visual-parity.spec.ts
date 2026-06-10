import { expect, test, type Page } from '@playwright/test';

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844 };

async function expectNoOverflow(page: Page) {
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);
}

test.describe('market visual parity previews', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
  });

  test('desktop representative component groups match snapshots', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(desktop);

    for (const route of [
      '/displays/auth-card',
      '/displays/plain-table',
      '/displays/deployment-timeline',
      '/displays/sensitive-data-unlock',
      '/displays/product-card',
      '/displays/header',
      '/displays/hero',
      '/displays/app-layout',
      '/displays/data-table',
    ]) {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('An error occurred.');
      await expectNoOverflow(page);
      await expect(page).toHaveScreenshot(`${route.replaceAll('/', '-').slice(1)}-desktop.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test('mobile high-risk component groups match snapshots', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(mobile);

    for (const route of [
      '/displays/auth-shell',
      '/displays/plain-table',
      '/displays/deployment-timeline',
      '/displays/page-frame',
      '/displays/hero',
      '/displays/product-card',
    ]) {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('An error occurred.');
      await expectNoOverflow(page);
      await expect(page).toHaveScreenshot(`${route.replaceAll('/', '-').slice(1)}-mobile.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      });
    }
  });

  test('high-risk components expose original structural styling hooks', async ({ page }) => {
    await page.setViewportSize(desktop);

    await page.goto('/displays/auth-card');
    await expect(page.locator('.auth-card')).toBeVisible();
    await expect(page.locator('.auth-card__brand')).toBeVisible();
    await expect(page.locator('.auth-card__main')).toBeVisible();
    await expect(page.locator('.auth-alert[data-tone="danger"]')).toHaveCSS('display', /block|flex/);

    await page.goto('/displays/plain-table');
    await expect(page.locator('.ts-record-card').first()).toBeVisible();
    await expect(page.locator('.ts-record-card__chips span').first()).toBeVisible();
    await expect(page.locator('.ts-record-card').first()).toHaveCSS('border-radius', /.+/);

    await page.goto('/displays/template-host-requirement-picker');
    await expect(page.locator('[data-requirement-kind="host"]')).toBeVisible();
    await expect(page.locator('.ts-requirement-preview')).toBeVisible();

    await page.goto('/displays/deployment-timeline');
    await expect(page.locator('.ts-deploy-timeline__marker').first()).toBeVisible();
    await expect(page.locator('.ts-deploy-timeline__item').first()).toHaveAttribute('data-tone', /info|success|warning/);

    await page.goto('/displays/operational-timeline');
    await expect(page.locator('.ts-operational-timeline__phase').first()).toBeVisible();
    await expect(page.locator('.ts-operational-timeline__marker').first()).toBeVisible();

    await page.goto('/displays/product-card');
    await expect(page.locator('.market-product-card').first()).toBeVisible();
    await expect(page.locator('.market-product-card__badges').first()).toBeVisible();
    await expect(page.locator('.market-product-card__footer').first()).toBeVisible();

    await page.goto('/displays/page-frame');
    await expect(page.locator('.page')).toBeVisible();
    await expect(page.locator('.header').first()).toBeVisible();
    await expect(page.locator('.sidebar-pane')).toBeVisible();
  });
});
