import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('account form layout', () => {
	it('uses explicit account-owned field groups instead of generic form grids', () => {
		const identity = read('src/astro/account/AccountIdentitySettings.astro');
		const appearance = read('src/astro/account/PersonalThemeManager.astro');
		const deletion = read('src/astro/account/AccountDeletionPanel.astro');
		const timeZone = read('src/astro/account/AccountTimeZoneSettings.astro');

		for (const source of [identity, appearance, deletion]) {
			expect(source).toContain('account-form');
			expect(source).not.toContain('class="ts-form-grid"');
			expect(source).not.toContain('class="ts-stack"');
		}
		expect(identity).toContain('data-account-field-group="name"');
		expect(identity).toContain('data-account-field-group="public-profile"');
		expect(identity).toContain('<PasswordSetupFields');
		expect(identity).toContain('class="account-password-setup"');
		expect(appearance).toContain('account-palette-group');
		expect(appearance).toContain('account-color-grid');
		expect(appearance).toContain('data-built-in-theme-table');
		expect(appearance).toContain('data-personal-theme-builder');
		expect(appearance).toContain('data-personal-theme-base');
		expect(appearance).toContain('data-theme-color-value');
		expect(appearance).toContain('guidedThemePaletteForScheme');
		expect(appearance).not.toContain('class="ts-choice-grid"');
		expect(timeZone).toContain('data-scene="account-time-zone"');
		expect(timeZone).toContain('name="timeZone"');
	});

	it('keeps every account surface on the same spaced panel contract', () => {
		for (const path of [
			'src/astro/account/AccountDeletionPanel.astro',
			'src/astro/account/AccountIdentitySettings.astro',
			'src/astro/account/NotificationPreferencePanel.astro',
			'src/astro/account/PersonalThemeManager.astro',
			'src/astro/account/SessionManager.astro',
		]) {
			expect(read(path), path).toContain('account-stack');
		}

		const css = read('src/styles/account/forms.css');
		expect(css).toMatch(/\.account-stack\s*\{[^}]*gap: var\(--ts-space-4\);/su);
		expect(css).toContain('--ts-account-form-column-gap: clamp(var(--ts-space-4), 2vw, 1.5rem);');
		expect(css).toMatch(/\.account-form,\s*\.account-list\s*\{[^}]*padding-block: var\(--ts-space-1\);[^}]*padding-inline: var\(--ts-space-2\);/su);
		expect(css).toMatch(/\.account-field-row\s*\{[^}]*align-items: start;[^}]*column-gap: var\(--ts-account-form-column-gap\);[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/su);
		expect(css).toMatch(/\.account-color-grid\s*\{[^}]*column-gap: var\(--ts-account-form-column-gap\);/su);
		expect(css).toMatch(/@media \(max-width: 42rem\)[^{]*\{[\s\S]*?\.account-field-row,[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/u);
	});

	it('stacks project content notification choices vertically', () => {
		const notifications = read('src/astro/account/NotificationPreferencePanel.astro');
		const css = read('src/styles/account/forms.css');

		expect(notifications).toContain('data-notification-content-choices');
		expect(notifications).toContain('data-orientation="vertical"');
		expect(notifications).toContain('data-notification-project-toggle');
		expect(notifications).toContain('data-notification-project-override');
		expect(notifications).toContain('disclosure.open = toggle.checked');
		expect(notifications).toContain('capability.description');
		expect(notifications).toContain("'treeseed:content-updated'");
		expect(notifications).not.toContain('class="ts-choice-grid"');
		expect(css).toMatch(/\.account-notification-choice-list\s*\{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\);/su);
		expect(css).toMatch(/\.account-notification-choice\s*\{[^}]*grid-template-columns: auto minmax\(0, 1fr\);/su);
		expect(css).toMatch(/\.account-notification-project\[open\]\s*\{[^}]*border-color: var\(--ts-color-accent\);/su);
	});
});
