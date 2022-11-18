import { resolve } from 'node:path';
import TSConfigPaths from 'vite-tsconfig-paths';
import { UserConfig } from 'vitest/config';

const config: UserConfig = {
  plugins: [
    TSConfigPaths({
      loose: true, // allow aliases in .html files
      projects: [resolve(__dirname, 'tsconfig.test.json')],
    }),
  ],
  build: {
    target: 'es2020',
    outDir: './temp/test-build',
  },
  envPrefix: 'TEST_',
  server: {
    port: 4000,
  },
  test: {
    globals: false,
    include: ['**/test/unit/**/*.spec.ts'],
    exclude: ['**/node_modules/**'],
    coverage: {
      provider: 'c8',
      include: ['**/src/**/*.ts', '**/test/server/**/*.ts'],
      exclude: ['**/node_modules/**'],
      reportsDirectory: './temp/coverage',
    },
  },
};

export default config;
