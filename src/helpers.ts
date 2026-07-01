import type { EmbedOptions, OpenOptions } from './interfaces';
import { DEFAULT_FRAME_HEIGHT, DEFAULT_ORIGIN, EMBED_ALLOW_FEATURES } from './constants';
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
  const allowList =
    target.allow
      ?.split(';')
      ?.map((key) => key.trim())
      .filter(Boolean) ?? [];

  const declaredFeatures = new Set(allowList.map((entry) => entry.split(/\s+/)[0]));

  /**
   * Delegate every Permissions Policy feature to any origin (`feature *`) so
   * the embedded document and any (cross-origin) iframes it nests — e.g. project
   * previews — can use them. A feature only reaches a nested frame if each
   * ancestor frame was granted it, so the outer embed frame must delegate it.
   */
  for (const feature of getDelegatableFeatures()) {
    if (!declaredFeatures.has(feature)) {
      allowList.push(`${feature} *`);
      declaredFeatures.add(feature);
    }
  }

  if (options.crossOriginIsolated && !declaredFeatures.has('cross-origin-isolated')) {
    /**
     * Delegate the `cross-origin-isolated` permission to the StackBlitz origin
     * explicitly. A bare `cross-origin-isolated` token is scoped to the iframe's
     * `src` origin, but `embedProject` creates the frame without a `src` and only
     * navigates to StackBlitz cross-origin via a form POST, so the permission
     * would never reach the embedded document. Naming the origin makes it apply
     * regardless of how the frame is populated. It also does not accept the `*`
     * allowlist value, which is why it is handled separately here.
     */
    allowList.push(`cross-origin-isolated ${getOrigin(options)}`);
    declaredFeatures.add('cross-origin-isolated');
  }

  if (allowList.length > 0) {
    frame.allow = allowList.join('; ');
  }
}

/**
 * The set of Permissions Policy features to delegate to the embed frame.
 *
 * When available, the browser's own list of features currently allowed in this
 * document (`document.featurePolicy.allowedFeatures()`) is used so we pick up
 * any features the browser supports without maintaining them by hand. That API
 * is non-standard and Chromium-only, so it is unioned with `EMBED_ALLOW_FEATURES`
 * as a fallback for browsers (Firefox, Safari) that don't implement it.
 *
 * `cross-origin-isolated` is removed because it does not accept the `*`
 * allowlist value and is delegated separately to the StackBlitz origin.
 */
function getDelegatableFeatures(): string[] {
  const features = new Set<string>(EMBED_ALLOW_FEATURES);

  try {
    const policy = (document as any)?.featurePolicy;
    if (policy && typeof policy.allowedFeatures === 'function') {
      for (const feature of policy.allowedFeatures() as string[]) {
        features.add(feature);
      }
    }
  } catch {
    // Non-standard API; fall back to the static list.
  }

  features.delete('cross-origin-isolated');

  return [...features];
}
