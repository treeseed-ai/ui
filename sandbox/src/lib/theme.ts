import { defineTreeseedTheme, parseTreeseedColorSchemeYaml } from '../../../src/theme/index.ts';

const mossLab = parseTreeseedColorSchemeYaml(`
id: moss-lab
name: Moss Lab
light:
  canvas: "#f5f8f2"
  canvasSubtle: "#e7efdf"
  surface: "#ffffff"
  surfaceMuted: "#e7efdf"
  surfaceRaised: "#fbfdf8"
  text: "#1f281d"
  textMuted: "#53604e"
  border: "#cbd8c3"
  borderStrong: "#a9ba9f"
  accent: "#527a35"
  accentHover: "#43662b"
  accentStrong: "#2f4d1f"
  accentSoft: "#e0edd5"
  info: "#36727d"
  success: "#327344"
  warning: "#856a21"
  danger: "#9d3f35"
dark:
  canvas: "#10150e"
  canvasSubtle: "#171f14"
  surface: "#171f14"
  surfaceMuted: "#202b1b"
  surfaceRaised: "#263320"
  text: "#edf3e8"
  textMuted: "#aab8a1"
  border: "#35452f"
  borderStrong: "#506449"
  accent: "#9acb69"
  accentHover: "#b6df8e"
  accentStrong: "#d2f2ac"
  accentSoft: "#24381d"
  info: "#86c2ca"
  success: "#8fd090"
  warning: "#d9bc68"
  danger: "#e38075"
`, 'sandbox:moss-lab');

export const sandboxThemeConfig = defineTreeseedTheme({
  defaultScheme: 'fern',
  defaultMode: 'system',
  schemes: {
    [mossLab.id]: mossLab.tokens,
  },
});
