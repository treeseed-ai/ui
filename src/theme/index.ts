import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { completeTokens } from './color-schemes/shared.ts';
import type {
  BuiltInColorSchemeDefinition,
  RawYamlColorScheme,
  RequiredSchemeTokenInput,
  ResolvedTreeseedThemeConfig,
  ThemePreference,
  TreeseedColorSchemeId,
  TreeseedColorSchemeSummary,
  TreeseedSchemeTokens,
  TreeseedSemanticColorTokens,
  TreeseedThemeConfig,
  TreeseedThemeMode,
} from './types.ts';

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
} from './types.ts';

const DEFAULT_SCHEME: TreeseedColorSchemeId = 'fern';
const DEFAULT_MODE: TreeseedThemeMode = 'system';
const THEME_MODES = new Set<TreeseedThemeMode>(['light', 'dark', 'system']);
const REQUIRED_TOKEN_KEYS = [
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

let cachedBuiltIns: BuiltInColorSchemeDefinition[] | null = null;

function packageRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..');
}

function builtInSchemeDirectory() {
  const distPath = resolve(packageRoot(), 'theme', 'schemes');
  if (existsSync(distPath)) return distPath;
  return resolve(process.cwd(), 'src', 'theme', 'schemes');
}

function normalizeSchemeId(value: unknown, fallback: TreeseedColorSchemeId) {
  return typeof value === 'string' && /^[a-z][a-z0-9-]*$/u.test(value) ? value as TreeseedColorSchemeId : fallback;
}

function assertSchemeId(value: unknown, filePath: string): asserts value is string {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/u.test(value)) {
    throw new Error(`Invalid color scheme id in ${filePath}. Use lowercase kebab-case starting with a letter.`);
  }
}

function assertTokenMap(value: unknown, mode: 'light' | 'dark', filePath: string): RequiredSchemeTokenInput {
  if (!value || typeof value !== 'object') {
    throw new Error(`Color scheme ${filePath} must define a ${mode} token map.`);
  }
  const record = value as Record<string, unknown>;
  const missing = REQUIRED_TOKEN_KEYS.filter((key) => typeof record[key] !== 'string' || !record[key]);
  if (missing.length > 0) {
    throw new Error(`Color scheme ${filePath} is missing ${mode} tokens: ${missing.join(', ')}.`);
  }
  return Object.fromEntries(REQUIRED_TOKEN_KEYS.map((key) => [key, record[key]])) as RequiredSchemeTokenInput;
}

function defaultSwatches(tokens: TreeseedSchemeTokens) {
  return [tokens.light.accent, tokens.light.accentStrong, tokens.light.surface, tokens.light.text];
}

export function parseTreeseedColorSchemeYaml(source: string, filePath = 'inline YAML'): BuiltInColorSchemeDefinition {
  const parsed = YAML.parse(source) as RawYamlColorScheme | null;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Color scheme ${filePath} must be a YAML mapping.`);
  }
  assertSchemeId(parsed.id, filePath);
  const light = completeTokens(assertTokenMap(parsed.light, 'light', filePath), 'light');
  const dark = completeTokens(assertTokenMap(parsed.dark, 'dark', filePath), 'dark');
  const tokens = { light, dark };
  const swatches = Array.isArray(parsed.swatches) && parsed.swatches.every((value) => typeof value === 'string')
    ? parsed.swatches.slice(0, 4)
    : defaultSwatches(tokens);

  return {
    id: parsed.id as TreeseedColorSchemeId,
    name: parsed.name || parsed.id.split('-').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' '),
    swatches,
    modeSwatches: {
      light: [light.accent, light.accentStrong, light.surface, light.text],
      dark: [dark.accent, dark.accentStrong, dark.surface, dark.text],
    },
    tokens,
  };
}

function yamlFilesInDirectory(directory: string) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ya?ml)$/iu.test(entry.name))
    .map((entry) => resolve(directory, entry.name))
    .sort();
}

export function loadTreeseedColorSchemes(options: { directories?: string[]; cwd?: string } = {}) {
  const cwd = options.cwd ?? process.cwd();
  const directories = [builtInSchemeDirectory(), ...(options.directories ?? []).map((directory) => resolve(cwd, directory))];
  const schemes = new Map<string, BuiltInColorSchemeDefinition>();

  for (const directory of directories) {
    for (const filePath of yamlFilesInDirectory(directory)) {
      const scheme = parseTreeseedColorSchemeYaml(readFileSync(filePath, 'utf8'), filePath);
      if (schemes.has(scheme.id)) {
        throw new Error(`Duplicate TreeSeed color scheme id "${scheme.id}" found in ${filePath}.`);
      }
      schemes.set(scheme.id, scheme);
    }
  }

  return Array.from(schemes.values());
}

function builtInColorSchemes() {
  cachedBuiltIns ??= loadTreeseedColorSchemes();
  return cachedBuiltIns;
}

export function defineTreeseedTheme(options: {
  schemeDirectories?: string[];
  cwd?: string;
  defaultScheme?: TreeseedColorSchemeId;
  defaultMode?: TreeseedThemeMode;
  schemes?: TreeseedThemeConfig['schemes'];
} = {}): TreeseedThemeConfig {
  const discovered = loadTreeseedColorSchemes({ directories: options.schemeDirectories, cwd: options.cwd });
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

function mergeTokens(base: TreeseedSemanticColorTokens, override?: Partial<TreeseedSemanticColorTokens>) {
  return {
    ...base,
    ...(override ?? {}),
  };
}

function mergeScheme(
  base: TreeseedSchemeTokens,
  override?: Partial<{ light: Partial<TreeseedSemanticColorTokens>; dark: Partial<TreeseedSemanticColorTokens> }>,
): TreeseedSchemeTokens {
  return {
    light: mergeTokens(base.light, override?.light),
    dark: mergeTokens(base.dark, override?.dark),
  };
}

function cssVariableName(tokenName: string) {
  return `--ts-color-${tokenName.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
}

function buildTokenDeclarations(tokens: TreeseedSemanticColorTokens) {
  return Object.entries(tokens)
    .map(([tokenName, value]) => `\t${cssVariableName(tokenName)}: ${value};`)
    .join('\n');
}

function schemeSelector(schemeId: string, mode: 'light' | 'dark') {
  return `html[data-ts-scheme="${schemeId}"][data-ts-mode="${mode}"]`;
}

function systemSchemeSelector(schemeId: string) {
  return `html[data-ts-scheme="${schemeId}"][data-ts-mode="system"]`;
}

function summariesFromDefinitions(definitions: BuiltInColorSchemeDefinition[]): TreeseedColorSchemeSummary[] {
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
