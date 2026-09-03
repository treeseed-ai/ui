import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { coreUiRegistry } from '../../../src/lib/foundation/contracts.ts';

describe('Astro semantic collection adapter', () => {
	it('resolves collection and resource identity through the shared registry', () => {
		const region = coreUiRegistry.view('projects').regions.find((candidate) => candidate.id === 'projects');
		expect(region).toMatchObject({ type: 'collection', resource: 'project' });
		const source = readFileSync('src/astro/semantic/SemanticCollectionSurface.astro', 'utf8');
		expect(source).toContain('coreUiRegistry.view(viewId)');
		expect(source).toContain('<SemanticRegionSurface');
		expect(readFileSync('src/astro/semantic/SemanticRegionSurface.astro', 'utf8')).toContain('coreUiRegistry.resource(region.resource)');
	});

	it('provides a shell-free adapter for every semantic region kind', () => {
		const source = readFileSync('src/astro/semantic/SemanticRegionSurface.astro', 'utf8');
		expect(source).toContain('data-semantic-region-type={region.type}');
		expect(source).toContain('data-semantic-relationship={region.relationship}');
		expect(source).toContain('<slot />');
		expect(readFileSync('src/astro/semantic/SemanticCollectionSurface.astro', 'utf8')).toContain('<SemanticRegionSurface');
	});

	it('composes the shared public and administrative team viewer from semantic regions', () => {
		const regions = coreUiRegistry.view('team').regions.map((region) => region.id);
		expect(regions).toEqual(['profile', 'projects', 'resources', 'signals', 'activity']);
		const source = readFileSync('src/astro/team/TeamViewer.astro', 'utf8');
		for (const regionId of regions) expect(source).toContain(`regionId="${regionId}"`);
	});
});
