import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

function astroFiles(root: string): string[] {
	return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
		const path = join(root, entry.name);
		return entry.isDirectory() ? astroFiles(path) : path.endsWith('.astro') ? [path] : [];
	});
}

describe('Astro island request ownership', () => {
	it('keeps production browser requests out of Astro component scripts', () => {
		const exceptions = new Set(['src/astro/core/DevWatchReload.astro']);
		const violations = astroFiles('src/astro').flatMap((path) => {
			const source = readFileSync(path, 'utf8');
			const browserSource = source.split('---').slice(2).join('---');
			return !exceptions.has(relative('.', path)) && /\b(?:fetch|XMLHttpRequest|EventSource)\b|new\s+WebSocket\b/u.test(browserSource)
				? [relative('.', path)] : [];
		});
		expect(violations, 'post-load requests belong to lifecycle-managed client islands').toEqual([]);
	});

	it('hydrates request controllers only where their server-rendered UI needs them', () => {
		for (const [path, directive] of [
			['src/astro/auth/RegistrationForm.astro', 'client:load'],
			['src/astro/auth/UsernameClaimForm.astro', 'client:load'],
			['src/astro/site/content/BookList.astro', 'client:visible'],
			['src/astro/workflow/WorkflowExecutionPanel.astro', 'client:visible'],
			['src/astro/forms/fields/MarkdownField.astro', 'client:visible'],
			['src/astro/layouts/AppLayout.astro', 'client:load'],
			['src/astro/shell/layout/ShellFrame.astro', 'transition:persist="session-connection"'],
		] as const) expect(readFileSync(path, 'utf8'), path).toContain(directive);
	});

	it('persists Discussion and keeps the session network lifecycle in a client island', () => {
		expect(readFileSync('src/astro/discussion/DiscussionPanel.astro', 'utf8')).toContain('transition:persist="shell-discussion"');
		const island = readFileSync('src/react/progressive/SessionConnectionIsland.tsx', 'utf8');
		expect(island).toContain('new EventSource');
		expect(island).toContain("sessionStorage.setItem(cursorKey(teamId)");
		expect(island).toContain("CustomEvent('treeseed:session-event'");
	});
});
