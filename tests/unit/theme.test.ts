import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildTreeseedThemeCss,
  compileGuidedThemePalette,
  defineTreeseedTheme,
  loadTreeseedColorSchemes,
  parseTreeseedColorSchemeYaml,
  resolveTreeseedThemeConfig,
  validateGuidedThemePalette,
} from '../../src/theme/index.ts';

const validYaml = `
id: test-scheme
name: Test Scheme
light:
  canvas: "#ffffff"
  canvasSubtle: "#f0f0f0"
  surface: "#ffffff"
  surfaceMuted: "#f0f0f0"
  surfaceRaised: "#fafafa"
  text: "#111111"
  textMuted: "#555555"
  border: "#dddddd"
  borderStrong: "#bbbbbb"
  accent: "#336633"
  accentHover: "#225522"
  accentStrong: "#114411"
  accentSoft: "#ddeedd"
  info: "#225577"
  success: "#227744"
  warning: "#775522"
  danger: "#882222"
dark:
  canvas: "#101010"
  canvasSubtle: "#181818"
  surface: "#181818"
  surfaceMuted: "#202020"
  surfaceRaised: "#242424"
  text: "#eeeeee"
  textMuted: "#aaaaaa"
  border: "#333333"
  borderStrong: "#555555"
  accent: "#99cc88"
  accentHover: "#aad999"
  accentStrong: "#ccffaa"
  accentSoft: "#203020"
  info: "#88bbcc"
  success: "#88cc99"
  warning: "#ddbb77"
  danger: "#ee8877"
`;

describe('YAML themes', () => {
  it('loads built-in YAML schemes', () => {
    const schemes = loadTreeseedColorSchemes();
    expect(schemes.map((scheme) => scheme.id)).toEqual(expect.arrayContaining(['fern', 'lichen', 'cedar', 'tidepool']));
  });

  it('parses and completes a custom scheme', () => {
    const scheme = parseTreeseedColorSchemeYaml(validYaml);
    expect(scheme.id).toBe('test-scheme');
    expect(scheme.tokens.light.surfaceOverlay).toBeTruthy();
    expect(scheme.modeSwatches.dark).toHaveLength(4);
  });

  it('discovers configured directories', () => {
    const root = resolve(tmpdir(), `treeseed-ui-theme-${Date.now()}`);
    const directory = resolve(root, 'schemes');
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, 'test.yaml'), validYaml);
    const theme = defineTreeseedTheme({ cwd: root, schemeDirectories: ['schemes'], defaultScheme: 'test-scheme' });
    const resolved = resolveTreeseedThemeConfig(theme);
    expect(resolved.defaultScheme).toBe('test-scheme');
    expect(resolved.summaries.some((summary) => summary.id === 'test-scheme')).toBe(true);
  });

  it('rejects malformed YAML schemes', () => {
    expect(() => parseTreeseedColorSchemeYaml('id: Bad Scheme')).toThrow(/Invalid color scheme id/);
    expect(() => parseTreeseedColorSchemeYaml('id: missing-dark\nlight: {}')).toThrow(/missing light tokens/);
  });

  it('generates CSS selectors for custom schemes', () => {
    const scheme = parseTreeseedColorSchemeYaml(validYaml);
    const css = buildTreeseedThemeCss({ schemes: { [scheme.id]: scheme.tokens }, defaultScheme: scheme.id });
    expect(css).toContain('html[data-ts-scheme="test-scheme"][data-ts-mode="light"]');
    expect(css).toContain('--ts-color-accent: #336633;');
  });

  it('compiles accessible guided personal-theme palettes without activating them', () => {
    const palette = {
      light: { canvas: '#ffffff', surface: '#f5f5f5', text: '#111111', accent: '#176b45' },
      dark: { canvas: '#101510', surface: '#182018', text: '#f5fff5', accent: '#69d69a' },
    };
    expect(validateGuidedThemePalette(palette)).toEqual({ ok: true, errors: [] });
    const tokens = compileGuidedThemePalette(palette, 'fern');
    expect(tokens.light.canvas).toBe('#ffffff');
    expect(tokens.dark.accent).toBe('#69d69a');
    expect(tokens.light.danger).toBeTruthy();
  });

  it('rejects guided palettes that fail text contrast', () => {
    expect(validateGuidedThemePalette({
      light: { canvas: '#ffffff', surface: '#ffffff', text: '#eeeeee', accent: '#dddddd' },
      dark: { canvas: '#000000', surface: '#111111', text: '#222222', accent: '#333333' },
    }).ok).toBe(false);
  });
});
