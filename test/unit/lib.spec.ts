/** @vitest-environment happy-dom */

import { describe, expect, test, vi } from 'vitest';

import { connect, openGithubProject, openProject, openProjectId } from '../../src/lib';

import { getTestProject } from './utils/project';

/**
 * Cannot test a working use case for connect or or all the embed* methods using happy-dom,
 * due to iframes not having a contentWindow and Window objects not having postMessage
 */
describe('connect', () => {
  test('rejects if target is not an iframe', async () => {
    const div = document.createElement('div');
    await expect(connect(div as any)).rejects.toBe(`Provided element is not an iframe.`);
  });
});

describe('openProject', () => {
  test('injects a form to open project in new page', () => {
    const project = getTestProject();

    // Spy on openProject doing DOM mutations
    let form: HTMLFormElement;
    const observerCb = vi.fn(([record]: MutationRecord[]) => {
      if (!record || form) return;
      for (const node of record.addedNodes) {
        if (node instanceof HTMLFormElement) {
          form = node;
        }
      }
    });
    const observer = new MutationObserver(observerCb);
    observer.observe(document.body, {
      childList: true,
      attributes: false,
      subtree: true,
    });

    expect(() => openProject(project)).not.toThrow();

    // We expect to have seen 2 DOM mutations (add then remove form)
    expect(observerCb).toHaveBeenCalledTimes(2);

    // We expect to have seen a form
    expect(form!).toBeInstanceOf(HTMLFormElement);
    expect(form!.attributes).toMatchSnapshot();

    observer.disconnect();
    observerCb.mockRestore();
  });
});

describe('openProjectId', () => {
  test('calls window.open', () => {
    const openSpy = vi.spyOn(window, 'open');

    openProjectId('js');
    expect(openSpy).toBeCalledWith('https://stackblitz.com/edit/js', '_blank');

    openProjectId('js', {
      origin: 'https://example.com',
      newWindow: false,
      openFile: 'src/index.js',
    });
    expect(openSpy).toBeCalledWith('https://example.com/edit/js?file=src%2Findex.js', '_self');

    openSpy.mockRestore();
  });
});

describe('openGithubProject', () => {
  test('calls window.open', () => {
    const openSpy = vi.spyOn(window, 'open');

    openGithubProject('stackblitz/sdk');
    expect(openSpy).toBeCalledWith('https://stackblitz.com/github/stackblitz/sdk', '_blank');

    openGithubProject('stackblitz/docs', { newWindow: false, hideExplorer: true });
    expect(openSpy).toBeCalledWith(
      'https://stackblitz.com/github/stackblitz/docs?hideExplorer=1',
      '_self'
    );

    openSpy.mockRestore();
  });
});
