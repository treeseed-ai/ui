import YAML from 'yaml';
import { completeTokens } from ".././color-schemes/shared.ts";
import type { BuiltInColorSchemeDefinition, RawYamlColorScheme, RequiredSchemeTokenInput, TreeseedColorSchemeId, TreeseedSchemeTokens } from ".././types.ts";
import { REQUIRED_TOKEN_KEYS, builtInSchemeCache } from './default-scheme.ts';

export const BUILT_IN_SCHEME_YAML = [
  `id: cedar
name: Cedar Clay
light:
  canvas: "#f8f2e8"
  canvasSubtle: "#efe3d2"
  surface: "#fffdf8"
  surfaceMuted: "#efe3d2"
  surfaceRaised: "#fbf7ef"
  text: "#2d241c"
  textMuted: "#695746"
  border: "#dccdb8"
  borderStrong: "#bea98f"
  accent: "#b86b3c"
  accentHover: "#9a5731"
  accentStrong: "#7d4528"
  accentSoft: "#f1d9c8"
  info: "#557f84"
  success: "#5f7d45"
  warning: "#9a6a21"
  danger: "#a74435"
dark:
  canvas: "#181310"
  canvasSubtle: "#241b16"
  surface: "#241b16"
  surfaceMuted: "#2d2119"
  surfaceRaised: "#33261d"
  text: "#f1e7da"
  textMuted: "#c0ab98"
  border: "#49382b"
  borderStrong: "#655040"
  accent: "#d98c5f"
  accentHover: "#f0b184"
  accentStrong: "#ffc59c"
  accentSoft: "#3a241b"
  info: "#83b0b3"
  success: "#a1bf78"
  warning: "#ddb76b"
  danger: "#e88976"`,
  `id: fern
name: Fern Canopy
light:
  canvas: "#f3f7ef"
  canvasSubtle: "#e8efe1"
  surface: "#ffffff"
  surfaceMuted: "#e8efe1"
  surfaceRaised: "#fafcf7"
  text: "#1f2a20"
  textMuted: "#51604d"
  border: "#cdd8c6"
  borderStrong: "#aebca6"
  accent: "#4f7d4e"
  accentHover: "#3f6f3f"
  accentStrong: "#2f5a35"
  accentSoft: "#dcebd6"
  info: "#3a6f75"
  success: "#287243"
  warning: "#8a6a1f"
  danger: "#a23e35"
dark:
  canvas: "#11170f"
  canvasSubtle: "#172016"
  surface: "#172016"
  surfaceMuted: "#1e2b1b"
  surfaceRaised: "#223020"
  text: "#e8f0e3"
  textMuted: "#a8b6a2"
  border: "#344431"
  borderStrong: "#4d6048"
  accent: "#8bbb75"
  accentHover: "#a9d88e"
  accentStrong: "#b9e69e"
  accentSoft: "#20351f"
  info: "#7db9bd"
  success: "#81c784"
  warning: "#d6b45e"
  danger: "#e07a6f"`,
  `id: lichen
name: Lichen Stone
light:
  canvas: "#f4f5f1"
  canvasSubtle: "#e7ebe3"
  surface: "#ffffff"
  surfaceMuted: "#e7ebe3"
  surfaceRaised: "#fbfcf8"
  text: "#242923"
  textMuted: "#596057"
  border: "#d2d8cf"
  borderStrong: "#b7c0b2"
  accent: "#6f8b67"
  accentHover: "#5d7a56"
  accentStrong: "#4e6d49"
  accentSoft: "#e0eadc"
  info: "#607d83"
  success: "#537f54"
  warning: "#8a7140"
  danger: "#9d4c44"
dark:
  canvas: "#121614"
  canvasSubtle: "#1a201d"
  surface: "#1a201d"
  surfaceMuted: "#222a25"
  surfaceRaised: "#27302b"
  text: "#e7ece5"
  textMuted: "#a5aea4"
  border: "#38423c"
  borderStrong: "#515c55"
  accent: "#9ab48a"
  accentHover: "#bdd0ad"
  accentStrong: "#c9dbbd"
  accentSoft: "#243322"
  info: "#8fb1b4"
  success: "#94be8d"
  warning: "#d0b577"
  danger: "#db8579"`,
  `id: tidepool
name: Tidepool Dusk
light:
  canvas: "#eff7f5"
  canvasSubtle: "#dfecea"
  surface: "#ffffff"
  surfaceMuted: "#dfecea"
  surfaceRaised: "#f7fbfa"
  text: "#1d2928"
  textMuted: "#4f615f"
  border: "#c9d9d7"
  borderStrong: "#a9bfbc"
  accent: "#3f8582"
  accentHover: "#32726f"
  accentStrong: "#286462"
  accentSoft: "#d5ece9"
  info: "#4c7899"
  success: "#3d7b62"
  warning: "#8b6e2f"
  danger: "#a6453d"
dark:
  canvas: "#0f1718"
  canvasSubtle: "#162123"
  surface: "#162123"
  surfaceMuted: "#1c2b2d"
  surfaceRaised: "#223235"
  text: "#e2eeee"
  textMuted: "#9fb6b6"
  border: "#304649"
  borderStrong: "#496265"
  accent: "#73c5bd"
  accentHover: "#a2e1d9"
  accentStrong: "#b8eee8"
  accentSoft: "#1c3838"
  info: "#8bbce5"
  success: "#7cc6a1"
  warning: "#d3b66a"
  danger: "#e28074"`,
] as const;

export function nodeBuiltin<T>(name: string): T {
  const getBuiltinModule = (globalThis as typeof globalThis & {
    process?: { getBuiltinModule?: (specifier: string) => unknown };
  }).process?.getBuiltinModule;
  if (typeof getBuiltinModule !== 'function') {
    throw new Error(`TreeSeed UI theme directory discovery requires Node.js built-in module "${name}". Pass schemes directly when rendering in an edge runtime.`);
  }
  return getBuiltinModule(name) as T;
}

export function normalizeSchemeId(value: unknown, fallback: TreeseedColorSchemeId) {
  return typeof value === 'string' && /^[a-z][a-z0-9-]*$/u.test(value) ? value as TreeseedColorSchemeId : fallback;
}

export function assertSchemeId(value: unknown, filePath: string): asserts value is string {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/u.test(value)) {
    throw new Error(`Invalid color scheme id in ${filePath}. Use lowercase kebab-case starting with a letter.`);
  }
}

export function assertTokenMap(value: unknown, mode: 'light' | 'dark', filePath: string): RequiredSchemeTokenInput {
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

export function defaultSwatches(tokens: TreeseedSchemeTokens) {
  return [tokens.light.accent, tokens.light.accentStrong, tokens.light.surface, tokens.light.text];
}

export function builtInColorSchemes() {
  builtInSchemeCache.definitions ??= BUILT_IN_SCHEME_YAML.map((source, index) => parseTreeseedColorSchemeYaml(source, `built-in:${index}`));
  return builtInSchemeCache.definitions;
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

export function yamlFilesInDirectory(directory: string) {
  const { existsSync, readdirSync } = nodeBuiltin<typeof import('node:fs')>('node:fs');
  const { resolve } = nodeBuiltin<typeof import('node:path')>('node:path');
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ya?ml)$/iu.test(entry.name))
    .map((entry) => resolve(directory, entry.name))
    .sort();
}

export function loadTreeseedColorSchemes(options: { directories?: string[]; cwd?: string } = {}) {
  const requestedDirectories = options.directories ?? [];
  const schemes = new Map<string, BuiltInColorSchemeDefinition>(
    builtInColorSchemes().map((scheme) => [scheme.id, scheme]),
  );

  if (requestedDirectories.length === 0) {
    return Array.from(schemes.values());
  }

  const { readFileSync } = nodeBuiltin<typeof import('node:fs')>('node:fs');
  const { resolve } = nodeBuiltin<typeof import('node:path')>('node:path');
  const cwd = options.cwd ?? process.cwd();
  const directories = requestedDirectories.map((directory) => resolve(cwd, directory));

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
