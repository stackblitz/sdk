import type { EmbedOptions, OpenOptions } from './interfaces';

import { UI_SIDEBAR_VIEWS, UI_THEMES, UI_VIEWS } from './constants';

export type ParamOptions = Omit<
  OpenOptions & EmbedOptions,
  'origin' | 'newWindow' | 'height' | 'width'
>;

/**
 * URL parameter names supported by the StackBlitz instance.
 *
 * A couple notes:
 *
 * - Names don't always match the keys in EmbedOptions / OpenOptions.
 *   For example, options use `openFile` but the expected param is `file`.
 * - While updated instances perform a case-insensitive lookup for query
 *   parameters, some Enterprise Edition deployments may not, and we need to
 *   use specific (and sometimes inconsistent) casing; see for example
 *   'hidedevtools' vs 'hideNavigation'.
 */
type ParamName =
  | '_test'
  | 'clicktoload'
  | 'ctl'
  | 'devtoolsheight'
  | 'embed'
  | 'file'
  | 'hidedevtools'
  | 'hideExplorer'
  | 'hideNavigation'
  | 'initialpath'
  | 'showSidebar'
  | 'sidebarView'
  | 'startScript'
  | 'terminalHeight'
  | 'theme'
  | 'view'
  | 'zenMode'
  | 'orgName'
  | 'orgProvider'
  | 'corp';

export const generators: Record<keyof ParamOptions, (value: any) => string> = {
  clickToLoad: (value: ParamOptions['clickToLoad']) => trueParam('ctl', value),
  devToolsHeight: (value: ParamOptions['devToolsHeight']) => percentParam('devtoolsheight', value),
  forceEmbedLayout: (value: ParamOptions['forceEmbedLayout']) => trueParam('embed', value),
  hideDevTools: (value: ParamOptions['hideDevTools']) => trueParam('hidedevtools', value),
  hideExplorer: (value: ParamOptions['hideExplorer']) => trueParam('hideExplorer', value),
  hideNavigation: (value: ParamOptions['hideNavigation']) => trueParam('hideNavigation', value),
  openFile: (value: ParamOptions['openFile']) => stringParams('file', value),
  showSidebar: (value: ParamOptions['showSidebar']) => booleanParam('showSidebar', value),
  sidebarView: (value: ParamOptions['sidebarView']) =>
    enumParam('sidebarView', value, UI_SIDEBAR_VIEWS),
  startScript: (value: ParamOptions['startScript']) => stringParams('startScript', value),
  terminalHeight: (value: ParamOptions['terminalHeight']) => percentParam('terminalHeight', value),
  theme: (value: ParamOptions['theme']) => enumParam('theme', value, UI_THEMES),
  view: (value: ParamOptions['view']) => enumParam('view', value, UI_VIEWS),
  zenMode: (value: ParamOptions['zenMode']) => trueParam('zenMode', value),
  organization: (value: ParamOptions['organization']) =>
    `${stringParams('orgName', value?.name)}&${stringParams('orgProvider', value?.provider)}`,
  crossOriginIsolated: (value: ParamOptions['crossOriginIsolated']) => trueParam('corp', value),
};

export function buildParams(options: ParamOptions = {}): string {
  const params: string[] = Object.entries(options)
    .map(([key, value]) => {
      if (value != null && generators.hasOwnProperty(key)) {
        return generators[key as keyof ParamOptions](value);
      }
      return '';
    })
    .filter(Boolean);

  return params.length ? `?${params.join('&')}` : '';
}

export function trueParam(name: ParamName, value?: boolean): string {
  if (value === true) {
    return `${name}=1`;
  }
  return '';
}

export function booleanParam(name: ParamName, value?: boolean): string {
  if (typeof value === 'boolean') {
    return `${name}=${value ? '1' : '0'}`;
  }
  return '';
}

export function percentParam(name: ParamName, value?: number): string {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const clamped = Math.min(100, Math.max(0, value));
    return `${name}=${encodeURIComponent(Math.round(clamped))}`;
  }
  return '';
}

export function enumParam(
  name: ParamName,
  value: string = '',
  allowList: readonly string[] = []
): string {
  if (allowList.includes(value)) {
    return `${name}=${encodeURIComponent(value)}`;
  }
  return '';
}

export function stringParams(name: ParamName, value?: string | string[]): string {
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((val) => typeof val === 'string' && val.trim() !== '')
    .map((val) => `${name}=${encodeURIComponent(val!)}`)
    .join('&');
}
