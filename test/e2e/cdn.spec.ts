import { test, expect } from '@playwright/test';

const expectedMethods = [
  'connect',
  'embedGithubProject',
  'embedProject',
  'embedProjectId',
  'openGithubProject',
  'openProject',
  'openProjectId',
].sort();

test('Loading from CDNs', async ({ page }) => {
  await page.goto('/test/pages/cdn.html');
  await page.waitForLoadState('load');

  const methods = await page.evaluate(() => {
    return {
      unpkg: Object.keys((window as any).sdk_from_unpkg).sort(),
      jsdelivr: Object.keys((window as any).sdk_from_jsdelivr).sort(),
    };
  });

  expect(methods.jsdelivr).toEqual(expectedMethods);
  expect(methods.unpkg).toEqual(expectedMethods);
});
