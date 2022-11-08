import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'bundles',
    emptyOutDir: true,
    minify: 'esbuild',
    sourcemap: true,
    lib: {
      name: 'StackBlitzSDK',
      entry: 'src/index.ts',
      formats: ['cjs', 'es', 'umd'],
      // Override the default file names used by Vite's “Library Mode”
      // (https://vitejs.dev/guide/build.html#library-mode) for backwards
      // compatibility with microbundle's output.
      fileName: (format, entryName) => {
        let suffix: string = '';
        if (format === 'es') suffix = '.m';
        if (format === 'umd') suffix = '.umd';
        return `sdk${suffix}.js`;
      },
    },
  },
  test: {
    globals: false,
    include: ['**/src/**/*.spec.ts', '**/test/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/bundles/**', '**/types/**'],
  },
});
