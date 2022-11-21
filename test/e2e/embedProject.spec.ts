import { test, expect } from '@playwright/test';

test('embedProjectId', async ({ page }) => {
  await page.goto('/blank/');
  await page.waitForLoadState('load');

  await page.evaluate(() => {
    const sdk: StackBlitzSDK = (window as any).StackBlitzSDK;
    if (!sdk) {
      throw new Error('StackBlitzSDK is not defined');
    }
    (window as any).__vm__ = sdk.embedProjectId('embed', 'js');
  });

  const iframe = page.locator('iframe');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute('id', 'embed');
  await expect(iframe).toHaveAttribute('src', `/_embed/edit/js?embed=1`);
});
