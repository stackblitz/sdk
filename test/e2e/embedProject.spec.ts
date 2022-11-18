import { test, expect } from '@playwright/test';

test('embedProjectId', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');

  const origin = await page.evaluate(() => {
    const origin: string = (window as any).TEST_STACKBLITZ_ORIGIN;
    const sdk: StackBlitzSDK = (window as any).StackBlitzSDK;

    if (!origin) {
      throw new Error('TEST_STACKBLITZ_ORIGIN is not defined');
    } else if (!sdk) {
      throw new Error('StackBlitzSDK is not defined');
    }

    (window as any).__vm__ = sdk.embedProjectId('__TEST_CONTAINER__', 'js', { origin });

    return origin;
  });

  const iframe = page.locator('iframe');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute('id', '__TEST_CONTAINER__');
  await expect(iframe).toHaveAttribute('src', `${origin}edit/js?embed=1`);
});
