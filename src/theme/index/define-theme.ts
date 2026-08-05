import type { AppearancePreference, BuiltInColorSchemeDefinition, ResolvedThemeConfig, ThemePreference, ColorSchemeId, ColorSchemeSummary, SchemeTokens, SemanticColorTokens, ThemeConfig, ThemeMode, WorkspaceThemeMode, WorkspaceThemePreference } from "../types.ts";
import { builtInColorSchemes, loadColorSchemes, normalizeSchemeId } from './built-in-scheme-yaml.ts';
import { DEFAULT_MODE, DEFAULT_SCHEME, THEME_MODES } from './default-scheme.ts';

export function defineTheme(options: {
  schemeDirectories?: string[];
  cwd?: string;
  defaultScheme?: ColorSchemeId;
  defaultMode?: ThemeMode;
  schemes?: ThemeConfig['schemes'];
} = {}): ThemeConfig {
  const discovered = options.schemeDirectories?.length
    ? loadColorSchemes({ directories: options.schemeDirectories, cwd: options.cwd })
    : builtInColorSchemes();
  const schemes = Object.fromEntries(discovered.map((scheme) => [scheme.id, scheme.tokens])) as ThemeConfig['schemes'];
  return {
    defaultScheme: options.defaultScheme,
    defaultMode: options.defaultMode,
    schemes: {
      ...schemes,
      ...(options.schemes ?? {}),
    },
  };
}

export function mergeTokens(base: SemanticColorTokens, override?: Partial<SemanticColorTokens>) {
  return {
    ...base,
    ...(override ?? {}),
  };
}

export function mergeScheme(
  base: SchemeTokens,
  override?: Partial<{ light: Partial<SemanticColorTokens>; dark: Partial<SemanticColorTokens> }>,
): SchemeTokens {
  return {
    light: mergeTokens(base.light, override?.light),
    dark: mergeTokens(base.dark, override?.dark),
  };
}

export function cssVariableName(tokenName: string) {
  return `--ts-color-${tokenName.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
}

export function buildTokenDeclarations(tokens: SemanticColorTokens) {
  return Object.entries(tokens)
    .map(([tokenName, value]) => `\t${cssVariableName(tokenName)}: ${value};`)
    .join('\n');
}

function buildShellTokenDeclarations(tokens: SemanticColorTokens) {
  return Object.entries(tokens)
    .map(([tokenName, value]) => `\t--ts-shell-color-${tokenName.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}: ${value};`)
    .join('\n');
}

function buildRootTokenDeclarations(tokens: SemanticColorTokens) {
  return `${buildTokenDeclarations(tokens)}\n${buildShellTokenDeclarations(tokens)}`;
}

export function schemeSelector(schemeId: string, mode: 'light' | 'dark') {
  return `html[data-ts-scheme="${schemeId}"][data-ts-mode="${mode}"]`;
}

export function systemSchemeSelector(schemeId: string) {
  return `html[data-ts-scheme="${schemeId}"][data-ts-mode="system"]`;
}

export function summariesFromDefinitions(definitions: BuiltInColorSchemeDefinition[]): ColorSchemeSummary[] {
  return definitions.map((scheme) => ({
    id: scheme.id,
    name: scheme.name,
    swatches: [...scheme.swatches],
    modeSwatches: {
      light: [...scheme.modeSwatches.light],
      dark: [...scheme.modeSwatches.dark],
    },
  }));
}

export function getBuiltInColorSchemes() {
  return summariesFromDefinitions(builtInColorSchemes());
}

export function resolveThemeConfig(input?: ThemeConfig): ResolvedThemeConfig {
  const definitions = builtInColorSchemes();
  const schemes = Object.fromEntries(definitions.map((scheme) => [scheme.id, scheme.tokens])) as Record<ColorSchemeId, SchemeTokens>;
  const baseSummaries = summariesFromDefinitions(definitions);

  for (const [schemeId, scheme] of Object.entries(input?.schemes ?? {})) {
    const base = schemes[schemeId] ?? schemes[DEFAULT_SCHEME];
    schemes[schemeId] = mergeScheme(base, scheme);
  }

  const defaultScheme = normalizeSchemeId(input?.defaultScheme, DEFAULT_SCHEME);
  const resolvedDefaultScheme = schemes[defaultScheme] ? defaultScheme : DEFAULT_SCHEME;
  const defaultMode = input?.defaultMode && THEME_MODES.has(input.defaultMode) ? input.defaultMode : DEFAULT_MODE;
  const customSummaries = Object.keys(input?.schemes ?? {})
    .filter((schemeId) => !baseSummaries.some((summary) => summary.id === schemeId))
    .map((schemeId) => ({
      id: schemeId as ColorSchemeId,
      name: input?.schemeNames?.[schemeId] ?? schemeId
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      swatches: [
        schemes[schemeId].light.accent,
        schemes[schemeId].light.accentStrong,
        schemes[schemeId].light.surface,
        schemes[schemeId].light.text,
      ],
      modeSwatches: {
        light: [
          schemes[schemeId].light.accent,
          schemes[schemeId].light.accentStrong,
          schemes[schemeId].light.surface,
          schemes[schemeId].light.text,
        ],
        dark: [
          schemes[schemeId].dark.accent,
          schemes[schemeId].dark.accentStrong,
          schemes[schemeId].dark.surface,
          schemes[schemeId].dark.text,
        ],
      },
    }));

  return {
    defaultScheme: resolvedDefaultScheme,
    defaultMode,
    schemes,
    summaries: [...baseSummaries, ...customSummaries],
  };
}

export function normalizeThemePreference(input: unknown): ThemePreference {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  return {
    scheme: normalizeSchemeId(record.scheme ?? record.colorScheme, DEFAULT_SCHEME),
    mode: typeof (record.mode ?? record.themeMode) === 'string' && THEME_MODES.has((record.mode ?? record.themeMode) as ThemeMode)
      ? (record.mode ?? record.themeMode) as ThemeMode
      : DEFAULT_MODE,
  };
}

const WORKSPACE_THEME_MODES = new Set<WorkspaceThemeMode>(['inherit', 'light', 'dark', 'system']);

export function normalizeWorkspaceThemePreference(input: unknown, fallbackScheme: ColorSchemeId = DEFAULT_SCHEME): WorkspaceThemePreference {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const nested = record.workspace && typeof record.workspace === 'object'
    ? record.workspace as Record<string, unknown>
    : record;
  const mode = nested.mode ?? record.contentThemeOverlayMode;
  return {
    enabled: nested.enabled === true || nested.enabled === 'true' || record.contentThemeOverlayEnabled === true || record.contentThemeOverlayEnabled === 'true',
    scheme: normalizeSchemeId(nested.scheme ?? record.contentThemeOverlayScheme, fallbackScheme),
    mode: typeof mode === 'string' && WORKSPACE_THEME_MODES.has(mode as WorkspaceThemeMode)
      ? mode as WorkspaceThemeMode
      : 'inherit',
  };
}

export function normalizeAppearancePreference(input: unknown): AppearancePreference {
  const theme = normalizeThemePreference(input);
  return { ...theme, workspace: normalizeWorkspaceThemePreference(input, theme.scheme) };
}

const workspaceBackgroundTokens = new Set<keyof SemanticColorTokens>([
  'canvas', 'canvasSubtle', 'surface', 'surfaceMuted', 'surfaceRaised', 'surfaceOverlay',
  'accentSoft', 'infoSoft', 'successSoft', 'warningSoft', 'dangerSoft',
]);
const workspaceStructureTokens = new Set<keyof SemanticColorTokens>([
  'border', 'borderMuted', 'borderStrong', 'shadow', 'grid',
]);

function buildWorkspaceTokenDeclarations(tokens: SemanticColorTokens) {
  return Object.entries(tokens).map(([tokenName, value]) => {
    const key = tokenName as keyof SemanticColorTokens;
    const variable = cssVariableName(tokenName);
    const shellVariable = `--ts-shell-color-${tokenName.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
    if (workspaceBackgroundTokens.has(key)) return `\t${variable}: color-mix(in srgb, ${value} 70%, var(${shellVariable}) 30%);`;
    if (workspaceStructureTokens.has(key)) return `\t${variable}: color-mix(in srgb, ${value} 55%, var(${shellVariable}) 45%);`;
    return `\t${variable}: ${value};`;
  }).join('\n');
}

function workspaceSelectors(schemeId: string, mode: 'light' | 'dark') {
  const scope = `:where(.ts-control-surface,.ts-workspace-overlay-scope)[data-ts-workspace-theme="true"][data-ts-workspace-scheme="${schemeId}"]`;
  const explicit = `${scope}[data-ts-workspace-mode="${mode}"]`;
  const inherited = `html[data-ts-mode="${mode}"] ${scope}[data-ts-workspace-mode="inherit"]`;
  return { scope, explicit, inherited };
}

export function buildWorkspaceThemeCss(input?: ThemeConfig) {
  const resolved = resolveThemeConfig(input);
  const blocks: string[] = [];
  for (const [schemeId, scheme] of Object.entries(resolved.schemes)) {
    const light = workspaceSelectors(schemeId, 'light');
    const dark = workspaceSelectors(schemeId, 'dark');
    blocks.push(`${light.explicit},\n${light.inherited},\n${light.scope}[data-ts-workspace-mode="system"] {\n${buildWorkspaceTokenDeclarations(scheme.light)}\n\tcolor-scheme: light;\n}`);
    blocks.push(`${dark.explicit},\n${dark.inherited} {\n${buildWorkspaceTokenDeclarations(scheme.dark)}\n\tcolor-scheme: dark;\n}`);
    blocks.push(`@media (prefers-color-scheme: dark) {\n\t${dark.scope}[data-ts-workspace-mode="system"] {\n${buildWorkspaceTokenDeclarations(scheme.dark).replaceAll('\n', '\n\t')}\n\t\tcolor-scheme: dark;\n\t}\n}`);
  }
  return `${blocks.join('\n\n')}\n`;
}

export function buildThemeCss(input?: ThemeConfig) {
  const resolved = resolveThemeConfig(input);
  const defaultTokens = resolved.schemes[resolved.defaultScheme][resolved.defaultMode === 'dark' ? 'dark' : 'light'];
  const darkDefaultTokens = resolved.schemes[resolved.defaultScheme].dark;
  const blocks = [
    `:root {\n${buildRootTokenDeclarations(defaultTokens)}\n\tcolor-scheme: ${resolved.defaultMode === 'dark' ? 'dark' : 'light'};\n}`,
  ];

  if (resolved.defaultMode === 'system') {
    blocks.push(`@media (prefers-color-scheme: dark) {\n\t:root {\n${buildRootTokenDeclarations(darkDefaultTokens).replaceAll('\n', '\n\t')}\n\t\tcolor-scheme: dark;\n\t}\n}`);
  }

  for (const [schemeId, scheme] of Object.entries(resolved.schemes)) {
    blocks.push(`${schemeSelector(schemeId, 'light')},\n${systemSchemeSelector(schemeId)} {\n${buildRootTokenDeclarations(scheme.light)}\n\tcolor-scheme: light;\n}`);
    blocks.push(`${schemeSelector(schemeId, 'dark')} {\n${buildRootTokenDeclarations(scheme.dark)}\n\tcolor-scheme: dark;\n}`);
    blocks.push(`@media (prefers-color-scheme: dark) {\n\t${systemSchemeSelector(schemeId)} {\n${buildRootTokenDeclarations(scheme.dark).replaceAll('\n', '\n\t')}\n\t\tcolor-scheme: dark;\n\t}\n}`);
  }

  return `${blocks.join('\n\n')}\n${buildWorkspaceThemeCss(input)}`;
}
