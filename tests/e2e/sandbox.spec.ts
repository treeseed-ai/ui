import { expect, test } from '@playwright/test';
import { componentCatalog, formComponents } from '../../sandbox/src/lib/component-catalog';

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
  await expect(page.getByRole('link', { name: /^Button astro form/ })).toHaveAttribute('href', '/forms/button');
  await expect(page.getByRole('link', { name: /DataTable/ })).toHaveAttribute('href', '/displays/data-table');
  await expect(page.getByRole('link', { name: /AppShell/ })).toHaveAttribute('href', '/displays/app-shell');
});

test('all registered component pages render preview and metadata', async ({ page }) => {
  test.setTimeout(90_000);

  for (const entry of componentCatalog) {
    await page.goto(entry.route);
    await expect(page.locator('body')).not.toContainText('An error occurred.');
    await expect(page.locator('body')).not.toContainText('This reusable component is registered in the package and sandbox catalog.');
    if (entry.kind === 'form') {
      await expect(page.getByTestId('component-page')).toHaveAttribute('data-component', entry.id);
      await expect(page.locator('h1').filter({ hasText: entry.name }).first()).toBeVisible();
      await expect(page.getByLabel('Configuration Options')).toBeVisible();
      await expect(page.getByLabel('Defaults')).toBeVisible();
      continue;
    }
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
  test.setTimeout(90_000);

  for (const entry of formComponents) {
    await page.goto(entry.route);
    await expect(page.getByTestId('component-page')).toHaveAttribute('data-component', entry.id);

    if (entry.id === 'dynamic-pie-allocation') {
      await expect(page.getByTestId('dynamic-pie-allocation')).toHaveAttribute('data-hydrated', 'true');
      await page.getByTestId('slice-input-planning').fill('40');
    }

    if (['checkbox-field', 'select-field', 'text-field'].includes(entry.id)) {
      await expect(page.getByTestId('react-form-control')).toHaveAttribute('data-hydrated', 'true');
    }

    if (entry.id === 'text-input') {
      await page.getByLabel('Project').fill('Catalog Test Project');
    }

    if (entry.id === 'select') {
      await page.getByLabel('Environment').selectOption('staging');
    }

    if (entry.id === 'textarea') {
      await page.getByLabel('Notes').fill('Catalog textarea submission');
    }

    if (entry.id === 'rich-markdown-editor') {
      await expect(page.locator('.ts-rich-markdown-field')).toContainText('Build a resilient launch loop', { timeout: 15_000 });
    }

    await page.locator('main').getByRole('button', { name: /^Submit/ }).last().click();
    await expect(page).toHaveURL(new RegExp(`${entry.route}$`));
    await expect(page.getByLabel('Submission').locator('pre')).not.toHaveText('null');
  }
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

test('app control preview pages expose interactive states', async ({ page }) => {
  await page.goto('/displays/content-field-help');
  await page.getByLabel('Help for Title').click();
  await expect(page.locator('[data-content-help][open]')).toBeVisible();
  await expect(page.locator('[data-content-help-panel]')).toContainText('A short, scannable name');

  await page.goto('/displays/template-host-requirement-picker');
  await expect(page.locator('[data-requirement-kind="host"]')).toBeVisible();
  await page.locator('select[name="webHost"]').selectOption('railway-web');
  await expect(page.locator('select[name="webHost"]')).toHaveValue('railway-web');

  await page.goto('/displays/sensitive-data-unlock');
  await page.getByRole('button', { name: 'Unlock sensitive data' }).click();
  await expect(page.getByRole('dialog', { name: 'Unlock encrypted team data' })).toBeVisible();
  await page.locator('input[name="treeseedSensitivePassphrase"]').fill('preview passphrase');
  await page.locator('[data-sensitive-mode="unlock"] button[type="submit"]').click();
  await expect(page.locator('[data-sensitive-unlock-label]')).toContainText('Sensitive data unlocked');
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
