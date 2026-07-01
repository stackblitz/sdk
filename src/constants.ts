/**
 * Number of milliseconds between attempts to get a response from an embedded frame
 */
export const CONNECT_INTERVAL = 500;

/**
 * How many times should we try to get an init response from an embedded frame
 */
export const CONNECT_MAX_ATTEMPTS = 20;

/**
 * Default height attribute for iframes
 */
export const DEFAULT_FRAME_HEIGHT = 300;

// Local declaration to satisfy TypeScript.
// Usage of this variable will be replaced at build time,
// and should not appear in the built bundles and .d.ts files
declare var __STACKBLITZ_SERVER_ORIGIN__: string | undefined;

/**
 * Origin of the StackBlitz instance
 */
export const DEFAULT_ORIGIN: string = __STACKBLITZ_SERVER_ORIGIN__ || 'https://stackblitz.com';

/**
 * List of supported template names.
 */
export const PROJECT_TEMPLATES = [
  'angular-cli',
  'create-react-app',
  'html',
  'javascript',
  'node',
  'polymer',
  'typescript',
  'vue',
] as const;

/**
 * Supported sidebar views
 */
export const UI_SIDEBAR_VIEWS = ['project', 'search', 'ports', 'settings'] as const;

/**
 * Supported editor themes
 */
export const UI_THEMES = ['light', 'dark'] as const;

/**
 * Supported editor view modes
 */
export const UI_VIEWS = ['editor', 'preview'] as const;

/**
 * Permissions Policy features delegated to the embed iframe.
 *
 * Each feature is delegated to any origin (`feature *`) so that the embedded
 * StackBlitz document — and any (potentially cross-origin) iframes it nests,
 * such as project previews — can actually use them. A feature can only be used
 * in a nested frame if every ancestor frame was granted it, so the outer embed
 * frame must delegate the feature for it to reach a preview iframe deeper down.
 *
 * `cross-origin-isolated` is intentionally omitted: it does not accept the `*`
 * allowlist value and is delegated separately to the StackBlitz origin.
 */
export const EMBED_ALLOW_FEATURES = [
  'accelerometer',
  'ambient-light-sensor',
  'autoplay',
  'battery',
  'bluetooth',
  'camera',
  'clipboard-read',
  'clipboard-write',
  'display-capture',
  'encrypted-media',
  'fullscreen',
  'gamepad',
  'geolocation',
  'gyroscope',
  'hid',
  'idle-detection',
  'local-network',
  'local-network-access',
  'loopback-network',
  'magnetometer',
  'microphone',
  'midi',
  'payment',
  'picture-in-picture',
  'publickey-credentials-get',
  'screen-wake-lock',
  'serial',
  'usb',
  'web-share',
  'xr-spatial-tracking',
] as const;
