import { describe, expect, test } from 'vitest';

import {
  ParamOptions,
  booleanParam,
  buildParams,
  enumParam,
  generators,
  percentParam,
  stringParams,
  trueParam,
} from '$src/params';

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
    expect(stringParams('_test', '')).toBe('');
    expect(stringParams('_test', 'hello')).toBe('_test=hello');
    expect(stringParams('_test', 'a/../b?c&d')).toBe('_test=a%2F..%2Fb%3Fc%26d');
    expect(stringParams('_test', ['hello', 'beautiful', 'world'])).toBe(
      '_test=hello&_test=beautiful&_test=world'
    );
  });

  test('enumParam drops invalid options', () => {
    const options = ['yes', 'no', 'maybe?'];
    expect(enumParam('_test')).toBe('');
    expect(enumParam('_test', 'yes', options)).toBe('_test=yes');
    expect(enumParam('_test', 'nope', options)).toBe('');
    expect(enumParam('_test', 'maybe?', options)).toBe('_test=maybe%3F');
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
    const options: ParamOptions = {
      clickToLoad: false,
      devToolsHeight: NaN,
      forceEmbedLayout: false,
      hideDevTools: false,
      hideExplorer: false,
      hideNavigation: false,
      openFile: '',
      showSidebar: undefined,
      sidebarView: 'default',
      startScript: undefined,
      terminalHeight: NaN,
      theme: 'default',
      view: 'default',
      zenMode: false,
    };
    // Check that we are testing all options
    expect(Object.keys(options).sort()).toStrictEqual(Object.keys(generators).sort());
    // Check that default and undefined values don't output anything
    expect(buildParams(options)).toBe('');
  });

  test('outputs non-default values for known options', () => {
    const options: ParamOptions = {
      clickToLoad: true,
      devToolsHeight: 100,
      forceEmbedLayout: true,
      hideDevTools: true,
      hideExplorer: true,
      hideNavigation: true,
      openFile: ['src/index.js,src/styles.css', 'package.json'],
      showSidebar: true,
      sidebarView: 'search',
      startScript: 'dev:serve',
      terminalHeight: 50,
      theme: 'light',
      view: 'preview',
      zenMode: true,
    };
    // Check that we are testing all options
    expect(Object.keys(options).sort()).toStrictEqual(Object.keys(generators).sort());
    // Check that all values end up in the query string
    // (Comparing sorted arrays instead of strings to make failures readable.)
    expect(buildParams(options).split('&').sort()).toStrictEqual(
      [
        '?ctl=1',
        'devtoolsheight=100',
        'embed=1',
        'hidedevtools=1',
        'hideExplorer=1',
        'hideNavigation=1',
        'file=src%2Findex.js%2Csrc%2Fstyles.css',
        'file=package.json',
        'showSidebar=1',
        'sidebarView=search',
        'startScript=dev%3Aserve',
        'terminalHeight=50',
        'theme=light',
        'view=preview',
        'zenMode=1',
      ].sort()
    );
  });
});
