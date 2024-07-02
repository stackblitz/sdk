import type { EmbedOptions, OpenOptions } from './interfaces';
import { DEFAULT_FRAME_HEIGHT, DEFAULT_ORIGIN } from './constants';
import { buildParams } from './params';

type Route = '/run' | `/edit/${string}` | `/github/${string}` | `/fork/${string}`;

/**
 * Pseudo-random id string for internal accounting.
 * 8 characters long, and collisions around 1 per million.
 */
export function genID() {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export function openUrl(route: Route, options?: OpenOptions) {
  return `${getOrigin(options)}${route}${buildParams(options)}`;
}

export function embedUrl(route: Route, options?: EmbedOptions) {
  const config: EmbedOptions = {
    forceEmbedLayout: true,
  };
  if (options && typeof options === 'object') {
    Object.assign(config, options);
  }
  return `${getOrigin(config)}${route}${buildParams(config)}`;
}

function getOrigin(options: OpenOptions & EmbedOptions = {}) {
  const origin = typeof options.origin === 'string' ? options.origin : DEFAULT_ORIGIN;
  return origin.replace(/\/$/, '');
}

export function replaceAndEmbed(
  target: HTMLElement,
  frame: HTMLIFrameElement,
  options?: EmbedOptions
) {
  if (!frame || !target || !target.parentNode) {
    throw new Error('Invalid Element');
  }
  if (target.id) {
    frame.id = target.id;
  }
  if (target.className) {
    frame.className = target.className;
  }
  setFrameDimensions(frame, options);
  setFrameAllowList(target, frame, options);
  target.replaceWith(frame);
}

export function findElement(elementOrId: string | HTMLElement) {
  if (typeof elementOrId === 'string') {
    const element = document.getElementById(elementOrId);
    if (!element) {
      throw new Error(`Could not find element with id '${elementOrId}'`);
    }
    return element;
  } else if (elementOrId instanceof HTMLElement) {
    return elementOrId;
  }
  throw new Error(`Invalid element: ${elementOrId}`);
}

export function openTarget(options?: OpenOptions) {
  return options && options.newWindow === false ? '_self' : '_blank';
}

function setFrameDimensions(frame: HTMLIFrameElement, options: EmbedOptions = {}) {
  const height: string = Object.hasOwnProperty.call(options, 'height')
    ? `${options.height}`
    : `${DEFAULT_FRAME_HEIGHT}`;
  const width: string | undefined = Object.hasOwnProperty.call(options, 'width')
    ? `${options.width}`
    : undefined;

  frame.setAttribute('height', height);
  if (width) {
    frame.setAttribute('width', width);
  } else {
    frame.setAttribute('style', 'width:100%;');
  }
}

function setFrameAllowList(
  target: HTMLElement & { allow?: string },
  frame: HTMLIFrameElement,
  options: EmbedOptions = {}
) {
  const allowList = target.allow?.split(';')?.map((key) => key.trim()) ?? [];

  if (options.crossOriginIsolated && !allowList.includes('cross-origin-isolated')) {
    allowList.push('cross-origin-isolated');
  }

  if (allowList.length > 0) {
    frame.allow = allowList.join('; ');
  }
}
