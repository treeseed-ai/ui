import { expect, test } from '@playwright/test';
import { componentCatalog } from '../../sandbox/src/lib/component-catalog';

const readPollingState = async (page: import('@playwright/test').Page) => {
  const text = await page.getByLabel('Polling State').locator('pre').innerText();
  return JSON.parse(text) as { pollCount: number; sampleCount?: number; retainedEvents?: number; error: string | null };
};

test('unified component index groups forms and displays', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('.sandbox-brand img')).toHaveAttribute('src', '/logo.svg');
  await expect(page.getByTestId('component-index')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Form Elements' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Displays' })).toBeVisible();
  await expect(page.getByRole('link', { name: /DynamicPieAllocationInput/ })).toHaveAttribute('href', '/forms/dynamic-pie-allocation');
  await expect(page.getByRole('link', { name: /RichMarkdownEditor/ })).toHaveAttribute('href', '/forms/rich-markdown-editor');
  await expect(page.getByRole('link', { name: /MonitoringChart/ })).toHaveAttribute('href', '/displays/monitoring-chart');
  await expect(page.getByRole('link', { name: /ProjectActivityChart/ })).toHaveAttribute('href', '/displays/project-activity-chart');
  await expect(page.getByRole('link', { name: /Button/ })).toHaveAttribute('href', '/forms/button');
  await expect(page.getByRole('link', { name: /DataTable/ })).toHaveAttribute('href', '/displays/data-table');
  await expect(page.getByRole('link', { name: /AppShell/ })).toHaveAttribute('href', '/displays/app-shell');
});

test('all registered component pages render preview and metadata', async ({ page }) => {
  for (const entry of componentCatalog) {
    await page.goto(entry.route);
    await expect(page.locator('body')).not.toContainText('An error occurred.');
    if (entry.intendedSize === 'full-page') {
      await expect(page.locator('h1').filter({ hasText: entry.name }).first()).toBeVisible();
      continue;
    }
    await expect(page.getByTestId('component-page')).toHaveAttribute('data-component', entry.id);
    await expect(page.locator('h1').filter({ hasText: entry.name }).first()).toBeVisible();
    await expect(page.getByLabel(`${entry.name} preview`)).toBeVisible();
    await expect(page.getByLabel(`${entry.name} preview`).locator('.catalog-preview__label')).toContainText('Component frame');
    await expect(page.getByLabel('Configuration Options')).toBeVisible();
    await expect(page.getByLabel('Defaults')).toBeVisible();
  }
});

test('form pages submit on-page without navigation', async ({ page }) => {
  await page.goto('/forms/dynamic-pie-allocation');
  await expect(page.getByTestId('dynamic-pie-allocation')).toHaveAttribute('data-hydrated', 'true');
  await page.getByTestId('slice-input-planning').fill('40');
  await page.getByRole('button', { name: 'Submit allocation' }).click();
  await expect(page).toHaveURL(/\/forms\/dynamic-pie-allocation$/);
  await expect(page.getByLabel('Submission')).toContainText('capacity_allocation');

  await page.goto('/forms/text-input');
  await page.getByLabel('Project').fill('Catalog Test Project');
  await page.getByRole('button', { name: 'Submit project' }).click();
  await expect(page).toHaveURL(/\/forms\/text-input$/);
  await expect(page.getByLabel('Submission')).toContainText('Catalog Test Project');

  await page.goto('/forms/select');
  await page.getByLabel('Environment').selectOption('staging');
  await page.getByRole('button', { name: 'Submit environment' }).click();
  await expect(page).toHaveURL(/\/forms\/select$/);
  await expect(page.getByLabel('Submission')).toContainText('staging');

  await page.goto('/forms/rich-markdown-editor');
  await expect(page.locator('.ts-rich-markdown-field')).toContainText('Build a resilient launch loop', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Submit markdown' }).click();
  await expect(page).toHaveURL(/\/forms\/rich-markdown-editor$/);
  await expect(page.getByLabel('Submission')).toContainText('Build a resilient launch loop');
});

test('catalog JSON data panels use syntax highlighting', async ({ page }) => {
  await page.goto('/forms/text-input');
  await expect(page.locator('.catalog-debug .catalog-json-token--key').first()).toBeVisible();

  await page.getByLabel('Project').fill('Highlighted JSON Project');
  await page.getByRole('button', { name: 'Submit project' }).click();
  await expect(page.getByLabel('Submission').locator('.catalog-json-token--string').first()).toBeVisible();

  await page.goto('/displays/monitoring-chart');
  await expect(page.getByTestId('monitoring-chart')).toBeVisible();
  await expect
    .poll(async () => page.locator('.debug-panel .catalog-json-token--key').count(), { timeout: 5_000 })
    .toBeGreaterThan(0);
});

test('display chart pages poll synthetic realtime endpoints', async ({ page }) => {
  const monitoringResponse = await page.request.post('/api/monitoring/snapshot', {
    data: {
      previous: { timestamp: Date.now(), cpu: 42, memory: 63, latency: 92 },
    },
  });
  expect(monitoringResponse.ok()).toBe(true);

  const activityResponse = await page.request.get('/api/project-activity/events');
  expect(activityResponse.ok()).toBe(true);

  await page.goto('/displays/monitoring-chart');
  await expect(page.getByTestId('monitoring-chart')).toBeVisible();
  await page.getByRole('group', { name: 'Poll interval' }).getByRole('button', { name: '1s' }).click();
  await expect.poll(async () => {
    const state = await readPollingState(page);
    expect(state.error).toBeNull();
    return state.pollCount;
  }, { timeout: 8_000 }).toBeGreaterThanOrEqual(3);

  await page.goto('/displays/project-activity-chart');
  await expect(page.getByTestId('project-activity-chart')).toBeVisible();
  await page.getByRole('group', { name: 'Poll interval' }).getByRole('button', { name: '1s' }).click();
  await expect.poll(async () => {
    const state = await readPollingState(page);
    expect(state.error).toBeNull();
    return state.pollCount;
  }, { timeout: 8_000 }).toBeGreaterThanOrEqual(3);
});

test('theme works on form and display pages without mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await page.goto('/forms/text-input');
  await page.getByLabel('Appearance').click();
  await expect(page.getByLabel('Color scheme')).toContainText('Moss Lab');
  await page.getByLabel('Color scheme').selectOption('moss-lab');
  await page.getByLabel('Theme mode').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-ts-scheme', 'moss-lab');
  await expect(page.locator('html')).toHaveAttribute('data-ts-mode', 'dark');
  let noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);

  await page.goto('/displays/data-table');
  await expect(page.locator('html')).toHaveAttribute('data-ts-scheme', 'moss-lab');
  await expect(page.locator('html')).toHaveAttribute('data-ts-mode', 'dark');
  noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);

  await page.goto('/displays/app-shell');
  await expect(page.locator('html')).toHaveAttribute('data-ts-scheme', 'moss-lab');
  await expect(page.locator('html')).toHaveAttribute('data-ts-mode', 'dark');
  noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);
});

test('old primitives routes are removed', async ({ page }) => {
  const primitives = await page.request.get('/primitives');
  expect(primitives.status()).toBe(404);
  const oldButton = await page.request.get('/primitives/forms/button');
  expect(oldButton.status()).toBe(404);
});
