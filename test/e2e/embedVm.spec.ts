import { test, expect } from '@playwright/test';
import type { Project } from '@stackblitz/sdk';

test('vm.getFsSnapshot and vm.applyFsDiff', async ({ page }) => {
  await page.goto('/test/pages/blank.html');

  const project: Project = {
    title: 'Test Project',
    template: 'html',
    files: {
      'index.html': `<h1>Hello World</h1>`,
      'styles.css': `body { color: lime }`,
    },
  };

  // Embed a project and retrieve a snapshot of its files
  const fs1 = await page.evaluate(
    async ([project]) => {
      const vm = await window.StackBlitzSDK.embedProject('embed', project);
      const fs = await vm.getFsSnapshot();
      return fs;
    },
    [project]
  );

  expect(fs1).not.toBe(null);
  expect(fs1).toEqual(project.files);

  // Modify project files using the VM
  await page.evaluate(async () => {
    const vm = await window.StackBlitzSDK.connect(
      document.getElementById('embed') as HTMLIFrameElement
    );
    const currentFs = await vm.getFsSnapshot();
    await vm.applyFsDiff({
      destroy: ['styles.css'],
      create: {
        'index.html': currentFs!['index.html'].replace('World', 'Playwright'),
        'index.js': `console.log('Yo')`,
      },
    });
  });

  // Check that files were modified
  const fs2 = await page.evaluate(async () => {
    const vm = await window.StackBlitzSDK.connect(
      document.getElementById('embed') as HTMLIFrameElement
    );
    return await vm.getFsSnapshot();
  });

  expect(fs2!['styles.css']).toBeUndefined();
  expect(fs2!['index.js']).toContain('console.log');
  expect(fs2!['index.html']).toBe(`<h1>Hello Playwright</h1>`);
});
