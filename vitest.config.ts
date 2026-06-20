import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const testingLibraryPath = dirname(require.resolve('@testing-library/react/package.json'));
const testReactPath = require.resolve('react', { paths: [testingLibraryPath] });
const testReactDomPath = require.resolve('react-dom', { paths: [testingLibraryPath] });
const testReactDomClientPath = require.resolve('react-dom/client', { paths: [testingLibraryPath] });
const testReactJsxRuntimePath = require.resolve('react/jsx-runtime', { paths: [testingLibraryPath] });
const testReactJsxDevRuntimePath = require.resolve('react/jsx-dev-runtime', { paths: [testingLibraryPath] });

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react$/, replacement: testReactPath },
      { find: /^react-dom$/, replacement: testReactDomPath },
      { find: /^react-dom\/client$/, replacement: testReactDomClientPath },
      { find: /^react\/jsx-runtime$/, replacement: testReactJsxRuntimePath },
      { find: /^react\/jsx-dev-runtime$/, replacement: testReactJsxDevRuntimePath },
    ],
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
