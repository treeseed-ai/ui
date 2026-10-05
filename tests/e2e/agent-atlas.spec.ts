import { expect, test } from 'playwright/test';

test('Atlas fixture preserves its game-like workspace and semantic overlays across breakpoints', async ({ page }) => {
  await page.route('**/api/atlas/detail/agent/**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ payload: { title: 'UI builder', status: 'running', summary: { description: 'Building shared surfaces', health: 'ready' }, data: { name: 'UI builder', class: 'interactive', activity: 'running' }, related: [{ id: 'project-demo', kind: 'project', name: 'Platform' }], activity: [{ id: 'event-demo', summary: 'Shared UI workflow rendered' }] } }) }));
  for (const viewport of [{ width: 1280, height: 900 }, { width: 768, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/displays/agent-atlas-workspace');
    await expect(page.getByRole('application', { name: 'Agent Atlas circuit' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agent Atlas' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'UI builder, engineering, running' })).toBeVisible();
    const geometry = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, viewport: document.documentElement.clientWidth, offenders: [...document.querySelectorAll('*')].map((node) => { const box = node.getBoundingClientRect(); return { tag: node.tagName, className: node.getAttribute('class'), left: box.left, right: box.right, width: box.width, overflow: getComputedStyle(node).overflow }; }).filter((row) => row.right > document.documentElement.clientWidth + 1 || row.left < -1).sort((left, right) => right.right - left.right).slice(0, 10) }));
    expect(geometry.overflow, `${viewport.width}px overflow: ${JSON.stringify(geometry)}`).toBeLessThanOrEqual(1);
  }
  const agent = page.getByRole('button', { name: 'UI builder, engineering, running' });
  await agent.click();
  const overlay = page.getByRole('dialog', { name: 'agent detail' });
  await expect(overlay.getByRole('heading', { name: 'UI builder' })).toBeVisible();
  await expect(overlay.getByRole('button', { name: 'Platform' })).toBeVisible();
  await overlay.getByRole('button', { name: 'Close detail' }).click();
  await expect(agent).toBeFocused();
});

test('Atlas keeps a failed detail selection open and retries in place', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/atlas/detail/agent/**', async (route) => {
    attempts += 1;
    if (attempts === 1) await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    else await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ payload: { title: 'Recovered agent', status: 'ready', summary: { description: 'Recovered without losing context' }, data: {} } }) });
  });
  await page.goto('/displays/agent-atlas-workspace');
  await page.getByRole('button', { name: 'UI builder, engineering, running' }).click();
  await expect(page.getByRole('alert')).toContainText('selection remains open');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('heading', { name: 'Recovered agent' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('Atlas honors reduced motion without weakening its application semantics', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/displays/agent-atlas-workspace');
  const dock = page.locator('.ts-atlas-docks');
  await expect(dock).toBeVisible();
  expect(await dock.evaluate((node) => getComputedStyle(node).transitionDuration)).toBe('0s');
  await expect(page.getByRole('application', { name: 'Agent Atlas circuit' })).toBeVisible();
});

test.describe('Atlas touch input', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('opens and closes a semantic detail surface without covering overflow', async ({ page }) => {
    await page.goto('/displays/agent-atlas-workspace');
    const agent = page.getByRole('button', { name: 'UI builder, engineering, running' });
    await agent.tap();
    await expect(page.getByRole('dialog', { name: 'agent detail' })).toBeVisible();
    await page.getByRole('button', { name: 'Close detail' }).tap();
    await expect(agent).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
});
