import { describe, expect, test } from 'vitest';

import {
  booleanParam,
  buildParams,
  enumParam,
  percentParam,
  stringParams,
  trueParam,
} from '../src/params';

describe('params formats', () => {
  test('trueParam accepts true only', () => {
    expect(trueParam('test')).toBe('');
    expect(trueParam('test', 1 as any)).toBe('');
    expect(trueParam('test', false)).toBe('');
    expect(trueParam('test', true)).toBe('test=1');
  });

  test('booleanParam accepts true and false', () => {
    expect(booleanParam('test')).toBe('');
    expect(booleanParam('test', 'yes' as any)).toBe('');
    expect(booleanParam('test', false)).toBe('test=0');
    expect(booleanParam('test', true)).toBe('test=1');
  });

  test('percentParam clamps and rounds number values', () => {
    expect(percentParam('test')).toBe('');
    expect(percentParam('test', '50%' as any)).toBe('');
    expect(percentParam('test', 0 / 0)).toBe('');
    // It accepts integers
    expect(percentParam('test', 0)).toBe('test=0');
    expect(percentParam('test', 33)).toBe('test=33');
    expect(percentParam('test', 100)).toBe('test=100');
    // It rounds values
    expect(percentParam('test', Math.PI)).toBe('test=3');
    expect(percentParam('test', 49.5001)).toBe('test=50');
    // It clamps values
    expect(percentParam('test', -50)).toBe('test=0');
    expect(percentParam('test', 150)).toBe('test=100');
  });

  test('stringParams', () => {
    expect(stringParams('test', '')).toStrictEqual([]);
    expect(stringParams('test', 'hello')).toStrictEqual(['test=hello']);
    expect(stringParams('test', 'a/../b?c&d')).toStrictEqual(['test=a%2F..%2Fb%3Fc%26d']);
    expect(stringParams('test', ['hello', 'beautiful', 'world'])).toStrictEqual([
      'test=hello',
      'test=beautiful',
      'test=world',
    ]);
  });

  test('enumParam drops invalid options', () => {
    const options = ['yes', 'no', 'maybe'];
    expect(enumParam('test', options)).toBe('');
    expect(enumParam('test', options, 'yes')).toBe('test=yes');
    expect(enumParam('test', options, 'nope')).toBe('');
    expect(enumParam('test', options, 'maybe')).toBe('test=maybe');
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
        &devToolsHeight=100
        &embed=1
        &hideDevTools=1
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
