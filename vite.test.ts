import { resolve } from 'node:path';
import TSConfigPaths from 'vite-tsconfig-paths';
import { UserConfig } from 'vitest/config';

const config: UserConfig = {
  root: './test',
  plugins: [
    TSConfigPaths({
      loose: true, // allow aliases in .html files
      root: resolve(__dirname, 'test'),
    }),
  ],
  build: {
    target: 'es2020',
    outDir: '../temp/test-build',
  },
  envPrefix: 'TEST_',
  server: {
    port: 4000,
  },
  test: {
    globals: false,
    include: ['**/unit/**/*.spec.ts'],
    exclude: ['**/node_modules/**'],
    coverage: {
      provider: 'c8',
      include: ['**/src/**/*.ts', '**/server/**/*.ts'],
      exclude: ['**/node_modules/**'],
      reportsDirectory: '../temp/coverage',
    },
  },
};

export default config;
