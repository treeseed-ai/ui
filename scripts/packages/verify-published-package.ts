import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { name: string; version: string };
const latest = execFileSync('npm', ['view', pkg.name, 'dist-tags.latest'], { encoding: 'utf8' }).trim();
if (process.env.EXPECTED_LATEST && latest !== process.env.EXPECTED_LATEST) throw new Error('Prerelease changed npm latest.');
const directory = mkdtempSync(join(tmpdir(), 'treeseed-ui-readback-'));
const packed = JSON.parse(execFileSync('npm', ['pack', `${pkg.name}@${pkg.version}`, '--json', '--pack-destination', directory], { encoding: 'utf8' })) as Array<{ filename: string }>;
const actual = createHash('sha256').update(readFileSync(join(directory, packed[0]!.filename))).digest('hex');
if (actual !== process.env.EXPECTED_SHA256) throw new Error(`Published package digest mismatch: ${actual}.`);
console.log(JSON.stringify({ ok: true, package: `${pkg.name}@${pkg.version}`, sha256: actual }));
