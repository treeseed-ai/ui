import type { BuiltInColorSchemeDefinition, ResolvedTreeseedThemeConfig, ThemePreference, TreeseedColorSchemeId, TreeseedColorSchemeSummary, TreeseedThemeConfig, TreeseedThemeMode } from './types.ts';
export type { BuiltInColorSchemeDefinition, RequiredSchemeTokenInput, ResolvedTreeseedThemeConfig, ThemePreference, TreeseedColorSchemeId, TreeseedColorSchemeSummary, TreeseedSchemeTokens, TreeseedSemanticColorTokens, TreeseedThemeConfig, TreeseedThemeMode, } from './types.ts';
export declare function parseTreeseedColorSchemeYaml(source: string, filePath?: string): BuiltInColorSchemeDefinition;
export declare function loadTreeseedColorSchemes(options?: {
    directories?: string[];
    cwd?: string;
}): BuiltInColorSchemeDefinition[];
export declare function defineTreeseedTheme(options?: {
    schemeDirectories?: string[];
    cwd?: string;
    defaultScheme?: TreeseedColorSchemeId;
    defaultMode?: TreeseedThemeMode;
    schemes?: TreeseedThemeConfig['schemes'];
}): TreeseedThemeConfig;
export declare function getBuiltInColorSchemes(): TreeseedColorSchemeSummary[];
export declare function resolveTreeseedThemeConfig(input?: TreeseedThemeConfig): ResolvedTreeseedThemeConfig;
export declare function normalizeThemePreference(input: unknown): ThemePreference;
export declare function buildTreeseedThemeCss(input?: TreeseedThemeConfig): string;
