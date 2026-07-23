import type { BuiltInColorSchemeDefinition, ResolvedTreeseedThemeConfig, ThemePreference, TreeseedColorSchemeId, TreeseedColorSchemeSummary, TreeseedSchemeTokens, TreeseedSemanticColorTokens, TreeseedThemeConfig, TreeseedThemeMode } from ".././types.ts";
import { builtInColorSchemes, loadTreeseedColorSchemes, normalizeSchemeId } from './built-in-scheme-yaml.ts';
import { DEFAULT_MODE, DEFAULT_SCHEME, THEME_MODES } from './default-scheme.ts';

export function defineTreeseedTheme(options: {
  schemeDirectories?: string[];
  cwd?: string;
  defaultScheme?: TreeseedColorSchemeId;
  defaultMode?: TreeseedThemeMode;
  schemes?: TreeseedThemeConfig['schemes'];
} = {}): TreeseedThemeConfig {
  const discovered = options.schemeDirectories?.length
    ? loadTreeseedColorSchemes({ directories: options.schemeDirectories, cwd: options.cwd })
    : builtInColorSchemes();
  const schemes = Object.fromEntries(discovered.map((scheme) => [scheme.id, scheme.tokens])) as TreeseedThemeConfig['schemes'];
  return {
    defaultScheme: options.defaultScheme,
    defaultMode: options.defaultMode,
    schemes: {
      ...schemes,
      ...(options.schemes ?? {}),
    },
  };
}

export function mergeTokens(base: TreeseedSemanticColorTokens, override?: Partial<TreeseedSemanticColorTokens>) {
  return {
    ...base,
    ...(override ?? {}),
  };
}

export function mergeScheme(
  base: TreeseedSchemeTokens,
  override?: Partial<{ light: Partial<TreeseedSemanticColorTokens>; dark: Partial<TreeseedSemanticColorTokens> }>,
): TreeseedSchemeTokens {
  return {
    light: mergeTokens(base.light, override?.light),
    dark: mergeTokens(base.dark, override?.dark),
  };
}

export function cssVariableName(tokenName: string) {
  return `--ts-color-${tokenName.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
}

export function buildTokenDeclarations(tokens: TreeseedSemanticColorTokens) {
  return Object.entries(tokens)
    .map(([tokenName, value]) => `\t${cssVariableName(tokenName)}: ${value};`)
    .join('\n');
}

export function schemeSelector(schemeId: string, mode: 'light' | 'dark') {
  return `html[data-ts-scheme="${schemeId}"][data-ts-mode="${mode}"]`;
}

export function systemSchemeSelector(schemeId: string) {
  return `html[data-ts-scheme="${schemeId}"][data-ts-mode="system"]`;
}

export function summariesFromDefinitions(definitions: BuiltInColorSchemeDefinition[]): TreeseedColorSchemeSummary[] {
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

export function resolveTreeseedThemeConfig(input?: TreeseedThemeConfig): ResolvedTreeseedThemeConfig {
  const definitions = builtInColorSchemes();
  const schemes = Object.fromEntries(definitions.map((scheme) => [scheme.id, scheme.tokens])) as Record<TreeseedColorSchemeId, TreeseedSchemeTokens>;
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
      id: schemeId as TreeseedColorSchemeId,
      name: schemeId
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
    mode: typeof (record.mode ?? record.themeMode) === 'string' && THEME_MODES.has((record.mode ?? record.themeMode) as TreeseedThemeMode)
      ? (record.mode ?? record.themeMode) as TreeseedThemeMode
      : DEFAULT_MODE,
  };
}

export function buildTreeseedThemeCss(input?: TreeseedThemeConfig) {
  const resolved = resolveTreeseedThemeConfig(input);
  const defaultTokens = resolved.schemes[resolved.defaultScheme][resolved.defaultMode === 'dark' ? 'dark' : 'light'];
  const darkDefaultTokens = resolved.schemes[resolved.defaultScheme].dark;
  const blocks = [
    `:root {\n${buildTokenDeclarations(defaultTokens)}\n\tcolor-scheme: ${resolved.defaultMode === 'dark' ? 'dark' : 'light'};\n}`,
  ];

  if (resolved.defaultMode === 'system') {
    blocks.push(`@media (prefers-color-scheme: dark) {\n\t:root {\n${buildTokenDeclarations(darkDefaultTokens).replaceAll('\n', '\n\t')}\n\t\tcolor-scheme: dark;\n\t}\n}`);
  }

  for (const [schemeId, scheme] of Object.entries(resolved.schemes)) {
    blocks.push(`${schemeSelector(schemeId, 'light')},\n${systemSchemeSelector(schemeId)} {\n${buildTokenDeclarations(scheme.light)}\n\tcolor-scheme: light;\n}`);
    blocks.push(`${schemeSelector(schemeId, 'dark')} {\n${buildTokenDeclarations(scheme.dark)}\n\tcolor-scheme: dark;\n}`);
    blocks.push(`@media (prefers-color-scheme: dark) {\n\t${systemSchemeSelector(schemeId)} {\n${buildTokenDeclarations(scheme.dark).replaceAll('\n', '\n\t')}\n\t\tcolor-scheme: dark;\n\t}\n}`);
  }

  return `${blocks.join('\n\n')}\n`;
}
