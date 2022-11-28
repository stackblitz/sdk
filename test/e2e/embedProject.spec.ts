import { test, expect } from '@playwright/test';

test('embedProjectId', async ({ page }) => {
  await page.goto('/test/pages/blank.html');

  await page.evaluate(() => {
    window.StackBlitzSDK.embedProjectId('embed', 'js');
  });

  const iframe = page.locator('iframe');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute('id', 'embed');
  await expect(iframe).toHaveAttribute('src', `/_embed/edit/js?embed=1`);
});
