import type { EmbedOptions, OpenOptions } from './interfaces';

type Options = Omit<OpenOptions & EmbedOptions, 'origin' | 'newWindow' | 'height' | 'width'>;

/**
 * URL parameter names supported by the StackBlitz instance.
 * Note that while updated instances perform a case-insensitive lookup
 * for query parameters, some Enterprise Edition deployments may not,
 * and we need to use specific (and sometimes inconsistent) casing;
 * see for example 'hidedevtools' vs 'hideNavigation'.
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
  | 'terminalHeight'
  | 'theme'
  | 'view'
  | 'zenMode';

const generators: Record<keyof Options, (value: any) => string> = {
  clickToLoad: (value: Options['clickToLoad']) => trueParam('ctl', value),
  devToolsHeight: (value: Options['devToolsHeight']) => percentParam('devtoolsheight', value),
  forceEmbedLayout: (value: Options['forceEmbedLayout']) => trueParam('embed', value),
  hideDevTools: (value: Options['hideDevTools']) => trueParam('hidedevtools', value),
  hideExplorer: (value: Options['hideExplorer']) => trueParam('hideExplorer', value),
  hideNavigation: (value: Options['hideNavigation']) => trueParam('hideNavigation', value),
  showSidebar: (value: Options['showSidebar']) => booleanParam('showSidebar', value),
  openFile: (value: Options['openFile']) => stringParams('file', value).join('&'),
  terminalHeight: (value: Options['terminalHeight']) => percentParam('terminalHeight', value),
  theme: (value: Options['theme']) => enumParam('theme', ['light', 'dark'], value),
  view: (value: Options['view']) => enumParam('view', ['preview', 'editor'], value),
  zenMode: (value: Options['zenMode']) => trueParam('zenMode', value),
};

export function buildParams(options: Options = {}): string {
  const params: string[] = Object.entries(options)
    .map(([key, value]) => {
      if (value != null && generators.hasOwnProperty(key)) {
        return generators[key as keyof Options](value);
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

export function enumParam(name: ParamName, oneOf: string[], value?: string) {
  if (typeof value === 'string' && oneOf.includes(value)) {
    return `${name}=${value}`;
  }
  return '';
}

export function stringParams(name: ParamName, value?: string | string[]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((val) => typeof val === 'string' && val.trim() !== '')
    .map((val) => `${name}=${encodeURIComponent(val!.trim())}`);
}
