import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const semverTagPattern = /^\d+\.\d+\.\d+$/;
const packageJsonPath = resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const packageVersion = packageJson.version;
const packageName = packageJson.name ?? '@treeseed/ui';
const tagName = process.argv[2] || process.env.GITHUB_REF_NAME;

if (!tagName) {
  console.error('Release tag validation requires a tag name argument or GITHUB_REF_NAME.');
  process.exit(1);
}

if (!semverTagPattern.test(tagName)) {
  console.error(`Release tag "${tagName}" must use "{MAJOR}.{MINOR}.{PATCH}", for example "${packageVersion}".`);
  process.exit(1);
}

if (tagName !== packageVersion) {
  console.error(`Release tag version "${tagName}" does not match ${packageName} version "${packageVersion}".`);
  process.exit(1);
}

console.log(`Release tag "${tagName}" matches ${packageName} version "${packageVersion}".`);
