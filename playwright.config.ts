import { defineConfig, devices } from '@playwright/test';
import { createHash } from 'node:crypto';

const worktreePortOffset = Number.parseInt(createHash('sha1').update(process.cwd()).digest('hex').slice(0, 4), 16) % 1000;
const testPort = process.env.TREESEED_UI_TEST_PORT ?? String(4322 + worktreePortOffset);
const baseURL = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1,
  webServer: {
    command: `npm run sandbox:build && npm run sandbox:serve -- --host 127.0.0.1 --port ${testPort}`,
    url: baseURL,
    reuseExistingServer: process.env.TREESEED_UI_REUSE_TEST_SERVER === '1',
    timeout: 120_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
