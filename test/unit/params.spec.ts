import { describe, expect, test } from 'vitest';

import {
  booleanParam,
  buildParams,
  enumParam,
  percentParam,
  stringParams,
  trueParam,
} from '$lib/params';

describe('params formats', () => {
  test('trueParam accepts true only', () => {
    expect(trueParam('_test')).toBe('');
    expect(trueParam('_test', 1 as any)).toBe('');
    expect(trueParam('_test', false)).toBe('');
    expect(trueParam('_test', true)).toBe('_test=1');
  });

  test('booleanParam accepts true and false', () => {
    expect(booleanParam('_test')).toBe('');
    expect(booleanParam('_test', 'yes' as any)).toBe('');
    expect(booleanParam('_test', false)).toBe('_test=0');
    expect(booleanParam('_test', true)).toBe('_test=1');
  });

  test('percentParam clamps and rounds number values', () => {
    expect(percentParam('_test')).toBe('');
    expect(percentParam('_test', '50%' as any)).toBe('');
    expect(percentParam('_test', 0 / 0)).toBe('');
    // It accepts integers
    expect(percentParam('_test', 0)).toBe('_test=0');
    expect(percentParam('_test', 33)).toBe('_test=33');
    expect(percentParam('_test', 100)).toBe('_test=100');
    // It rounds values
    expect(percentParam('_test', Math.PI)).toBe('_test=3');
    expect(percentParam('_test', 49.5001)).toBe('_test=50');
    // It clamps values
    expect(percentParam('_test', -50)).toBe('_test=0');
    expect(percentParam('_test', 150)).toBe('_test=100');
  });

  test('stringParams', () => {
    expect(stringParams('_test', '')).toStrictEqual([]);
    expect(stringParams('_test', 'hello')).toStrictEqual(['_test=hello']);
    expect(stringParams('_test', 'a/../b?c&d')).toStrictEqual(['_test=a%2F..%2Fb%3Fc%26d']);
    expect(stringParams('_test', ['hello', 'beautiful', 'world'])).toStrictEqual([
      '_test=hello',
      '_test=beautiful',
      '_test=world',
    ]);
  });

  test('enumParam drops invalid options', () => {
    const options = ['yes', 'no', 'maybe'];
    expect(enumParam('_test', options)).toBe('');
    expect(enumParam('_test', options, 'yes')).toBe('_test=yes');
    expect(enumParam('_test', options, 'nope')).toBe('');
    expect(enumParam('_test', options, 'maybe')).toBe('_test=maybe');
  });
});

describe('buildParams', () => {
  test('ignores unknown options', () => {
    expect(buildParams()).toBe('');
    expect(buildParams({})).toBe('');
    expect(buildParams({ boop: 'boop', height: 50 } as any)).toBe('');
    expect(buildParams({ boop: 'boop', showSidebar: true } as any)).toBe('?showSidebar=1');
  });

  test('ignores unknown options', () => {
    expect(buildParams({})).toBe('');
    expect(buildParams({ boop: 'boop', height: 50 } as any)).toBe('');
    expect(buildParams({ boop: 'boop', showSidebar: true } as any)).toBe('?showSidebar=1');
    expect(buildParams({ origin: 'https://example.com' } as any)).toBe('');
  });

  test('doesn’t output undefined or default values', () => {
    expect(
      buildParams({
        clickToLoad: false,
        devToolsHeight: NaN,
        forceEmbedLayout: false,
        hideDevTools: false,
        hideExplorer: false,
        hideNavigation: false,
        openFile: '',
        showSidebar: undefined,
        terminalHeight: NaN,
        theme: 'default',
        view: 'default',
      })
    ).toBe('');
  });

  test('outputs non-default values for known options', () => {
    expect(
      buildParams({
        clickToLoad: true,
        devToolsHeight: 100,
        forceEmbedLayout: true,
        hideDevTools: true,
        hideExplorer: true,
        hideNavigation: true,
        showSidebar: true,
        openFile: ['src/index.js,src/styles.css', 'package.json'],
        terminalHeight: 50,
        theme: 'light',
        view: 'preview',
      })
    ).toBe(
      `
        ?ctl=1
        &devtoolsheight=100
        &embed=1
        &hidedevtools=1
        &hideExplorer=1
        &hideNavigation=1
        &showSidebar=1
        &file=src%2Findex.js%2Csrc%2Fstyles.css
        &file=package.json
        &terminalHeight=50
        &theme=light
        &view=preview
      `.replace(/\s/g, '')
    );
  });
});
