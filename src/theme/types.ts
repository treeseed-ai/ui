export type TreeseedThemeMode = 'light' | 'dark' | 'system';

export type TreeseedColorSchemeId = 'fern' | 'lichen' | 'cedar' | 'tidepool' | (string & {});

export interface TreeseedSemanticColorTokens {
  canvas: string;
  canvasSubtle: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  link: string;
  linkHover: string;
  border: string;
  borderMuted: string;
  borderStrong: string;
  focus: string;
  accent: string;
  accentHover: string;
  accentStrong: string;
  accentSoft: string;
  accentText: string;
  info: string;
  infoSoft: string;
  infoText: string;
  infoBorder: string;
  success: string;
  successSoft: string;
  successText: string;
  successBorder: string;
  warning: string;
  warningSoft: string;
  warningText: string;
  warningBorder: string;
  danger: string;
  dangerSoft: string;
  dangerText: string;
  dangerBorder: string;
  shadow: string;
  grid: string;
}

export type RequiredSchemeTokenInput = Pick<TreeseedSemanticColorTokens,
  | 'canvas'
  | 'canvasSubtle'
  | 'surface'
  | 'surfaceMuted'
  | 'surfaceRaised'
  | 'text'
  | 'textMuted'
  | 'border'
  | 'borderStrong'
  | 'accent'
  | 'accentHover'
  | 'accentStrong'
  | 'accentSoft'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
>;

export interface TreeseedSchemeTokens {
  light: TreeseedSemanticColorTokens;
  dark: TreeseedSemanticColorTokens;
}

export interface TreeseedThemeConfig {
  defaultScheme?: TreeseedColorSchemeId;
  defaultMode?: TreeseedThemeMode;
  schemes?: Partial<Record<TreeseedColorSchemeId, Partial<{
    light: Partial<TreeseedSemanticColorTokens>;
    dark: Partial<TreeseedSemanticColorTokens>;
  }>>>;
}

export type ThemePreference = {
  scheme: TreeseedColorSchemeId;
  mode: TreeseedThemeMode;
};

export type TreeseedColorSchemeSummary = {
  id: TreeseedColorSchemeId;
  name: string;
  swatches: string[];
  modeSwatches: {
    light: string[];
    dark: string[];
  };
};

export type ResolvedTreeseedThemeConfig = {
  defaultScheme: TreeseedColorSchemeId;
  defaultMode: TreeseedThemeMode;
  schemes: Record<TreeseedColorSchemeId, TreeseedSchemeTokens>;
  summaries: TreeseedColorSchemeSummary[];
};

export type BuiltInColorSchemeDefinition = {
  id: TreeseedColorSchemeId;
  name: string;
  swatches: string[];
  modeSwatches: {
    light: string[];
    dark: string[];
  };
  tokens: TreeseedSchemeTokens;
};

export type RawYamlColorScheme = {
  id: string;
  name?: string;
  swatches?: string[];
  light?: Partial<RequiredSchemeTokenInput>;
  dark?: Partial<RequiredSchemeTokenInput>;
};
