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
  it('does not render shell header actions when content owns the page header', () => {
    const shell = readFileSync('src/astro/shell/layout/ProductShell.astro', 'utf8');
    const surface = readFileSync('src/astro/shell/layout/ControlSurface.astro', 'utf8');

    expect(shell).toContain("const renderHeaderAction = !contentOwnsPageHeader && Astro.slots.has('headerAction')");
    expect(shell).toContain('renderActions={renderHeaderAction}');
    expect(surface).toContain("renderActions = Astro.slots.has('actions')");
    expect(surface).toContain('title || description || renderActions');
  });

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
    expect(componentNames).toContain('KnowledgeProfileLayout');
    expect(componentNames).toContain('KnowledgeActivityTrail');
  });

  it('owns one reusable privacy-conscious knowledge profile composition', () => {
    const components = [
      'KnowledgeProfileLayout.astro',
      'KnowledgeProfileIdentity.astro',
      'KnowledgeProfileStats.astro',
      'KnowledgeProfileCollection.astro',
      'KnowledgeActivityTrail.astro',
    ].map((name) => readFileSync(`src/astro/public/profile/${name}`, 'utf8'));
    const combined = components.join('\n');
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };
    const catalog = readFileSync('sandbox/src/lib/component-catalog/support/public-and-templates.ts', 'utf8');

    expect(combined).toContain('data-scene="knowledge.profile"');
    expect(combined).toContain('data-scene="knowledge.activity"');
    expect(combined).toContain("import Timestamp from '../../data/Timestamp.astro'");
    expect(combined).toContain('Only explicitly public and attributed activity appears here.');
    expect(components[0]).toContain("Astro.slots.has('navigation')");
    expect(components[0]).toContain('ts-knowledge-profile-frame__navigation');
    const profileCss = readFileSync('src/styles/knowledge-profile.css', 'utf8');
    expect(profileCss).toMatch(/\.ts-knowledge-profile__rail\s*\{[\s\S]*?position:\s*sticky/u);
    expect(profileCss).toMatch(/\.ts-knowledge-identity\s*\{[\s\S]*?position:\s*static/u);
    const profileBlock = profileCss.match(/\.ts-knowledge-profile\s*\{(?<body>[^}]*)\}/u)?.groups?.body ?? '';
    const imageAvatarBlock = profileCss.match(/\.ts-knowledge-identity__avatar\[data-has-image='true'\]\s*\{(?<body>[^}]*)\}/u)?.groups?.body ?? '';
    expect(profileBlock).not.toContain('background');
    expect(profileCss).not.toContain('background-size');
    expect(imageAvatarBlock).toContain('background: transparent');
    expect(imageAvatarBlock).not.toContain('box-shadow');
    expect(components[1]).toContain("data-has-image={imageSrc ? 'true' : 'false'}");
    expect(profileCss).toMatch(/\.ts-knowledge-identity__avatar\[data-kind='team'\] img\s*\{[^}]*object-fit:\s*contain/su);
    expect(profileCss).toMatch(/@media \(max-width:\s*620px\)[\s\S]*?\.ts-knowledge-profile__rail\s*\{[^}]*align-items:\s*stretch/su);
    for (const name of ['KnowledgeProfileLayout', 'KnowledgeProfileIdentity', 'KnowledgeProfileStats', 'KnowledgeProfileCollection', 'KnowledgeActivityTrail']) {
      expect(packageJson.exports).toHaveProperty(`./components/astro/public/profile/${name}.astro`);
      expect(catalog).toContain(`'${name}'`);
    }
  });

  it('owns one timezone-aware accessible countdown display', () => {
    const countdown = readFileSync('src/astro/data/Countdown.astro', 'utf8');
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };

    expect(countdown).toContain("import Timestamp from './Timestamp.astro'");
    expect(countdown).toContain('timeZone={timeZone}');
    expect(countdown).toContain('role="progressbar"');
    expect(countdown).toContain("document.addEventListener('treeseed:content-updated'");
    expect(packageJson.exports['./components/astro/data/Countdown.astro']).toBe(
      './dist/astro/data/Countdown.astro',
    );
  });

  it('hydrates knowledge editor islands reliably and completely hides inactive controls', () => {
    const editor = readFileSync('src/astro/knowledge/KnowledgeAuthoringForm.astro', 'utf8');

    expect(editor.match(/KnowledgeRelationPicker client:load/gu)).toHaveLength(6);
    expect(editor).toContain('RichMarkdownEditor client:load');
    expect(editor).not.toContain('client:visible');
    expect(editor).toContain('.ts-knowledge-editor__kind[hidden] { display: none; }');

		const patterns = [...editor.matchAll(/pattern="([^"]+)"/gu)].map((match) => match[1]);
		expect(patterns.length).toBeGreaterThanOrEqual(3);
		for (const pattern of patterns) expect(() => new RegExp(pattern, 'v')).not.toThrow();
		expect(editor).toContain("detail?.payload?.workspace?.version");
		expect(editor).toContain("input[name=\"version\"]");
  });

  it('imports the status badge used by the knowledge outline', () => {
    const outline = readFileSync('src/astro/knowledge/KnowledgeOutline.astro', 'utf8');
    const outlineBranch = readFileSync('src/astro/knowledge/outline/KnowledgeOutlineBranch.astro', 'utf8');

    expect(outline).toContain("import Badge from '../data/Badge.astro'");
    expect(outlineBranch).toContain('(page.parentId ?? undefined) === parentId');
    expect(outline).toContain('<Badge size="sm"');
  });

  it('keeps the shared mobile book sidebar closed until the reader opens it', () => {
    const frame = readFileSync('src/astro/docs/PageFrame.astro', 'utf8');
    const toggle = readFileSync('src/astro/docs/MobileSidebarToggle.astro', 'utf8');

    expect(frame).toContain("import MobileSidebarToggle from './MobileSidebarToggle.astro'");
    expect(frame).not.toContain('<button class="desktop-sidebar-toggle"');
    expect(toggle).toContain('aria-expanded="false"');
    expect(toggle).toContain("document.body.toggleAttribute('data-mobile-menu-expanded', expanded)");
    expect(toggle).toContain("if (event.code !== 'Escape') return");
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
      'src/astro/forms/submission/FooterSubscribeForm.astro',
      'src/astro/layouts/AppLayout.astro',
      'src/astro/layouts/AuthoredEntryLayout.astro',
      'src/astro/layouts/BridgeLayout.astro',
      'src/astro/layouts/ContentLayout.astro',
      'src/astro/layouts/NoteLayout.astro',
      'src/astro/layouts/ProfileLayout.astro',
      'src/astro/site/content/ChronicleList.astro',
      'src/astro/site/content/ProfileList.astro',
      'src/astro/site/marketing/CTASection.astro',
      'src/astro/site/marketing/Hero.astro',
      'src/astro/site/marketing/StageBanner.astro',
      'src/astro/site/marketing/TrustCallout.astro',
      'src/astro/site/navigation/PathCard.astro',
      'src/astro/site/navigation/RouteNotFound.astro',
      'src/astro/site/sections/SectionIntro.astro',
    ]);
  });
});
