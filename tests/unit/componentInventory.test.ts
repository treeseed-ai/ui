import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walkFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(root, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

describe('component inventory boundaries', () => {
  it('does not depend on market, core, sdk, or Starlight internals', () => {
    const files = [
      ...walkFiles('src/astro').filter((file) => ['.astro', '.ts'].includes(extname(file))),
      ...walkFiles('src/react').filter((file) => ['.tsx', '.ts'].includes(extname(file))),
      ...walkFiles('src/lib/app').filter((file) => extname(file) === '.ts'),
    ];
    const forbidden = /(packages\/core|packages\/sdk|market\/src|@astrojs\/starlight|virtual:starlight|astro:env\/client|CoreObjective)/;

    for (const file of files) {
      expect(readFileSync(file, 'utf8'), `${file} should stay UI-package local`).not.toMatch(forbidden);
    }
  });

  it('keeps component filenames reusable instead of single-record aliases', () => {
    const componentNames = [
      ...walkFiles('src/astro').filter((file) => extname(file) === '.astro'),
      ...walkFiles('src/react').filter((file) => extname(file) === '.tsx'),
    ].map((file) => basename(file, extname(file)));

    expect(componentNames).not.toContain('CoreObjectiveMdxEditor');
    expect(componentNames).toContain('RichMarkdownEditor');
    expect(componentNames).toContain('AppLayout');
    expect(componentNames).toContain('PublicLayout');
    expect(componentNames).toContain('ProductCard');
  });

  it('keeps utility-class use in exported public Astro components explicit', () => {
    const publicAstroFiles = [
      ...walkFiles('src/astro/layouts').filter((file) => extname(file) === '.astro'),
      ...walkFiles('src/astro/site').filter((file) => extname(file) === '.astro'),
      ...walkFiles('src/astro/forms').filter((file) => extname(file) === '.astro'),
    ];
    const utilityClassPattern = /class(?::list)?=\{?["'`][^"'`]*(?:max-w-|space-y-|grid|flex|text-|border|p-|m-|gap-|rounded|shadow|bg-|font-|leading-|tracking-|uppercase|md:|lg:|xl:)/u;
    const utilityUsers = publicAstroFiles
      .filter((file) => utilityClassPattern.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(/\\/gu, '/'))
      .sort();

    expect(utilityUsers).toEqual([
      'src/astro/forms/ContactForm.astro',
      'src/astro/forms/FooterSubscribeForm.astro',
      'src/astro/layouts/AppLayout.astro',
      'src/astro/layouts/AuthoredEntryLayout.astro',
      'src/astro/layouts/BookLayout.astro',
      'src/astro/layouts/BridgeLayout.astro',
      'src/astro/layouts/ContentLayout.astro',
      'src/astro/layouts/NoteLayout.astro',
      'src/astro/layouts/ProfileLayout.astro',
      'src/astro/site/BookList.astro',
      'src/astro/site/CTASection.astro',
      'src/astro/site/ChronicleList.astro',
      'src/astro/site/Hero.astro',
      'src/astro/site/PathCard.astro',
      'src/astro/site/ProfileList.astro',
      'src/astro/site/RouteNotFound.astro',
      'src/astro/site/SectionIntro.astro',
      'src/astro/site/StageBanner.astro',
      'src/astro/site/TrustCallout.astro',
    ]);
  });
});
