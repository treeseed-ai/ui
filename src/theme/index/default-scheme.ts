import { completeTokens } from '../color-schemes/shared.ts';
import type { BuiltInColorSchemeDefinition, RequiredSchemeTokenInput, TreeseedColorSchemeId, TreeseedSchemeTokens, TreeseedSemanticColorTokens, TreeseedThemeMode } from '../types.ts';
import { resolveTreeseedThemeConfig } from './define-treeseed-theme.ts';

export type {
  BuiltInColorSchemeDefinition,
  RequiredSchemeTokenInput,
  ResolvedTreeseedThemeConfig,
  ThemePreference,
  TreeseedColorSchemeId,
  TreeseedColorSchemeSummary,
  TreeseedSchemeTokens,
  TreeseedSemanticColorTokens,
  TreeseedThemeConfig,
  TreeseedThemeMode,
} from '.././types.ts';

export const DEFAULT_SCHEME: TreeseedColorSchemeId = 'fern';

export const DEFAULT_MODE: TreeseedThemeMode = 'system';

export const THEME_MODES = new Set<TreeseedThemeMode>(['light', 'dark', 'system']);

export const REQUIRED_TOKEN_KEYS = [
  'canvas',
  'canvasSubtle',
  'surface',
  'surfaceMuted',
  'surfaceRaised',
  'text',
  'textMuted',
  'border',
  'borderStrong',
  'accent',
  'accentHover',
  'accentStrong',
  'accentSoft',
  'info',
  'success',
  'warning',
  'danger',
] as const satisfies Array<keyof RequiredSchemeTokenInput>;

export const builtInSchemeCache: { definitions: BuiltInColorSchemeDefinition[] | null } = { definitions: null };

export interface GuidedThemePaletteMode {
	canvas: string;
	surface: string;
	text: string;
	accent: string;
}

export const TREESEED_PERSONAL_THEME_DEFAULT_PALETTE = {
	light: { canvas: '#f4f7f2', surface: '#ffffff', text: '#17211b', accent: '#2f6f4e' },
	dark: { canvas: '#101612', surface: '#18201a', text: '#e8f0e8', accent: '#8fcca7' },
} as const;

export interface GuidedThemePalette {
	light: GuidedThemePaletteMode;
	dark: GuidedThemePaletteMode;
}

export function hexRgb(value: string) {
	const match = /^#([0-9a-f]{6})$/iu.exec(value);
	if (!match) throw new Error(`Invalid theme color "${value}". Use a six-digit hex color.`);
	return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16));
}

export function mixHex(first: string, second: string, firstWeight: number) {
	const left = hexRgb(first);
	const right = hexRgb(second);
	const ratio = Math.max(0, Math.min(1, firstWeight));
	return `#${left.map((value, index) => Math.round(value * ratio + right[index] * (1 - ratio)).toString(16).padStart(2, '0')).join('')}`;
}

export function relativeLuminance(value: string) {
	const components = hexRgb(value).map((component) => component / 255).map((component) => component <= 0.03928 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4);
	return components[0] * 0.2126 + components[1] * 0.7152 + components[2] * 0.0722;
}

export function themeContrastRatio(first: string, second: string) {
	const values = [relativeLuminance(first), relativeLuminance(second)].sort((left, right) => right - left);
	return (values[0] + 0.05) / (values[1] + 0.05);
}

export function validateGuidedThemePalette(palette: GuidedThemePalette) {
	const errors: string[] = [];
	for (const mode of ['light', 'dark'] as const) {
		const colors = palette?.[mode];
		try {
			for (const key of ['canvas', 'surface', 'text', 'accent'] as const) hexRgb(colors?.[key]);
			if (themeContrastRatio(colors.text, colors.canvas) < 4.5) errors.push(`${mode} text must have at least 4.5:1 contrast against the canvas.`);
			if (themeContrastRatio(colors.text, colors.surface) < 4.5) errors.push(`${mode} text must have at least 4.5:1 contrast against surfaces.`);
		} catch (error) {
			errors.push(error instanceof Error ? error.message : `Invalid ${mode} palette.`);
		}
	}
	return { ok: errors.length === 0, errors };
}

export function compileGuidedThemePalette(palette: GuidedThemePalette, baseScheme: TreeseedColorSchemeId = DEFAULT_SCHEME): TreeseedSchemeTokens {
	const validation = validateGuidedThemePalette(palette);
	if (!validation.ok) throw new Error(validation.errors.join(' '));
	const resolved = resolveTreeseedThemeConfig({ defaultScheme: baseScheme });
	const base = resolved.schemes[baseScheme] ?? resolved.schemes[DEFAULT_SCHEME];
	const compile = (mode: 'light' | 'dark'): TreeseedSemanticColorTokens => {
		const colors = palette[mode];
		const source = base[mode];
		return completeTokens({
			canvas: colors.canvas,
			canvasSubtle: mixHex(colors.canvas, colors.surface, 0.72),
			surface: colors.surface,
			surfaceMuted: mixHex(colors.surface, colors.canvas, 0.72),
			surfaceRaised: mixHex(colors.surface, mode === 'dark' ? '#ffffff' : '#000000', mode === 'dark' ? 0.94 : 0.98),
			text: colors.text,
			textMuted: mixHex(colors.text, colors.canvas, mode === 'dark' ? 0.7 : 0.68),
			border: mixHex(colors.text, colors.canvas, mode === 'dark' ? 0.28 : 0.2),
			borderStrong: mixHex(colors.text, colors.canvas, mode === 'dark' ? 0.42 : 0.34),
			accent: colors.accent,
			accentHover: mixHex(colors.accent, colors.text, 0.82),
			accentStrong: mixHex(colors.accent, colors.text, 0.66),
			accentSoft: mixHex(colors.accent, colors.surface, mode === 'dark' ? 0.22 : 0.16),
			info: source.info,
			success: source.success,
			warning: source.warning,
			danger: source.danger,
		}, mode);
	};
	return { light: compile('light'), dark: compile('dark') };
}
