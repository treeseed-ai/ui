import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const packageRoot = process.cwd();
const npmCacheDir = mkdtempSync(join(tmpdir(), 'treeseed-ui-npm-cache-'));
const packDir = mkdtempSync(join(tmpdir(), 'treeseed-ui-pack-'));
const smokeDir = mkdtempSync(join(tmpdir(), 'treeseed-ui-smoke-'));
const gitSourceDir = mkdtempSync(join(tmpdir(), 'treeseed-ui-git-source-'));
const gitSmokeDir = mkdtempSync(join(tmpdir(), 'treeseed-ui-git-smoke-'));

const packageJsonPath = resolve(packageRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name ?? '@treeseed/ui';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? packageRoot,
    stdio: options.stdio ?? 'inherit',
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
      NPM_CONFIG_CACHE: npmCacheDir,
      ...options.env,
    },
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  return result;
}

function assertNoLocalDependencyLinks() {
  for (const sectionName of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [dependencyName, version] of Object.entries(packageJson[sectionName] ?? {})) {
      if (typeof version === 'string' && (version.startsWith('workspace:') || version.startsWith('file:'))) {
        throw new Error(`package.json ${sectionName}.${dependencyName} must not use local dependency specifiers: ${version}`);
      }
    }
  }

  const lockfile = JSON.parse(readFileSync(resolve(packageRoot, 'package-lock.json'), 'utf8'));
  for (const [entryKey, entryValue] of Object.entries(lockfile.packages ?? {})) {
    if (entryKey.startsWith('../') || entryKey.includes('/../')) {
      throw new Error(`package-lock.json contains forbidden local package entry: ${entryKey}`);
    }
    if (entryValue.link) {
      throw new Error(`package-lock.json contains forbidden linked dependency entry: ${entryKey}`);
    }
    const resolved = entryValue.resolved ?? '';
    if (
      resolved.startsWith('../')
      || resolved.startsWith('./')
      || resolved.startsWith('file:')
      || resolved.startsWith('workspace:')
    ) {
      throw new Error(`package-lock.json contains forbidden local resolution for ${entryKey}: ${resolved}`);
    }
  }
}

function exportTargetFiles(exportsMap = packageJson.exports) {
  const targets = new Set();

  function collect(value) {
    if (typeof value === 'string') {
      if (!value.includes('*')) targets.add(value);
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const nestedValue of Object.values(value)) {
      collect(nestedValue);
    }
  }

  collect(exportsMap);
  return [...targets].sort();
}

async function assertExportTargetsExist() {
  for (const target of exportTargetFiles()) {
    await access(resolve(packageRoot, target));
  }
}

function assertTarballContents(packResult) {
  const files = new Set(packResult.files.map((file) => file.path));
  const requiredFiles = [
    'package.json',
    'README.md',
    'dist/index.js',
    'dist/index.d.ts',
    'dist/react.js',
    'dist/react.d.ts',
    'dist/theme/index.js',
    'dist/theme/index.d.ts',
    'dist/styles/tokens.css',
    'dist/styles/theme.css',
    'dist/styles/ui.css',
    'dist/styles/forms.css',
    'dist/astro/forms/Button.astro',
    'dist/astro/forms/MarkdownField.astro',
    'dist/astro/shell/AppShell.astro',
    'dist/react/pie-allocation/DynamicPieAllocationInput.js',
    'dist/react/charts/MonitoringChart.js',
    'dist/react/editors/RichMarkdownEditor.js',
    'dist/theme/schemes/fern.yaml',
  ];

  for (const file of requiredFiles) {
    if (!files.has(file)) {
      throw new Error(`Package tarball is missing required file: ${file}`);
    }
  }

  for (const file of files) {
    if (file.startsWith('src/') || file.startsWith('sandbox/') || file.startsWith('tests/') || file.startsWith('.github/')) {
      throw new Error(`Package tarball includes unpublished source/test artifact: ${file}`);
    }
  }
}

function packPackage() {
  const result = run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', packDir], { stdio: 'pipe' });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const parsed = JSON.parse(output);
  const packResult = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!packResult?.filename) {
    throw new Error(`Unable to parse npm pack output: ${output}`);
  }
  assertTarballContents(packResult);
  return resolve(packDir, packResult.filename);
}

async function smokeInstall(tarballPath) {
  writeFileSync(resolve(smokeDir, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
  }, null, 2));

  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarballPath], { cwd: smokeDir });

  const smokeScript = `
    import { access, readFile } from 'node:fs/promises';
    import { resolve } from 'node:path';
    import { defineTreeseedTheme, getBuiltInColorSchemes } from '@treeseed/ui/theme';
    import { normalizeAllocations } from '@treeseed/ui/lib/pie-allocation';

    const packageRoot = resolve('node_modules', '${packageName}');
    await access(resolve(packageRoot, 'dist/styles/theme.css'));
    await access(resolve(packageRoot, 'dist/astro/forms/Button.astro'));
    await access(resolve(packageRoot, 'dist/theme/schemes/fern.yaml'));
    const schemes = getBuiltInColorSchemes();
    if (!schemes.some((scheme) => scheme.id === 'fern')) {
      throw new Error('Installed package did not expose built-in fern color scheme.');
    }
    const theme = defineTreeseedTheme({ defaultScheme: 'fern', defaultMode: 'system' });
    if (!theme.schemes?.fern) {
      throw new Error('Installed package did not build a fern theme config.');
    }
    const normalized = normalizeAllocations([{ id: 'a', name: 'A', percentage: 100 }], 0, 0);
    if (normalized[0]?.percentage !== 100) {
      throw new Error('Installed package pie allocation export failed.');
    }
    await readFile(resolve(packageRoot, 'dist/styles/ui.css'), 'utf8');
  `;

  run(process.execPath, ['--input-type=module', '-e', smokeScript], { cwd: smokeDir });
}

function createGitDependencyFixture() {
  const copiedPaths = [
    'package.json',
    'package-lock.json',
    'README.md',
    'tsconfig.json',
    'vite.config.ts',
    'scripts',
    'src',
  ];

  for (const copiedPath of copiedPaths) {
    cpSync(resolve(packageRoot, copiedPath), resolve(gitSourceDir, copiedPath), {
      recursive: true,
      dereference: true,
    });
  }

  mkdirSync(resolve(gitSourceDir, 'dist'), { recursive: true });
  rmSync(resolve(gitSourceDir, 'dist'), { recursive: true, force: true });

  run('git', ['init', '--initial-branch=main'], { cwd: gitSourceDir, stdio: 'pipe' });
  run('git', ['config', 'user.email', 'release-smoke@treeseed.local'], { cwd: gitSourceDir, stdio: 'pipe' });
  run('git', ['config', 'user.name', 'Treeseed Release Smoke'], { cwd: gitSourceDir, stdio: 'pipe' });
  run('git', ['add', '-A'], { cwd: gitSourceDir, stdio: 'pipe' });
  run('git', ['commit', '-m', 'release smoke'], { cwd: gitSourceDir, stdio: 'pipe' });
  run('git', ['tag', 'release-smoke'], { cwd: gitSourceDir, stdio: 'pipe' });
}

async function smokeInstallGitDependency() {
  createGitDependencyFixture();

  writeFileSync(resolve(gitSmokeDir, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
  }, null, 2));

  run('npm', ['install', '--no-audit', '--no-fund', `git+file://${gitSourceDir}#release-smoke`], { cwd: gitSmokeDir });

  const packageInstallRoot = resolve(gitSmokeDir, 'node_modules', packageName);
  await access(resolve(packageInstallRoot, 'dist/astro/docs/Footer.astro'));
  await access(resolve(packageInstallRoot, 'dist/astro/site/Hero.astro'));
  await access(resolve(packageInstallRoot, 'dist/styles/theme.css'));

  const smokeScript = `
    import { access } from 'node:fs/promises';
    import { resolve } from 'node:path';
    import { getBuiltInColorSchemes } from '@treeseed/ui/theme';

    const packageRoot = resolve('node_modules', '${packageName}');
    await access(resolve(packageRoot, 'dist/astro/docs/Footer.astro'));
    await access(resolve(packageRoot, 'dist/astro/docs/Header.astro'));
    await access(resolve(packageRoot, 'dist/astro/layouts/MainLayout.astro'));
    if (!getBuiltInColorSchemes().some((scheme) => scheme.id === 'fern')) {
      throw new Error('Git dependency install did not expose built-in color schemes.');
    }
  `;

  run(process.execPath, ['--input-type=module', '-e', smokeScript], { cwd: gitSmokeDir });
}

async function main() {
  try {
    assertNoLocalDependencyLinks();
    run('npm', ['run', 'check']);
    run('npm', ['run', 'test:unit']);
    run('npm', ['run', 'test:e2e']);
    run('npm', ['run', 'build']);
    await assertExportTargetsExist();
    const tarballPath = packPackage();
    await smokeInstall(tarballPath);
    await smokeInstallGitDependency();
  } finally {
    rmSync(npmCacheDir, { recursive: true, force: true });
    rmSync(packDir, { recursive: true, force: true });
    rmSync(smokeDir, { recursive: true, force: true });
    rmSync(gitSourceDir, { recursive: true, force: true });
    rmSync(gitSmokeDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
