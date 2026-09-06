import {test,expect} from '@playwright/test';

test('managed storage needs no setup and the external wizard is compact',async ({page})=>{
  await page.goto('/vault-setup');
  await expect(page.locator('[data-vault-preview]')).toBeHidden();
  await expect(page.getByText('Default',{exact:true})).toBeVisible();
  await expect(page.getByText('Live development preview',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Back to connections'})).toHaveCount(0);
  await page.getByRole('button',{name:'Connect your own vault'}).click();
  await expect(page.locator('[data-vault-backend] option')).toHaveCount(2);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);
  await expect(page.locator('[name="vaultName"]')).toBeFocused();
  await expect(page.locator('[name="vaultEndpoint"]').locator('xpath=ancestor::*[@data-ts-field]').locator('[data-ts-field-error]')).toHaveText('This field is required.');
  expect(await page.locator('[name="vaultEndpoint"]').evaluate(e=>getComputedStyle(e).outlineWidth)).toBe('3px');
  await page.locator('[name="vaultName"]').fill('Company vault');
  await page.locator('[name="vaultEndpoint"]').fill('http://vault.example.com');
  await page.locator('[name="vaultMount"]').fill('secret');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.locator('[name="vaultEndpoint"]')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('[data-wizard-error]')).toBeHidden();
  await page.locator('[name="vaultEndpoint"]').fill('https://vault.example.com');
  expect(parseFloat(await page.locator('[data-vault-step="1"]').evaluate(e=>getComputedStyle(e).rowGap))).toBeLessThanOrEqual(16);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.locator('[data-vault-step="1"]')).toBeHidden();
  await expect(page.locator('[data-vault-step="2"]')).toBeVisible();
  expect((await page.locator('[data-wizard-status]').boundingBox())!.height).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.locator('[name="vaultName"]')).toHaveValue('Company vault');
  for(const width of [1440,820,390]) {
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
