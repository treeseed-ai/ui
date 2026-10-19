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

test('Atlas keeps a long assignment selection contained across viewport widths', async ({ page }) => {
  await page.route('**/api/atlas/detail/assignment/**', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      payload: {
        title: 'Long assignment detail',
        status: 'running',
        summary: { description: 'Assignment detail for responsive inspection', health: 'ready' },
        data: { name: 'Long assignment', status: 'running' },
        related: [],
        activity: [],
      },
    }),
  }));

  const scope = '?project=project-demo&workday=workday-demo&date=2026-10-18';
  const assignmentId = 'assignment_01J9Q8M7K6V5T4R3S2P1N0M9L8';
  const widths = [315, 390, 1280];

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/displays/agent-atlas-workspace${scope}`);
  const originalUrl = new URL(page.url());
  await page.goto(
    `/displays/agent-atlas-workspace${scope}&inspect=assignment~${assignmentId}`,
  );

  const overlay = page.getByRole('dialog', { name: 'assignment detail' });
  await expect(overlay).toBeVisible();
  await expect(overlay.locator('code').filter({ hasText: assignmentId })).toHaveText(assignmentId);
  await expect(page.getByRole('heading', { name: 'Long assignment detail' })).toBeVisible();

  const discuss = overlay.getByRole('button', { name: 'Discuss' });
  const close = overlay.getByRole('button', { name: 'Close detail' });

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth;
      const rect = (element: Element) => {
        const { left, right } = element.getBoundingClientRect();
        return { left, right };
      };
      const overlayNode = document.querySelector('[role="dialog"]');
      const header = overlayNode?.querySelector('header');
      return {
        viewport,
        pageWidth: document.documentElement.scrollWidth,
        overlay: overlayNode ? rect(overlayNode) : null,
        header: header ? rect(header) : null,
      };
    });
    expect(geometry.pageWidth - geometry.viewport, `${width}px page overflow`).toBeLessThanOrEqual(1);
    expect(geometry.overlay, 'overlay should exist').not.toBeNull();
    expect(geometry.header, 'overlay header should exist').not.toBeNull();
    expect(geometry.overlay!.left, `${width}px overlay left`).toBeGreaterThanOrEqual(-1);
    expect(geometry.overlay!.right, `${width}px overlay right`).toBeLessThanOrEqual(geometry.viewport + 1);
    expect(geometry.header!.left, `${width}px header left`).toBeGreaterThanOrEqual(-1);
    expect(geometry.header!.right, `${width}px header right`).toBeLessThanOrEqual(geometry.viewport + 1);

    for (const control of [discuss, close]) {
      await expect(control).toBeVisible();
      const rect = await control.boundingBox();
      expect(rect, 'control should have a bounding box').not.toBeNull();
      expect(rect!.x, `${width}px control left`).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width, `${width}px control right`).toBeLessThanOrEqual(width);
    }
  }

  const discussionOpen = page.evaluate(() => new Promise<void>((resolve) => {
    document.addEventListener(
      'treeseed:discussion-open',
      () => resolve(),
      { once: true },
    );
  }));
  await discuss.click();
  await discussionOpen;

  await expect(overlay).toBeVisible();
  await close.click();
  await expect(overlay).toBeHidden();

  const restoredUrl = new URL(page.url());
  for (const key of ['project', 'workday', 'date']) {
    expect(restoredUrl.searchParams.get(key), `${key} scope preserved`).toBe(originalUrl.searchParams.get(key));
  }
  expect(restoredUrl.searchParams.has('inspect')).toBe(false);
});

test('Atlas keeps the selected agent inspector beside a useful canvas area', async ({ page }) => {
  await page.route('**/api/atlas/detail/agent/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ payload: {
      title: 'UI builder',
      status: 'running',
      summary: { description: 'Building shared surfaces', health: 'ready' },
      data: { name: 'UI builder', class: 'interactive', activity: 'running' },
      related: [{ id: 'project-demo', kind: 'project', name: 'Platform' }],
      activity: [{ id: 'event-demo', summary: 'Shared UI workflow rendered' }],
    } }),
  }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/displays/agent-atlas-workspace');
  await page.getByRole('button', { name: 'UI builder, engineering, running' }).click();

  const dialog = page.getByRole('dialog', { name: 'agent detail' });
  await expect(dialog.getByRole('heading', { name: 'UI builder' })).toBeVisible();
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const { left, right, top, bottom, width, height } = node.getBoundingClientRect();
      return { left, right, top, bottom, width, height };
    };
    return {
      workspace: rect('.ts-atlas-workspace'),
      canvas: rect('.ts-atlas-canvas'),
      dialog: rect('[role="dialog"]'),
    };
  });
  expect(geometry.workspace).not.toBeNull();
  expect(geometry.canvas).not.toBeNull();
  expect(geometry.dialog).not.toBeNull();
  expect(geometry.canvas!.height, 'canvas must fit the desktop workspace').toBeLessThanOrEqual(600);
  expect(geometry.dialog!.right, 'inspector aligns to workspace right edge')
    .toBeCloseTo(geometry.workspace!.right, 0);
  expect(geometry.dialog!.width / geometry.workspace!.width, 'inspector uses at most 45% of workspace')
    .toBeLessThanOrEqual(0.45);
  expect(geometry.dialog!.left - geometry.canvas!.left, 'canvas retains uncovered space on the left')
    .toBeGreaterThan(100);
});

test('Atlas places event and assignment docks below the desktop canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/displays/agent-atlas-workspace');

  const geometry = await page.evaluate(() => {
    const canvas = document.querySelector('.ts-atlas-canvas');
    const docks = document.querySelector('.ts-atlas-docks');
    if (!canvas || !docks) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const dockRect = docks.getBoundingClientRect();
    return { canvasBottom: canvasRect.bottom, dockTop: dockRect.top };
  });
  expect(geometry, 'canvas and dock should exist').not.toBeNull();
  expect(geometry!.dockTop, 'event/assignment dock belongs below canvas')
    .toBeGreaterThanOrEqual(geometry!.canvasBottom - 1);
});


test('Atlas keeps playback in the remaining desktop viewport beneath its existing page header',async({page})=>{
 await page.setViewportSize({width:1280,height:900});
 await page.goto('/displays/agent-atlas-workspace');
 const geometry=await page.locator('.ts-agent-atlas').evaluate(node=>{
  const root=node.getBoundingClientRect(),playback=node.querySelector('.ts-atlas-playback')!.getBoundingClientRect();
  return {top:root.top,bottom:playback.bottom,height:window.innerHeight,playbackHeight:playback.height};
 });
 expect(geometry.top).toBeGreaterThan(0);
 expect(geometry.bottom).toBeLessThanOrEqual(geometry.height+1);
 expect(geometry.playbackHeight).toBeLessThan(80);
});
