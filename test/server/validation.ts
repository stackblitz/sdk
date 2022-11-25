import type { OpenFileOption } from '$src/interfaces';

export function isTheme(input: any) {
  return ['default', 'dark', 'light'].includes(input);
}

export function isView(input: any) {
  return ['default', 'editor', 'preview'].includes(input);
}

export function fileToPanes(file: OpenFileOption): string[][] {
  const files = Array.isArray(file) ? file : [file];
  return files
    .filter((path) => typeof path === 'string')
    .map((path) => path.split(','))
    .filter((paths) => paths.length > 0);
}

export function filterPanes(panes: string[][], files: Record<string, string>): string[][] {
  const fileExists = (path: string) => typeof files[path] === 'string';
  return panes.map((pane) => pane.filter(fileExists)).filter((pane) => pane.length > 0);
}

export function cleanPreviewPath(input: any): string {
  if (typeof input === 'string') {
    let path = decodeURIComponent(input).split(/#\?/)[0].trim();
    if (path.length > 0 && !path.startsWith('/')) {
      path = '/' + path;
    }
    return path;
  }
  return '';
}
