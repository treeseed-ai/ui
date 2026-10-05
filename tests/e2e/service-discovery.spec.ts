import {test, expect} from '@playwright/test';

test('provider picker exposes persistent details and native multi-value filters', async ({page}) => {
  await page.goto('/service-discovery');
  const picker = page.getByRole('group', {name: 'Provider', exact: true});
  await picker.getByRole('radio', {name: 'GitHub', exact: true}).check();
  await expect(page.locator('[data-provider-detail="github"]')).toBeVisible();
  await expect(page.locator('[data-provider-detail="cloudflare"]')).toBeHidden();
  await page.locator('.ts-multi-select summary').click();
  await expect(page.getByRole('checkbox', {name: 'Run workflows', exact: true})).toBeVisible();
  await expect(page.getByRole('checkbox', {name: 'Manage workflow variables and secrets', exact: true})).toHaveCount(0);
  await expect(page.locator('input[value="secret-enclave"]')).toHaveCount(0);
  await page.locator('input[value="repository-hosting"]').check();
  await page.locator('input[value="workflow-execution"]').check();
  await expect(page.locator('[data-selection-count]')).toHaveText('2 selected');
  expect(await page.locator('[data-service-filter]').evaluate(form => new FormData(form as HTMLFormElement).getAll('capability'))).toEqual(['repository-hosting', 'workflow-execution']);
  await picker.getByRole('radio', {name: 'GitHub', exact: true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(picker.getByRole('radio', {name: 'Cloudflare', exact: true})).toBeChecked();
  await expect(page.locator('[data-provider-detail="cloudflare"]')).toBeVisible();
  await page.getByRole('button', {name: 'Apply filters'}).click();
  await expect(page).toHaveURL(/provider=cloudflare.*capability=repository-hosting.*capability=workflow-execution/);
});

for (const width of [1440, 820, 390]) {
  test(`connection discovery is readable at ${width}px`, async ({page}, testInfo) => {
    await page.setViewportSize({width, height: 1000});
    await page.goto('/service-discovery');
    await page.getByRole('radio', {name: 'GitHub', exact: true}).check();
    const controls = await page.locator('.ts-service-filters__controls').boundingBox();
    const details = await page.locator('.ts-service-provider-detail').boundingBox();
    if (width > 960) expect(details!.x).toBeGreaterThan(controls!.x + controls!.width);
    else expect(details!.y).toBeGreaterThan(controls!.y + controls!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByText('Engineering repositories')).toBeVisible();
    await expect(page.getByText('Not available', {exact: true})).toBeVisible();
    await page.screenshot({path: testInfo.outputPath(`service-discovery-${width}.png`), fullPage: true});
  });
}
