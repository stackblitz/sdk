import { describe, expect, test } from 'vitest';

import type { Project, FsDiff } from '$src/index';
import { VM } from '$src/vm';
import { getRequestHandler } from '$test/server/request';
import { getTestProject } from '$test/unit/utils/project';

async function getVm(project: Project, { delay = 0 }: { delay?: number } = {}) {
  const channel = new MessageChannel();
  const handleRequest = getRequestHandler(project);

  channel.port2.onmessage = function (event) {
    const response = handleRequest(event.data);
    setTimeout(() => this.postMessage(response), delay);
  };

  return new VM(channel.port1, {
    previewOrigin: project.template === 'node' ? undefined : 'https://test.stackblitz.io',
  });
}

describe('vm.getFsSnapshot', () => {
  test('returns null with no files', async () => {
    const files: Project['files'] = {};
    const vm = await getVm(getTestProject({ files }));

    await expect(vm.getFsSnapshot()).resolves.toBe(null);
  });

  test('returns files', async () => {
    const files: Project['files'] = { a: 'aaaa', b: 'bbbb' };
    const vm = await getVm(getTestProject({ files }));

    await expect(vm.getFsSnapshot()).resolves.toEqual(files);
  });
});

describe('vm.applyFsDiff', () => {
  test('throws on invalid diff', async () => {
    const vm = await getVm(getTestProject());

    expect(() => vm.applyFsDiff(null as any)).toThrowError(
      'Invalid diff object: expected diff.create to be an object.'
    );

    expect(() => vm.applyFsDiff({ destroy: [] } as any)).toThrowError(
      'Invalid diff object: expected diff.create to be an object.'
    );

    expect(() => vm.applyFsDiff({ create: {} } as any)).toThrowError(
      'Invalid diff object: expected diff.destroy to be an array.'
    );
  });

  test('can add a file', async () => {
    const files: Project['files'] = {
      'index.js': 'Console.warn("Hello world!")',
    };
    const diff: FsDiff = {
      create: {
        'new.js': '/* Hello */',
      },
      destroy: [],
    };

    const vm = await getVm(getTestProject({ files }));
    await expect(vm.applyFsDiff(diff)).resolves.toBe(null);

    const snapshot = vm.getFsSnapshot();
    await expect(snapshot.then((files) => Object.keys(files!).length)).resolves.toBe(2);
    await expect(snapshot.then((files) => files!['index.js'])).resolves.toBe(files['index.js']);
    await expect(snapshot.then((files) => files!['new.js'])).resolves.toBe(diff.create['new.js']);
  });

  test('can delete a file', async () => {
    const files: Project['files'] = {
      'src/index.js': 'Console.warn("Hello world!")',
    };
    const diff: FsDiff = {
      create: {},
      destroy: ['src/index.js'],
    };
    const vm = await getVm(getTestProject({ files }));

    await expect(vm.applyFsDiff(diff)).resolves.toBe(null);
    await expect(vm.getFsSnapshot()).resolves.toBe(null);
  });
});

describe('vm.getDependencies', () => {
  test('project with no dependencies', async () => {
    const project = getTestProject({ dependencies: undefined });
    const vm = await getVm(project);

    await expect(vm.getDependencies()).resolves.toBe(null);
  });

  test('project with dependencies', async () => {
    const project = getTestProject({
      dependencies: {
        lodash: '^4.17.10',
        rxjs: '^7.5.0',
      },
    });
    const vm = await getVm(project);
    const depNames = vm.getDependencies().then((deps) => Object.keys(deps!));

    // We should get original dependencies
    await expect(depNames).resolves.toContain('lodash');
    await expect(depNames).resolves.toContain('rxjs');
    // … but with different version specifiers
    await expect(vm.getDependencies()).resolves.not.toContain(project.dependencies);
  });

  test('node project with no package.json', async () => {
    const project = getTestProject({
      template: 'node',
      files: {},
    });
    const vm = await getVm(project);

    await expect(vm.getDependencies()).rejects.toBe(
      `SDK_GET_DEPS_SNAPSHOT_FAILURE: Could not find package.json in project with template 'node'`
    );
  });

  test('node project with invalid package.json', async () => {
    const project = getTestProject({
      template: 'node',
      files: { 'package.json': '/* whoops */' },
    });
    const vm = await getVm(project);

    await expect(vm.getDependencies()).rejects.toBe(
      `SDK_GET_DEPS_SNAPSHOT_FAILURE: Could not parse package.json in project with template 'node'`
    );
  });

  test('node project with package.json', async () => {
    const packageJson = {
      dependencies: { lodash: '^4', rxjs: '^7' },
      devDependencies: { serve: '^12', vite: '^3' },
      optionalDependencies: { cowsay: '^1.5' },
    };
    const project = getTestProject({
      template: 'node',
      files: {
        'package.json': JSON.stringify(packageJson),
      },
    });
    const vm = await getVm(project);
    const deps = await vm.getDependencies();

    // We should get dependencies and devDependencies merged, with original version specifiers
    expect(deps).toMatchObject(packageJson.dependencies);
    expect(deps).toMatchObject(packageJson.devDependencies);
    expect(deps).toMatchSnapshot();
  });
});

describe('vm.editor', () => {
  test('can change the color theme', async () => {
    const vm = await getVm(getTestProject());
    await expect(vm.editor.setTheme('light')).resolves.toBe(null);
    await expect(vm.editor.setTheme('dark')).resolves.toBe(null);
    await expect(vm.editor.setTheme('default')).resolves.toBe(null);
  });

  test('can change the UI view', async () => {
    const vm = await getVm(getTestProject());
    await expect(vm.editor.setView('preview')).resolves.toBe(null);
    await expect(vm.editor.setView('editor')).resolves.toBe(null);
    await expect(vm.editor.setView('default')).resolves.toBe(null);
  });

  test('can show the sidebar', async () => {
    const vm = await getVm(getTestProject());
    await expect(vm.editor.showSidebar(true)).resolves.toBe(null);
    await expect(vm.editor.showSidebar(false)).resolves.toBe(null);
  });

  test('can change open files', async () => {
    const files = {
      'index.js': 'console.log("Hello there!")',
      'README.md': '# My Cool Project',
    };
    const vm = await getVm(getTestProject({ files }));

    await expect(vm.editor.openFile('README.md')).resolves.toBe(null);
    await expect(vm.editor.openFile(['index.js,README.md', 'README.md'])).resolves.toBe(null);
  });

  test('cannot open non-existing files', async () => {
    const files = { a: 'aaa', b: 'bbb' };
    const vm = await getVm(getTestProject({ files }));

    // But we get an error if there's no match at all
    await expect(vm.editor.openFile('foo.bar')).rejects.toBe(
      `SDK_OPEN_FILE_FAILURE: No file found for: 'foo.bar'`
    );

    // Mix of existing and non-existing files still resolves
    await expect(vm.editor.openFile(['index.js,b,README.md', 'package.json,a'])).resolves.toBe(
      null
    );

    // But we get an error if there's no match at all
    await expect(vm.editor.openFile(['index.js', 'foo.bar'])).rejects.toBe(
      `SDK_OPEN_FILE_FAILURE: No file found for: 'index.js', 'foo.bar'`
    );
  });

  test('can change open files', async () => {
    const files = { 'README.md': 'Hi.', '.stackblitzrc': '{}' };
    const vm = await getVm(getTestProject({ files }));

    await expect(vm.editor.setCurrentFile('README.md')).resolves.toBe(null);
    await expect(vm.editor.setCurrentFile('.gitignore')).rejects.toBe(
      `SDK_SET_CURRENT_FILE_FAILURE: File not found: '.gitignore'`
    );
  });
});

describe('vm.preview', () => {
  test('has origin', async () => {
    const vm = await getVm(getTestProject());
    expect(vm.preview.origin).toBe('https://test.stackblitz.io');
  });

  test('has no origin (node project)', async () => {
    const vm = await getVm(getTestProject({ template: 'node' }));
    expect(vm.preview.origin).toBe(null);
  });

  test('has preview URL', async () => {
    const vm = await getVm(getTestProject());
    await expect(vm.preview.getUrl()).resolves.toBeTypeOf('string');
  });

  test('has no preview URL (node project)', async () => {
    const vm = await getVm(
      getTestProject({
        template: 'node',
      })
    );
    await expect(vm.preview.getUrl()).rejects.toBe(
      `SDK_GET_PREVIEW_URL_FAILURE: No preview URL found`
    );
  });

  test('can set preview URL', async () => {
    const vm = await getVm(getTestProject({ template: 'javascript' }));

    // Request to modify worked
    await expect(vm.preview.setUrl('/about')).resolves.toBe(null);

    // So the URL is now changed
    await expect(vm.preview.getUrl()).resolves.toBe('https://test.stackblitz.io/about');
  });

  test('can only set a path', async () => {
    const vm = await getVm(getTestProject({ template: 'javascript' }));

    expect(() => vm.preview.setUrl('https://example.com/')).toThrowError(
      `Invalid argument: expected a path starting with '/', got 'https://example.com/'`
    );

    expect(() => vm.preview.setUrl('about/us')).toThrowError(
      `Invalid argument: expected a path starting with '/', got 'about/us'`
    );
  });

  test('cannot set preview URL (node project)', async () => {
    const vm = await getVm(getTestProject({ template: 'node' }));

    await expect(vm.preview.setUrl('/about')).rejects.toBe(
      'SDK_SET_PREVIEW_URL_FAILURE: Server not running'
    );
  });
});
