import ReplacePlugin from '@rollup/plugin-replace';
import bodyParser from 'body-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, UserConfig, ViteDevServer } from 'vite';
import { defineConfig } from 'vite';
import TSConfigPaths from 'vite-tsconfig-paths';

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
      minify: 'esbuild',
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
    esbuild: {
      // Whitespace will not be minified for our ESM build (sdk.m.js)
      // because of this restriction in Vite's esbuild plugin:
      // https://github.com/vitejs/vite/blob/2219427f4224d75f63a1e1a0af61b32c7854604e/packages/vite/src/node/plugins/esbuild.ts#L348-L351
      // Instead of having mixed minified and unminified bundles, let’s ship
      // unminified bundles because they’re small enough (especially gzipped).
      minifyIdentifiers: false,
      minifySyntax: false,
      minifyWhitespace: false,
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

function replaceOrigin(origin?: string): Plugin {
  return ReplacePlugin({
    preventAssignment: true,
    values: {
      __STACKBLITZ_SERVER_ORIGIN__: JSON.stringify(origin),
    },
  });
}

/**
 * Serve a custom HTML page for requests to '/_embed/*'
 */
function configureServer(server: ViteDevServer) {
  // Parse URL-encoded form data in POST requests
  server.middlewares.use(bodyParser.urlencoded({ extended: true }));

  server.middlewares.use('/_embed', async (req, res, next) => {
    const pathname = req.url && new URL(req.url, 'http://localhost/').pathname;
    const ext = pathname && path.parse(pathname).ext;

    if (ext === '' || ext === '.html') {
      const content = await fs.readFile(`${__dirname}/test/embed/index.html`);
      const html = content.toString().replace('{{PROJECT_DATA}}', getProjectDataString(req));
      res.statusCode = 200;
      res.end(html);
    } else {
      next();
    }
  });
}

function getProjectDataString(req: any): string {
  if (req.method === 'POST' && req.body?.project) {
    const project = {
      ...req.body.project,
    };

    if (typeof project.settings === 'string') {
      project.settings = JSON.parse(project.settings);
    }

    return JSON.stringify(project, null, 2);
  }

  return 'null';
}
