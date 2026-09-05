import {test, expect} from '@playwright/test';

for (const provider of ['github', 'cloudflare', 'railway']) {
  test(provider + ' shows only one step, validates and preserves inputs when going back', async ({page}) => {
    await page.goto('/service-setup/' + provider);
    await expect(page.locator('[data-service-step]:visible')).toHaveCount(1);
    await expect(page.getByRole('heading', {name: 'Choose your tasks'})).toBeVisible();
    await expect(page.locator('input[name="displayName"]')).toBeHidden();
    await page.getByRole('button', {name: 'Continue', exact: true}).click();
    await expect(page.getByRole('alert')).toContainText('Choose at least one task');
    await page.locator('[data-service-tasks] input[type=checkbox]').first().check();
    await page.getByRole('button', {name: 'Continue', exact: true}).click();
    await expect(page.getByRole('heading', {name: 'Name your connection'})).toBeFocused();
    await expect(page.locator('[data-service-step]:visible')).toHaveCount(1);
    await expect(page.locator('[data-service-tasks]')).toBeHidden();
    await page.getByRole('button', {name: 'Save and connect account'}).click();
    await expect(page.locator('input[name="displayName"]')).toBeFocused();
    await page.locator('input[name="displayName"]').fill('My connection');
    await page.getByRole('button', {name: 'Back', exact: true}).click();
    await expect(page.locator('[data-service-tasks] input[type=checkbox]').first()).toBeChecked();
    await page.getByRole('button', {name: 'Continue', exact: true}).click();
    await expect(page.locator('input[name="displayName"]')).toHaveValue('My connection');
    await expect(page.getByText('Managed OpenBao')).toHaveCount(0);
  });
}
test('GitHub has one method and a single variables-and-secrets task', async ({page}) => {
  await page.goto('/service-setup/github');
  await expect(page.locator('[data-service-wizard] select')).toHaveCount(1);
  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await page.getByRole('checkbox', {name: 'Manage workflow variables and secrets'}).check();
  await page.locator('select[name="githubAuthMethod"]').selectOption('token');
  await expect(page.locator('select[name^="capabilityProfile."]')).toHaveCount(0);
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  await page.getByRole('button', {name: 'Back', exact: true}).click();
  await expect(page.locator('select[name="githubAuthMethod"]')).toHaveValue('token');
  await expect(page.getByRole('button', {name: 'Help choosing GitHub access'})).toHaveAttribute('data-ts-help-knowledge-page-id', 'provider.github');
});
test('full-width desktop wizard and phone layout', async ({page}, testInfo) => {
  await page.setViewportSize({width: 1440, height: 1000});
  await page.goto('/service-setup/github');
  await page.getByRole('checkbox', {name: 'Read and update repositories'}).check();
  const box = await page.locator('[data-service-wizard]').boundingBox();
  expect(box!.width).toBeGreaterThan(1200);
  await page.screenshot({path: testInfo.outputPath('github-wizard-desktop.png'), fullPage: true});
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  await page.screenshot({path: testInfo.outputPath('github-details-desktop.png'), fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path: testInfo.outputPath('github-details-mobile.png'), fullPage: true});
});
test('Cloudflare has one deliberate advanced disclosure only on its details step', async ({page}) => {
  await page.goto('/service-setup/cloudflare');
  await expect(page.locator('[data-service-wizard] details')).toBeHidden();
  await page.locator('[data-service-tasks] input[type=checkbox]').first().check();
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  const bucket = page.locator('input[name="config.stateBucket"]');
  await expect(bucket).toBeHidden();
  await page.getByText('Advanced settings (optional)').click();
  await expect(bucket).toBeVisible();
  await expect(bucket).not.toHaveAttribute('required');
});
