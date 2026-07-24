import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const codeExtensions = /\.(?:astro|cjs|js|jsx|mjs|svelte|ts|tsx|vue)$/u;
const excluded = new Set(['.astro', '.git', '.treeseed', 'build', 'coverage', 'dist', 'generated', 'node_modules', 'snapshots', 'vendor']);
const isExcluded = (path: string) => path.split('/').some((segment) => excluded.has(segment) || segment.startsWith('.treeseed-'));

function files(args: string[]) {
	const result = spawnSync('git', ['ls-files', '-z', ...args], { encoding: 'utf8' });
	if (result.status !== 0) throw new Error(result.stderr || 'Unable to enumerate repository files.');
	return result.stdout.split('\0').filter(Boolean);
}

const overLimit: Array<{ path: string; lines: number }> = [];
const aboveTarget: Array<{ path: string; lines: number }> = [];
for (const path of new Set([...files([]), ...files(['--others', '--exclude-standard'])])) {
	if (!existsSync(path) || !codeExtensions.test(path) || isExcluded(path)) continue;
	const lines = readFileSync(path, 'utf8').split(/\r?\n/u).length;
	if (lines > 500) overLimit.push({ path, lines });
	else if (lines > 350) aboveTarget.push({ path, lines });
}
if (aboveTarget.length) console.warn(`File-length target: ${aboveTarget.length} handwritten file(s) are above 350 lines but within the hard limit.`);
if (overLimit.length) {
	for (const entry of overLimit.sort((a, b) => b.lines - a.lines)) console.error(`${entry.lines} ${entry.path}`);
	process.exit(1);
}
console.log('File-length policy passed: no handwritten code exceeds 500 lines.');
