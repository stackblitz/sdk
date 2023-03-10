import type { EmbedOptions, OpenOptions } from './interfaces';

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
  | 'startScript'
  | 'terminalHeight'
  | 'theme'
  | 'view'
  | 'zenMode';

export const generators: Record<keyof ParamOptions, (value: any) => string> = {
  clickToLoad: (value: ParamOptions['clickToLoad']) => trueParam('ctl', value),
  devToolsHeight: (value: ParamOptions['devToolsHeight']) => percentParam('devtoolsheight', value),
  forceEmbedLayout: (value: ParamOptions['forceEmbedLayout']) => trueParam('embed', value),
  hideDevTools: (value: ParamOptions['hideDevTools']) => trueParam('hidedevtools', value),
  hideExplorer: (value: ParamOptions['hideExplorer']) => trueParam('hideExplorer', value),
  hideNavigation: (value: ParamOptions['hideNavigation']) => trueParam('hideNavigation', value),
  openFile: (value: ParamOptions['openFile']) => stringParams('file', value),
  showSidebar: (value: ParamOptions['showSidebar']) => booleanParam('showSidebar', value),
  startScript: (value: ParamOptions['startScript']) => stringParams('startScript', value),
  terminalHeight: (value: ParamOptions['terminalHeight']) => percentParam('terminalHeight', value),
  theme: (value: ParamOptions['theme']) => enumParam('theme', ['light', 'dark'], value),
  view: (value: ParamOptions['view']) => enumParam('view', ['preview', 'editor'], value),
  zenMode: (value: ParamOptions['zenMode']) => trueParam('zenMode', value),
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
    return `${name}=${Math.round(clamped)}`;
  }
  return '';
}

export function enumParam(name: ParamName, oneOf: string[], value?: string): string {
  if (typeof value === 'string' && oneOf.includes(value)) {
    return `${name}=${value}`;
  }
  return '';
}

export function stringParams(name: ParamName, value?: string | string[]): string {
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((val) => typeof val === 'string' && val.trim() !== '')
    .map((val) => `${name}=${encodeURIComponent(val!.trim())}`)
    .join('&');
}
