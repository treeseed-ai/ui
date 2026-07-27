// @vitest-environment node

import { describe, expect, it } from 'vitest';

describe('server package import', () => {
  it('evaluates the public root and branding entry without a document', async () => {
    expect(globalThis.document).toBeUndefined();

    const [ui, brand] = await Promise.all([
      import('../../../src/index'),
      import('../../../src/site-brand'),
    ]);

    expect(ui.SITE_SLOGAN).toBe('Grow what you know');
    expect(brand.SITE_SLOGAN).toBe('Grow what you know');
    expect(ui.initializeMarkdownFields).toBeTypeOf('function');
    expect(ui.initializeRelatedContentCreators).toBeTypeOf('function');
  });
});
