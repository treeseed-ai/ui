import {test, expect} from '@playwright/test';

for (const provider of ['github', 'cloudflare', 'railway']) {
  test(provider + ' has one task-first setup form', async ({page}) => {
    await page.goto('/service-setup/' + provider);
    await expect(page.getByRole('heading', {name: '1. Choose what you need'})).toBeVisible();
    await expect(page.locator('input[name="displayName"]')).toHaveCount(1);
    await expect(page.locator('[data-service-tasks]')).toHaveCount(1);
    await expect(page.getByText('Managed OpenBao')).toHaveCount(0);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Continue to connect account'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Help choosing tasks'})).toHaveAttribute('data-ts-help-knowledge-page-id', 'services.capabilities');
    if (provider !== 'github') {
      await expect(page.getByText('Advanced settings (optional)')).toBeVisible();
      await expect(page.locator('select[name="config.deploymentEnvironment"] option')).toHaveCount(3);
    }
  });
}
test('authentication choices follow selected tasks and retain the chosen method', async ({page}) => {
  await page.goto('/service-setup/github');
  const task = page.getByRole('checkbox', {name: 'Read and update repositories'});
  const method = page.locator('select[name="capabilityProfile.repository-hosting"]');
  await expect(method).toBeHidden();
  await task.check();
  await expect(method).toBeVisible();
  await method.selectOption('github-repository-token');
  await task.uncheck();
  await expect(method).toBeHidden();
  await expect(method).toBeDisabled();
  await task.check();
  await expect(method).toHaveValue('github-repository-token');
});
test('setup fits on a phone and retains a readable desktop layout', async ({page}, testInfo) => {
  await page.goto('/service-setup/github');
  await page.getByRole('checkbox', {name: 'Read and update repositories'}).check();
  await page.screenshot({path: testInfo.outputPath('github-setup-desktop.png'), fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  await expect(page.getByRole('button', {name: 'Continue to connect account'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path: testInfo.outputPath('github-setup-mobile.png'), fullPage: true});
});
test('optional Cloudflare settings expand without blocking basic setup', async ({page}) => {
  await page.goto('/service-setup/cloudflare');
  const bucket = page.locator('input[name="config.stateBucket"]');
  await expect(bucket).toBeHidden();
  await page.getByText('Advanced settings (optional)').click();
  await expect(bucket).toBeVisible();
  await expect(bucket).not.toHaveAttribute('required');
});
