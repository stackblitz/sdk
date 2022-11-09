import type { EmbedOptions, OpenOptions } from './interfaces';

type Options = Omit<OpenOptions & EmbedOptions, 'origin' | 'newWindow' | 'height' | 'width'>;

const generators: Record<keyof Options, (value: any) => string> = {
  clickToLoad: (value: Options['clickToLoad']) => trueParam('ctl', value),
  devToolsHeight: (value: Options['devToolsHeight']) => percentParam('devToolsHeight', value),
  forceEmbedLayout: (value: Options['forceEmbedLayout']) => trueParam('embed', value),
  hideDevTools: (value: Options['hideDevTools']) => trueParam('hideDevTools', value),
  hideExplorer: (value: Options['hideExplorer']) => trueParam('hideExplorer', value),
  hideNavigation: (value: Options['hideNavigation']) => trueParam('hideNavigation', value),
  showSidebar: (value: Options['showSidebar']) => booleanParam('showSidebar', value),
  openFile: (value: Options['openFile']) => stringParams('file', value).join('&'),
  terminalHeight: (value: Options['terminalHeight']) => percentParam('terminalHeight', value),
  theme: (value: Options['theme']) => enumParam('theme', ['light', 'dark'], value),
  view: (value: Options['view']) => enumParam('view', ['preview', 'editor'], value),
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

export function trueParam(name: string, value?: boolean): string {
  if (value === true) {
    return `${name}=1`;
  }
  return '';
}

export function booleanParam(name: string, value?: boolean): string {
  if (typeof value === 'boolean') {
    return `${name}=${value ? '1' : '0'}`;
  }
  return '';
}

export function percentParam(name: string, value?: number): string {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const clamped = Math.min(100, Math.max(0, value));
    return `${name}=${Math.round(clamped)}`;
  }
  return '';
}

export function enumParam(name: string, oneOf: string[], value?: string) {
  if (typeof value === 'string' && oneOf.includes(value)) {
    return `${name}=${value}`;
  }
  return '';
}

export function stringParams(name: string, value?: string | string[]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((val) => typeof val === 'string' && val.trim() !== '')
    .map((val: string) => `${name}=${encodeURIComponent(val.trim())}`);
}
