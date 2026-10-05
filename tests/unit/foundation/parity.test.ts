import { describe, expect, it } from 'vitest';
import { CORE_ACTIONS, CORE_VIEWS, DEVELOPMENT_SCENES, WIREFRAME_PARITY, developmentSceneAdminRoute, resolveDevelopmentScene } from '../../../src/lib/foundation/contracts.ts';

describe('wireframe parity and deterministic development scenes', () => {
	it('covers every functional wireframe page in both renderers', () => {
		const pages = WIREFRAME_PARITY.flatMap((entry) => entry.pages).sort((a, b) => a - b);
		expect(pages).toEqual(Array.from({ length: 14 }, (_, index) => index + 4));
		for (const entry of WIREFRAME_PARITY) {
			expect(entry.renderers).toEqual(['ink', 'web']);
			expect(CORE_VIEWS.some((view) => view.id === entry.viewId), entry.label).toBe(true);
			for (const action of entry.requiredActions) expect(CORE_ACTIONS.some((definition) => definition.id === action), `${entry.label}.${action}`).toBe(true);
		}
	});

	it('provides live-seed scenes for every root, surface, breakpoint, Atlas state, and utility state', () => {
		for (const root of ['team', 'chat', 'inbox', 'discover']) for (const viewport of ['narrow', 'medium', 'wide']) expect(resolveDevelopmentScene(`root.${root}.${viewport}`)).toBeDefined();
		for (const entry of WIREFRAME_PARITY.filter((candidate) => !['chat', 'inbox', 'discover'].includes(candidate.surface))) for (const viewport of ['narrow', 'medium', 'wide']) expect(resolveDevelopmentScene(`surface.${entry.surface}.${viewport}`), entry.label).toBeDefined();
		for (const state of ['ready', 'loading', 'reconnecting', 'empty', 'stale', 'denied', 'failed', 'offline']) {
			expect(resolveDevelopmentScene(`atlas.${state}.wide`)).toBeDefined();
			for (const utility of ['chat', 'feedback']) for (const viewport of ['narrow', 'medium', 'wide']) expect(resolveDevelopmentScene(`dock.${utility}.${state}.${viewport}`)).toBeDefined();
		}
		expect(new Set(DEVELOPMENT_SCENES.map((scene) => scene.id)).size).toBe(DEVELOPMENT_SCENES.length);
		expect(DEVELOPMENT_SCENES.every((scene) => scene.seed === 'treeseed' && scene.data === 'live-seed')).toBe(true);
	});

	it('deep-links every scene into its live Admin route', () => {
		for (const scene of DEVELOPMENT_SCENES) {
			const route = developmentSceneAdminRoute(scene, 'team id');
			expect(route).toMatch(/^\/app\//);
			expect(route).not.toContain('[');
		}
		expect(developmentSceneAdminRoute(resolveDevelopmentScene('surface.services.wide')!)).toBe('/app/services');
		expect(developmentSceneAdminRoute(resolveDevelopmentScene('root.chat.narrow')!)).toBe('/app/chat');
		expect(developmentSceneAdminRoute(resolveDevelopmentScene('surface.team.wide')!, 'team id')).toBe('/app/teams/team%20id');
	});
});
