import { test, expect } from '@playwright/test';

test('embedProjectId', async ({ page }) => {
  await page.goto('/test/pages/blank.html');

  await page.evaluate(() => {
    window.StackBlitzSDK.embedProjectId('embed', 'js');
  });

  const iframe = page.locator('iframe');
  expect(iframe).toBeVisible();
  expect(iframe).toHaveAttribute('id', 'embed');
  expect(await iframe.getAttribute('src')).toContain('/edit/js?embed=1');
});
