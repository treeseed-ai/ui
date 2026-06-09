import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('package exports', () => {
  it('exports public component and style entrypoints', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };
    expect(packageJson.exports['./theme']).toBeDefined();
    expect(packageJson.exports['./styles/theme.css']).toBeDefined();
    expect(packageJson.exports['./components/astro/forms/Button.astro']).toBeDefined();
    expect(packageJson.exports['./components/astro/forms/MarkdownField.astro']).toBeDefined();
    expect(packageJson.exports['./components/astro/shell/AppShell.astro']).toBeDefined();
    expect(packageJson.exports['./components/astro/shell/PublicShell.astro']).toBeDefined();
    expect(packageJson.exports['./components/react/DynamicPieAllocationInput']).toBeDefined();
    expect(packageJson.exports['./components/react/MonitoringChart']).toBeDefined();
    expect(packageJson.exports['./components/react/RichMarkdownEditor']).toBeDefined();
    expect(packageJson.exports['./theme/schemes/*.yaml']).toBeDefined();
  });
});
