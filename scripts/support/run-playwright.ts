import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const packageJsonPath = require.resolve('@playwright/test/package.json');
const cliPath = resolve(dirname(packageJsonPath), 'cli.js');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [cliPath, ...args], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
