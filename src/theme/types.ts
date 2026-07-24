export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorSchemeId = 'fern' | 'lichen' | 'cedar' | 'tidepool' | (string & {});

export interface SemanticColorTokens {
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

export type RequiredSchemeTokenInput = Pick<SemanticColorTokens,
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

export interface SchemeTokens {
  light: SemanticColorTokens;
  dark: SemanticColorTokens;
}

export interface ThemeConfig {
  defaultScheme?: ColorSchemeId;
  defaultMode?: ThemeMode;
  schemes?: Partial<Record<ColorSchemeId, Partial<{
    light: Partial<SemanticColorTokens>;
    dark: Partial<SemanticColorTokens>;
  }>>>;
}

export type ThemePreference = {
  scheme: ColorSchemeId;
  mode: ThemeMode;
};

export type ColorSchemeSummary = {
  id: ColorSchemeId;
  name: string;
  swatches: string[];
  modeSwatches: {
    light: string[];
    dark: string[];
  };
};

export type ResolvedThemeConfig = {
  defaultScheme: ColorSchemeId;
  defaultMode: ThemeMode;
  schemes: Record<ColorSchemeId, SchemeTokens>;
  summaries: ColorSchemeSummary[];
};

export type BuiltInColorSchemeDefinition = {
  id: ColorSchemeId;
  name: string;
  swatches: string[];
  modeSwatches: {
    light: string[];
    dark: string[];
  };
  tokens: SchemeTokens;
};

export type RawYamlColorScheme = {
  id: string;
  name?: string;
  swatches?: string[];
  light?: Partial<RequiredSchemeTokenInput>;
  dark?: Partial<RequiredSchemeTokenInput>;
};
