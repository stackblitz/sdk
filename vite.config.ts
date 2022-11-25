import ReplacePlugin from '@rollup/plugin-replace';
import { readFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import type { ViteDevServer } from 'vite';
import TSConfigPaths from 'vite-tsconfig-paths';
import type { UserConfig } from 'vitest/config';
import { defineConfig } from 'vitest/config';

const DIR = {
  ROOT: __dirname,
  TEMP: join(__dirname, 'temp'),
  TEST: join(__dirname, 'test'),
  EXAMPLES: join(__dirname, 'examples'),
};

const commonPlugins: UserConfig['plugins'] = [
  ReplacePlugin({
    __STACKBLITZ_SERVER_ORIGIN__: JSON.stringify(process.env.STACKBLITZ_SERVER_ORIGIN),
  }),
];

const libConfig: UserConfig = {
  plugins: [...commonPlugins],
  build: {
    target: 'es2020',
    outDir: join(DIR.ROOT, 'bundles'),
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      name: 'StackBlitzSDK',
      entry: 'src/index.ts',
      formats: ['cjs', 'es', 'umd'],
      // Override the default file names used by Vite's “Library Mode”
      // (https://vitejs.dev/guide/build.html#library-mode) for backwards
      // compatibility with microbundle's output.
      fileName: (format, _name) => {
        let suffix: string = '';
        if (format === 'es') suffix = '.m';
        if (format === 'umd') suffix = '.umd';
        return `sdk${suffix}.js`;
      },
    },
  },
};

/**
 * Config for running tests and/or building or serving examples
 */
const testConfig: UserConfig = {
  // We should be using 'mpa' but it ends up with a TypeError
  appType: 'mpa',
  root: DIR.EXAMPLES,
  plugins: [
    ...commonPlugins,
    {
      name: 'custom-server-config',
      configureServer,
    },
    TSConfigPaths({
      loose: true, // allow aliases in .html files
      projects: [join(DIR.ROOT, 'tsconfig.test.json')],
    }),
  ],
  build: {
    target: 'es2020',
    outDir: join(DIR.TEMP, 'temp/test-build'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: join(DIR.EXAMPLES, 'index.html'),
        blank: join(DIR.EXAMPLES, 'blank/index.html'),
        'open-embed-github-project': join(DIR.EXAMPLES, 'open-embed-github-project/index.html'),
        'open-embed-project-id': join(DIR.EXAMPLES, 'open-embed-project-id/index.html'),
      },
    },
  },
  envPrefix: 'STACKBLITZ_SDK_',
  server: {
    port: 4000,
  },
  test: {
    dir: DIR.TEST,
    globals: false,
    include: ['**/unit/**/*.spec.ts'],
    exclude: ['**/node_modules/**'],
    coverage: {
      provider: 'c8',
      include: ['**/src/**/*.ts', '**/test/server/**/*.ts'],
      exclude: ['**/node_modules/**'],
      reportsDirectory: join(DIR.TEMP, 'coverage'),
    },
  },
};

/**
 * Serve a custom HTML page for requests to '/_embed/*'
 */
function configureServer(server: ViteDevServer) {
  server.middlewares.use('/_embed', async (req, res, next) => {
    const pathname = req.url && new URL(req.url, 'http://localhost/').pathname;
    const ext = pathname && parse(pathname).ext;
    if (ext === '' || ext === '.html') {
      const content = await readFile(join(DIR.TEST, 'embed/index.html'));
      res.statusCode = 200;
      res.end(content);
    } else {
      next();
    }
  });
}

export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    return testConfig;
  }
  return libConfig;
});
