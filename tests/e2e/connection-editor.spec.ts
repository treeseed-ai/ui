import {test,expect} from '@playwright/test';
test('existing connection opens details and every step is clickable without saving',async({page})=>{
  await page.goto('/connection-editor');
  await expect(page.locator('[data-service-step="1"]')).toBeVisible();
  await expect(page.locator('[data-service-step="0"]')).toBeHidden();
  await page.locator('[name="displayName"]').fill('');
  await page.evaluate(()=>{document.querySelector('form')!.addEventListener('submit',e=>{e.preventDefault();document.body.dataset.submitted='true';});});
  for(const step of [2,0,3,1]) {
    await page.locator(`[data-step-target="${step}"]`).click();
    await expect(page.locator(`[data-service-step="${step}"]`)).toBeVisible();
    await expect(page.locator('body')).not.toHaveAttribute('data-submitted','true');
  }
  await expect(page.locator('[name="displayName"]')).toHaveValue('');
});
