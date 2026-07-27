import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(root: string): string[] {
	return readdirSync(root).flatMap((name) => {
		const path = join(root, name);
		if (statSync(path).isDirectory()) return sourceFiles(path);
		return /\.(?:astro|ts|tsx)$/u.test(path) ? [path] : [];
	});
}

describe('canonical form transport ownership', () => {
	it('keeps mutation fetches inside the shared transport or registered adapters', () => {
		const allowed = new Set([
			'src/lib/forms/submission/submission.ts',
			'src/lib/app/markdown-field.ts',
			'src/astro/forms/composition/markdown-field.ts',
			'src/astro/forms/fields/MarkdownField.astro',
			'src/astro/app/controls/content/MarkdownField.astro',
			'src/react/charts/MonitoringChart/metric-key.tsx',
		]);
		const violations = sourceFiles('src')
			.map((path) => ({
				path: relative('.', path),
				source: readFileSync(path, 'utf8'),
			}))
			.filter(({ path, source }) => !allowed.has(path)
				&& /\bfetch\s*\([^)]*[\s\S]{0,300}\bmethod\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/u.test(source))
			.map(({ path }) => path);

		expect(violations, 'network mutations must use submitForm, sendFormRequest, or an adapter').toEqual([]);
	});

	it('marks first-party network forms for delegated enhancement', () => {
		const consumers = [
			'src/astro/account/AccountDeletionPanel.astro',
			'src/astro/account/AccountIdentitySettings.astro',
			'src/astro/account/NotificationPreferencePanel.astro',
			'src/astro/account/PersonalThemeManager.astro',
			'src/astro/account/SessionManager.astro',
			'src/astro/auth/RegistrationForm.astro',
			'src/astro/auth/UsernameClaimForm.astro',
			'src/astro/feedback/FeedbackDialog.astro',
			'src/astro/forms/ContactForm.astro',
			'src/astro/forms/submission/FooterSubscribeForm.astro',
		];

		for (const path of consumers) {
			expect(readFileSync(path, 'utf8'), path).toContain('data-ts-submit="enhanced"');
		}
	});

	it('shares one secure token and Turnstile initializer', () => {
		const contact = readFileSync('src/astro/forms/ContactForm.astro', 'utf8');
		const subscription = readFileSync('src/astro/forms/submission/FooterSubscribeForm.astro', 'utf8');
		for (const source of [contact, subscription]) {
			expect(source).toContain('data-ts-secure-form');
			expect(source).toContain('secure-form.ts');
			expect(source).not.toMatch(/\bfetch\s*\(/u);
			expect(source).not.toContain('bootSecureForms');
		}
	});
});
