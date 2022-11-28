import { test, expect } from '@playwright/test';

test('openProjectId can navigate in same tab', async ({ page }) => {
  await page.goto('/test/pages/blank.html');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'commit' }),
    page.evaluate(() => {
      window.StackBlitzSDK.openProjectId('js', {
        clickToLoad: true,
        newWindow: false,
        origin: 'https://example.com',
      });
    }),
  ]);

  expect(page.url()).toBe('https://example.com/edit/js?ctl=1');
});

test('openProjectId can navigate in new tab', async ({ page }) => {
  await page.goto('/test/pages/blank.html');
  const originalUrl = page.url();

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.evaluate(() => {
      window.StackBlitzSDK.openProjectId('js', {
        newWindow: true,
        openFile: 'App.jsx',
        origin: 'https://example.com',
      });
    }),
  ]);

  const newUrl = await popup.evaluate('location.href');

  expect(page.url()).toBe(originalUrl);
  expect(newUrl).toBe('https://example.com/edit/js?file=App.jsx');
});
