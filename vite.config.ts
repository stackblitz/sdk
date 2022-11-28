import ReplacePlugin from '@rollup/plugin-replace';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import TSConfigPaths from 'vite-tsconfig-paths';
import type { UserConfig } from 'vitest/config';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  if (!['lib', 'dev', 'test', 'e2e'].includes(mode)) {
    throw new Error(`Expected --mode with value 'lib', 'dev', 'test' or 'e2e'`);
  }

  if (mode === 'lib') {
    return libConfig();
  }

  return testConfig(mode);
});

/**
 * Config for building the SDK bundles
 */
function libConfig(): UserConfig {
  return {
    plugins: [replaceOrigin()],
    build: {
      target: 'es2020',
      outDir: 'bundles',
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
}

/**
 * Config for running tests and/or building or serving examples
 */
function testConfig(mode: string): UserConfig {
  const isE2E = mode === 'e2e';
  const defaultOrigin = isE2E ? '/_embed/' : undefined;

  return {
    plugins: [
      replaceOrigin(process.env.STACKBLITZ_SERVER_ORIGIN ?? defaultOrigin),
      {
        name: 'custom-server-config',
        configureServer,
      },
      TSConfigPaths({
        loose: true, // allow aliases in .html files
        projects: [`${__dirname}/tsconfig.test.json`],
      }),
    ],
    build: {
      target: 'es2020',
      outDir: 'temp/build',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          sdk: 'src/index.ts',
          embed: 'test/embed/index.html',
          examples: 'examples/index.html',
          'example-github-project': 'examples/open-embed-github-project/index.html',
          'example-project-id': 'examples/open-embed-project-id/index.html',
        },
      },
    },
    server: {
      port: isE2E ? 4001 : 4000,
      hmr: !isE2E,
    },
    test: {
      dir: 'test',
      globals: false,
      include: ['**/unit/**/*.spec.ts'],
      exclude: ['**/node_modules/**'],
      coverage: {
        provider: 'c8',
        include: ['**/src/**/*.ts', '**/test/server/**/*.ts'],
        exclude: ['**/node_modules/**'],
        reportsDirectory: 'temp/coverage',
      },
    },
  };
}

/**
 * Serve a custom HTML page for requests to '/_embed/*'
 */
function configureServer(server: ViteDevServer) {
  server.middlewares.use('/_embed', async (req, res, next) => {
    const pathname = req.url && new URL(req.url, 'http://localhost/').pathname;
    const ext = pathname && path.parse(pathname).ext;
    if (ext === '' || ext === '.html') {
      const content = await fs.readFile(`${__dirname}/test/embed/index.html`);
      res.statusCode = 200;
      res.end(content);
    } else {
      next();
    }
  });
}

function replaceOrigin(origin?: string): Plugin {
  return ReplacePlugin({
    preventAssignment: true,
    values: {
      __STACKBLITZ_SERVER_ORIGIN__: JSON.stringify(origin),
    },
  });
}
