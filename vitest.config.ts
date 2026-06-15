import { defineConfig } from 'vitest/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const testingLibraryReact = require.resolve('@testing-library/react');
const dependencyRoot = testingLibraryReact.slice(0, testingLibraryReact.indexOf('/node_modules/@testing-library/react'));

export default defineConfig({
  resolve: {
    alias: {
      react: `${dependencyRoot}/node_modules/react`,
      'react-dom': `${dependencyRoot}/node_modules/react-dom`,
      'react-dom/client': `${dependencyRoot}/node_modules/react-dom/client.js`,
      'react/jsx-runtime': `${dependencyRoot}/node_modules/react/jsx-runtime.js`,
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
