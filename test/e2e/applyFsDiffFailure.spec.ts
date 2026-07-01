import { test, expect } from '@playwright/test';
import type { Project } from '@stackblitz/sdk';

test('vm.getFsSnapshot and failing vm.applyFsDiff', async ({ page }) => {
    await page.goto('/test/pages/blank.html');

    const project: Project = {
        title: 'Test Project',
        template: 'html',
        files: {
            'index.html': `<h1>Hello World</h1>`,
            'styles.css': `body { color: lime }`,
        },
    };

    // Embed a project, retrieve a snapshot of its files, and execute applyFsDiff, which fails within the embed
    const err = await page.evaluate(
        async ([project]) => {
            const vm = await window.StackBlitzSDK.embedProject('embed', project);
            await vm.getFsSnapshot();
            await window.testSDK.makeRequestFail('SDK_APPLY_FS_DIFF');
            try{
                await vm.applyFsDiff({create: {'index.html': '<h2>Hello world</h2>'}, destroy: []})
                return {error: false};
            }catch(e){
                return {error: true}
            }
        },
        [project]
    );
    
    // Expect the Promise from applyFsDiff to have been rejected
    expect(err).toEqual({error: true})
})