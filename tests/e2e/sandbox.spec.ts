import { expect, test } from 'playwright/test';
import { componentCatalog, formComponents } from '../../sandbox/src/lib/component-catalog';
import { SITE_SLOGAN } from '../../src/site-brand';

const readPollingState = async (page: import('playwright/test').Page) => {
  const text = await page.getByLabel('Polling State').locator('pre').innerText();
  return JSON.parse(text) as { pollCount: number; sampleCount?: number; retainedEvents?: number; error: string | null };
};

const expectRightAligned = async (page: import('playwright/test').Page, selector: string) => {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(viewport!.width - box!.x - box!.width).toBeLessThanOrEqual(24);
};

test('unified component index groups forms and displays', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('.sandbox-brand img')).toHaveAttribute('src', '/logo.svg');
  await expect(page.locator('.sandbox-brand__copy small')).toHaveText(SITE_SLOGAN);
  await expect(page.getByTestId('component-index')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Form Elements' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Displays' })).toBeVisible();
  await expect(page.getByRole('link', { name: /DynamicPieAllocationInput/ })).toHaveAttribute('href', '/forms/dynamic-pie-allocation');
  await expect(page.getByRole('link', { name: /RichMarkdownEditor/ })).toHaveAttribute('href', '/forms/rich-markdown-editor');
  await expect(page.getByRole('link', { name: /MonitoringChart/ })).toHaveAttribute('href', '/displays/monitoring-chart');
  await expect(page.getByRole('link', { name: /ProjectActivityChart/ })).toHaveAttribute('href', '/displays/project-activity-chart');
  await expect(page.getByRole('link', { name: /^Button astro form/ })).toHaveAttribute('href', '/forms/button');
  await expect(page.getByRole('link', { name: /DataTable/ })).toHaveAttribute('href', '/displays/data-table');
  await expect(page.getByRole('link', { name: /ProductShell/ })).toHaveAttribute('href', '/displays/product-shell');
  await expect(page.getByRole('heading', { name: 'Shells' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Public' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Deprecated compatibility' })).toBeVisible();
  await expect(page.getByRole('link', { name: /ShellFrame/ })).toHaveAttribute('href', '/displays/shell-frame');
  await expect(page.getByRole('link', { name: /SurfaceTabs/ })).toHaveAttribute('href', '/displays/surface-tabs');
  await expect(page.getByRole('link', { name: /^PublicSingleColumnShell/ })).toHaveAttribute('href', '/displays/public-single-column-shell');
  await expect(page.getByRole('link', { name: /BottomNav/ })).toContainText('deprecated');
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

    if (entry.id === 'password-setup-fields') {
      await page.locator('[data-ts-password-input]').fill('Catalog-Strong-Password-123!');
      await page.locator('[data-ts-confirm-password-input]').fill('Catalog-Strong-Password-123!');
      await expect(page.getByText('Passwords match.')).toBeVisible();
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

test('new shell registry previews expose responsive shell primitives', async ({ page }) => {
  await page.goto('/displays/shell-frame');
  await expect(page.locator('.ts-shell-header')).toBeVisible();
  await expect(page.locator('.ts-shell-brand__tag')).toHaveText(SITE_SLOGAN);
  await expect(page.locator('.ts-team-operations')).toBeVisible();
  await expect(page.locator('.ts-control-surface')).toBeVisible();
  await expectRightAligned(page, '.ts-shell-header__actions');

  await page.goto('/displays/auth-shell');
  await expect(page.locator('.auth-brand__tag')).toHaveText(SITE_SLOGAN);
  await expectRightAligned(page, '.auth-shell-bar > .ts-site-user-controls');

  await page.goto('/displays/public-single-column-shell');
  await expect(page.locator('.ts-public-single-shell')).toBeVisible();
  await expect(page.locator('.ts-public-profile-header')).toBeVisible();
  await expect(page.locator('.ts-public-section').first()).toBeVisible();

  await page.goto('/displays/team-operations-drawer');
  await page.getByRole('button', { name: 'Open drawer' }).click();
  await expect(page.getByRole('dialog', { name: 'Team operations' })).toBeVisible();

  await page.goto('/displays/surface-tabs');
  const panelTabs = page.getByRole('tablist', { name: 'Panel tabs' });
  await expect(panelTabs.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'true');
  await panelTabs.getByRole('tab', { name: /Overview/ }).press('ArrowRight');
  await expect(panelTabs.getByRole('tab', { name: /Activity/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Activity content.')).toBeVisible();
});

test('settings template places routed tabs above active content on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/displays/settings-template');
  const tabs = page.getByRole('navigation', { name: 'Settings sections' });
  const body = page.locator('.ts-template--settings .ts-template__body');
  const tabsBox = await tabs.boundingBox();
  const bodyBox = await body.boundingBox();
  expect(tabsBox).not.toBeNull();
  expect(bodyBox).not.toBeNull();
  expect(tabsBox!.y + tabsBox!.height).toBeLessThanOrEqual(bodyBox!.y);
  expect(Math.abs(tabsBox!.x - bodyBox!.x)).toBeLessThanOrEqual(1);
  await expect(tabs.getByRole('link', { name: 'General' })).toHaveAttribute('aria-current', 'page');
});

test('account forms use aligned intentional groups with spaced panels', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/displays/account-identity-settings');

  const panels = page.locator('[data-scene="account-identity"] > .ts-panel');
  await expect(panels).toHaveCount(4);
  const panelGaps = await panels.evaluateAll((elements) => elements.slice(1).map((element, index) => {
    const previous = elements[index].getBoundingClientRect();
    const current = element.getBoundingClientRect();
    return current.top - previous.bottom;
  }));
  for (const gap of panelGaps) expect(gap).toBeGreaterThanOrEqual(15);

  for (const groupName of ['name', 'public-profile']) {
    const form = page.locator('[data-scene="account-identity"] .account-form').first();
    const fields = page.locator(`[data-account-field-group="${groupName}"] > .ts-field`);
    const controls = fields.locator('.ts-control');
    const formBox = await form.boundingBox();
    const boxes = await controls.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, left: box.left, right: box.right, bottom: box.bottom };
    }));
    expect(formBox).not.toBeNull();
    expect(boxes).toHaveLength(2);
    expect(boxes[0].left - formBox!.x).toBeGreaterThanOrEqual(8);
    expect(formBox!.x + formBox!.width - boxes[1].right).toBeGreaterThanOrEqual(8);
    expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThanOrEqual(1);
    expect(boxes[1].left - boxes[0].right).toBeGreaterThanOrEqual(20);
  }

  for (const component of [
    'account-deletion-panel',
    'notification-preference-panel',
    'personal-theme-manager',
    'session-manager',
  ]) {
    await page.goto(`/displays/${component}`);
    await expect(page.locator('.catalog-preview__stage').locator('.account-stack').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, component).toBeLessThanOrEqual(1);
  }

  await page.goto('/displays/personal-theme-manager');
  await page.locator('.account-disclosure').first().click();
  await expect(page.locator('.account-color-grid').first().locator('.ts-field')).toHaveCount(4);

  await page.goto('/displays/account-identity-settings');
  await page.locator('#accountPassword').fill('TreeSeedReviewPass123!');
  await expect(page.locator('.account-password-setup [data-ts-password-meter-status]')).toHaveText('Strong');
  await page.locator('#accountPasswordConfirmation').fill('TreeSeedReviewMismatch123!');
  await expect(page.locator('.account-password-setup [data-ts-password-match-status]')).toHaveText('Passwords do not match.');
  await page.locator('#accountPasswordConfirmation').fill('TreeSeedReviewPass123!');
  await expect(page.locator('.account-password-setup [data-ts-password-match-status]')).toHaveText('Passwords match.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/displays/account-identity-settings');
  for (const groupName of ['name', 'public-profile']) {
    const fields = page.locator(`[data-account-field-group="${groupName}"] > .ts-field`);
    const boxes = await fields.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right };
    }));
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
    expect(Math.abs(boxes[0].left - boxes[1].left)).toBeLessThanOrEqual(1);
  }
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(mobileOverflow).toBeLessThanOrEqual(1);
});

test('team operation account links and form actions share a control height', async ({ page }) => {
  await page.goto('/displays/team-operations-panel');
  const accountBox = await page.getByRole('link', { name: 'Account' }).boundingBox();
  const signOut = page.getByRole('button', { name: 'Sign out' });
  const signOutBox = await signOut.boundingBox();
  const signOutIconBox = await signOut.locator('.ts-shell-icon').boundingBox();
  expect(accountBox).not.toBeNull();
  expect(signOutBox).not.toBeNull();
  expect(signOutIconBox).not.toBeNull();
  expect(signOutBox!.height).toBe(accountBox!.height);
  expect(Math.abs(signOutIconBox!.x + signOutIconBox!.width / 2 - (signOutBox!.x + signOutBox!.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(signOutIconBox!.y + signOutIconBox!.height / 2 - (signOutBox!.y + signOutBox!.height / 2))).toBeLessThanOrEqual(1);

  await page.goto('/displays/product-shell');
  const operations = page.locator('.ts-product-shell__desktop-operations');
  await operations.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect.poll(async () => (await operations.locator('.ts-team-operations').boundingBox())?.width).toBe(68);
  const collapsedAccountBox = await operations.getByRole('link', { name: 'Account' }).boundingBox();
  const collapsedSignOut = operations.getByRole('button', { name: 'Sign out' });
  const collapsedSignOutBox = await collapsedSignOut.boundingBox();
  const collapsedSignOutIconBox = await collapsedSignOut.locator('.ts-shell-icon').boundingBox();
  expect(collapsedAccountBox).not.toBeNull();
  expect(collapsedSignOutBox).not.toBeNull();
  expect(collapsedSignOutIconBox).not.toBeNull();
  expect(collapsedSignOutBox!.width).toBe(collapsedAccountBox!.width);
  expect(collapsedSignOutBox!.height).toBe(collapsedAccountBox!.height);
  expect(Math.abs(collapsedSignOutIconBox!.x + collapsedSignOutIconBox!.width / 2 - (collapsedSignOutBox!.x + collapsedSignOutBox!.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(collapsedSignOutIconBox!.y + collapsedSignOutIconBox!.height / 2 - (collapsedSignOutBox!.y + collapsedSignOutBox!.height / 2))).toBeLessThanOrEqual(1);
});

test('app layout has one heading and a stable collapsible icon rail', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/displays/app-layout');

  await expect(page.locator('[data-page-header-owner="content"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'AppLayout' })).toHaveCount(1);
  await expect(page.locator('.ts-control-surface > .ts-control-surface__header h1')).toHaveCount(0);

  const desktopOperations = page.locator('.ts-product-shell__desktop-operations');
  const rail = desktopOperations.locator('.ts-team-operations');
  const railBox = await rail.boundingBox();
  expect(railBox).not.toBeNull();
  expect(railBox!.x).toBe(0);
  expect(Math.abs(railBox!.y + railBox!.height - 900)).toBeLessThanOrEqual(1);
  const footerBox = await desktopOperations.locator('.ts-team-operations__footer').boundingBox();
  const signOutBox = await desktopOperations.getByRole('link', { name: 'Sign out' }).boundingBox();
  expect(footerBox).not.toBeNull();
  expect(signOutBox).not.toBeNull();
  expect(footerBox!.y).toBeGreaterThan(railBox!.y + railBox!.height / 2);
  expect(signOutBox!.y + signOutBox!.height).toBeLessThanOrEqual(900);

  await expect(rail).toHaveCSS('border-radius', '0px');
  await expect(page.locator('.ts-control').first()).toHaveCSS('border-radius', '0px');
  await expect(desktopOperations.locator('.ts-team-operations__link[aria-current="page"]')).toHaveCSS('border-radius', '6px');
  await expect(page.locator('.ts-button').first()).toHaveCSS('border-radius', '6px');
  await expect(page.locator('.ts-panel').first()).toHaveCSS('border-radius', '6px');
  await expect(desktopOperations.locator('.ts-team-operations__link .ts-shell-icon')).toHaveCount(6);
  await expect(desktopOperations.getByRole('link', { name: 'Manage teams' })).toHaveAttribute('title', 'Manage teams');

  const currentLink = desktopOperations.locator('.ts-team-operations__link[aria-current="page"]');
  const linkPadding = await currentLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { top: styles.paddingTop, bottom: styles.paddingBottom };
  });
  expect(linkPadding.top).toBe(linkPadding.bottom);

  const header = page.locator('.ts-product-shell__header');
  const initialHeaderBox = await header.boundingBox();
  expect(initialHeaderBox).not.toBeNull();
  expect(initialHeaderBox!.y).toBe(0);
  await page.locator('.ts-control-surface__body').evaluate((element) => {
    (element as HTMLElement).style.minHeight = '1400px';
  });
  await page.evaluate(() => window.scrollTo(0, 420));
  const scrolledHeaderBox = await header.boundingBox();
  expect(scrolledHeaderBox).not.toBeNull();
  expect(scrolledHeaderBox!.y).toBe(0);
  expect(scrolledHeaderBox!.height).toBe(initialHeaderBox!.height);

  const collapse = desktopOperations.locator('[data-ts-app-sidebar-toggle]');
  await expect(collapse).toHaveAccessibleName('Collapse sidebar');
  await collapse.click();
  await expect(page.locator('html')).toHaveAttribute('data-ts-app-sidebar', 'collapsed');
  await expect(collapse).toHaveAccessibleName('Expand sidebar');
  await expect(desktopOperations.getByRole('combobox', { name: 'Active team' })).toBeHidden();
  await expect(desktopOperations.getByRole('link', { name: 'Manage teams' })).toBeVisible();
  await expect(currentLink.locator('.ts-team-operations__label')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('treeseed.app-sidebar-collapsed'))).toBe('true');
  await expect.poll(async () => (await rail.boundingBox())?.width).toBe(68);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ts-app-sidebar', 'collapsed');
  const expand = desktopOperations.getByRole('button', { name: 'Expand sidebar' });
  await expect(expand).toBeVisible();
  await expand.click();
  await expect(page.locator('html')).toHaveAttribute('data-ts-app-sidebar', 'expanded');

  await page.setViewportSize({ width: 1280, height: 600 });
  await page.reload();
  const shortViewportSignOut = desktopOperations.getByRole('link', { name: 'Sign out' });
  await expect(shortViewportSignOut).toBeVisible();
  const shortViewportSignOutBox = await shortViewportSignOut.boundingBox();
  expect(shortViewportSignOutBox).not.toBeNull();
  expect(shortViewportSignOutBox!.y + shortViewportSignOutBox!.height).toBeLessThanOrEqual(600);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('.ts-product-shell__desktop-operations')).toBeHidden();
  await expect(page.locator('.ts-shell-menu-button')).toBeVisible();
  await page.locator('.ts-shell-menu-button').click();
  const drawer = page.getByRole('dialog', { name: 'Team operations' });
  await expect(drawer.getByRole('combobox', { name: 'Active team' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Start' })).toContainText('Start');
  const mobileSiteControls = drawer.locator('.ts-site-user-controls');
  await expect(mobileSiteControls).toHaveCSS('justify-content', 'flex-end');
  await expect(mobileSiteControls.locator('.ts-site-user-controls__nav')).toHaveCSS('justify-content', 'flex-end');
  const siteControlsSpacing = await mobileSiteControls.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      paddingTop: Number.parseFloat(styles.paddingTop),
      paddingBottom: Number.parseFloat(styles.paddingBottom),
    };
  });
  expect(siteControlsSpacing.paddingTop).toBeLessThanOrEqual(4);
  expect(siteControlsSpacing.paddingBottom).toBeLessThanOrEqual(4);
  const mobileSiteControlsBox = await mobileSiteControls.boundingBox();
  expect(mobileSiteControlsBox).not.toBeNull();
  expect(mobileSiteControlsBox!.height).toBeLessThanOrEqual(56);
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(mobileOverflow).toBeLessThanOrEqual(1);
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

  await page.goto('/displays/product-shell');
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
