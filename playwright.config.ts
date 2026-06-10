import { defineConfig, devices } from '@playwright/test';

const testPort = process.env.TREESEED_UI_TEST_PORT ?? '4322';
const baseURL = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1,
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${testPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
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
