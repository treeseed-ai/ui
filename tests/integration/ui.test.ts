import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';
class UiContractTestsIntegration {

    async renderers(): Promise<void> {
        const { UiServerRenderer } = await import('../../src/server.js'), { UiTerminalRenderer } = await import('../../src/terminal.js');
        const server = await UiServerRenderer.create(), terminal = await UiTerminalRenderer.create();
        try {
            const page = await server.render({ id: 'fixture', componentId: 'status', model: { title: 'Status', state: 'Ready' } }), style = await server.styles();
            expect(page.html).not.toContain('<style>');
            expect(page.assets).toEqual([style.path]);
            expect(style.path).toContain(style.digest);
            expect(page.html).toContain(style.path);
            expect((await terminal.render({ id: 'fixture', componentId: 'status', model: { title: 'Status', state: 'Ready' } })).text).toBe('Status: Ready\n');
        }
        finally {
            await server.dispose();
            await terminal.dispose();
        }
        await expect(server.render({ id: 'f', componentId: 'text', model: { text: 'closed' } })).rejects.toThrow();
    }
}
class RendererSelectionTestsIntegration {

    async selectedDefault(): Promise<void> { const { UiServerRenderer } = await import('../../src/server.js'); const renderer = await UiServerRenderer.create(); try {
        const identity = (renderer as unknown as {
            identity(): {
                providerId: string;
                generation: string;
            };
        }).identity();
        expect(identity.providerId).toBe('ui.renderer.server.default');
        expect(identity.generation).toMatch(/^[a-f0-9]{64}$/);
    }
    finally {
        await renderer.dispose();
    } }
}
class IslandReactPropsTestsIntegration {

    async boundary(): Promise<void> { const { UiSchemas } = await import('../../src/contracts.js'), { UiIslandHost } = await import('../../src/island.js'), { UiServerRenderer } = await import('../../src/server.js'), { createElement } = await import('react'), { renderToString } = await import('react-dom/server'); const server = await UiServerRenderer.create(); try {
        const view = { id: 'fixture', componentId: 'text', model: { text: 'Hydrated' } }, page = await server.render(view), bootstrap = { view, contribution: page.contribution, presentationGeneration: page.generation, assetGeneration: 'a'.repeat(64), actionIds: [] }, binding = await UiIslandHost.prepare(bootstrap, { assetGeneration: 'a'.repeat(64), actionIds: [] });
        try {
            expect(renderToString(createElement(binding.Component, bootstrap, undefined))).toContain('Hydrated');
        }
        finally {
            await binding.dispose();
        }
        expect(UiSchemas.hydration.safeParse({ ...bootstrap, children: 'foreign' }).success).toBe(false);
    }
    finally {
        await server.dispose();
    } }
}
class IslandAdmissionTestsIntegration {

    async isolated(): Promise<void> { const { UiServerRenderer } = await import('../../src/server.js'), { UiIslandHost } = await import('../../src/island.js'), { createElement } = await import('react'), { renderToString } = await import('react-dom/server'); const renderer = await UiServerRenderer.create(); try {
        const view = { id: 'v', componentId: 'form', model: { title: 'Alice', actionId: 'save', submitLabel: 'Save', fields: [] } }, page = await renderer.render(view), bootstrap = { view, contribution: page.contribution, presentationGeneration: page.generation, assetGeneration: 'b'.repeat(64), actionIds: ['save'] }, host = { assetGeneration: 'b'.repeat(64), actionIds: ['save'] };
        for (const field of ['id', 'componentId', 'providerId', 'modelSchemaDigest', 'styleDigest']) {
            const invalid = { ...bootstrap, contribution: { ...bootstrap.contribution, [field]: field.endsWith('Digest') ? 'f'.repeat(64) : 'foreign' } };
            await expect(UiIslandHost.prepare(invalid, host)).rejects.toThrow('UI_CONTRIBUTION_MISMATCH');
        }
        await expect(UiIslandHost.prepare(bootstrap, { ...host, assetGeneration: 'c'.repeat(64) })).rejects.toThrow('UI_ASSET_MISMATCH');
        await expect(UiIslandHost.prepare(bootstrap, { ...host, actionIds: [] })).rejects.toThrow('UI_ACTION_DENIED');
        await expect(UiIslandHost.prepare({ ...bootstrap, presentationGeneration: 'f'.repeat(64) }, host)).rejects.toThrow('UI_GENERATION_MISMATCH');
        const alice = await UiIslandHost.prepare(bootstrap, host), bobBootstrap = { ...bootstrap, view: { ...view, model: { ...view.model, title: 'Bob' } } }, bob = await UiIslandHost.prepare(bobBootstrap, host);
        try {
            expect(renderToString(createElement(alice.Component, bootstrap))).not.toContain('Bob');
            expect(renderToString(createElement(bob.Component, bobBootstrap))).not.toContain('Alice');
            expect(renderToString.bind(null, createElement(alice.Component, bobBootstrap))).toThrow('UI_BOOTSTRAP_MISMATCH');
        }
        finally {
            await alice.dispose();
            await bob.dispose();
        }
        expect(renderToString.bind(null, createElement(alice.Component, bootstrap))).toThrow('UI_ISLAND_CLOSED');
    }
    finally {
        await renderer.dispose();
    } }
}
class PresentationIdentityTestsIntegration {

    async selectedOnly(): Promise<void> { const { UiScope, StatusComponentPlugin } = await import('../../src/providers.js'), { UiTokens } = await import('../../src/contracts.js'); const baseline = await UiScope.create(), scopeId = 'request-unique', registrations = UiScope.defaults(); registrations.push({ token: UiTokens.component('status'), plugin: StatusComponentPlugin, declaration: { ...StatusComponentPlugin.declaration, id: 'ui.status.unselected' }, configuration: {}, artifact: { kind: 'bundled', identity: 'fixture.unselected' } }); const selections = []; for (const registration of UiScope.defaults()) {
        const declaration = registration.declaration as {
            id: string;
        };
        selections.push({ scopeId, capability: registration.token.id, providerId: declaration.id });
    } const alternate = await UiScope.create({ scopeId, registrations, selections }); try {
        expect(alternate.presentationGeneration).toBe(baseline.presentationGeneration);
        expect(alternate.handle.generation).not.toBe(baseline.handle.generation);
    }
    finally {
        await baseline.dispose();
        await alternate.dispose();
    } }
}
class ContributionTestsIntegration {

    async binding(): Promise<void> { const { UiServerRenderer } = await import('../../src/server.js'); const renderer = await UiServerRenderer.create(); try {
        const page = await renderer.render({ id: 'v', componentId: 'status', model: { title: 'Status', state: 'Ready' } }), contribution = Reflect.get(page, 'contribution');
        expect(contribution).toEqual({ id: 'v', componentId: 'status', providerId: 'ui.status.default', modelSchemaDigest: expect.stringMatching(/^[a-f0-9]{64}$/), styleDigest: (await renderer.styles()).digest });
    }
    finally {
        await renderer.dispose();
    } }
}
class CompositeHydrationTestsIntegration {

 async island():Promise<void>{const {UiServerRenderer}=await import('../../src/server.js'),{UiIslandHost}=await import('../../src/island.js'),{renderToString}=await import('react-dom/server'),{createElement}=await import('react');const view={id:'page',componentId:'stack',model:{children:[{id:'message',componentId:'text',model:{text:'Nested island'}}]}},renderer=await UiServerRenderer.create();try{const page=await renderer.render(view),bootstrap={view,contribution:page.contribution,presentationGeneration:page.generation,assetGeneration:'a'.repeat(64),actionIds:[]},host={assetGeneration:'a'.repeat(64),actionIds:[]};const binding=await UiIslandHost.prepare(bootstrap,host);try{expect(renderToString(createElement(binding.Component,bootstrap))).toContain('Nested island');}finally{await binding.dispose();}const tampered=structuredClone(bootstrap);tampered.contribution.members![0]!.providerId='ui.foreign';await expect(UiIslandHost.prepare(tampered,host)).rejects.toThrow('UI_CONTRIBUTION_MISMATCH');}finally{await renderer.dispose();}}
}
const contracts=new UiContractTestsIntegration();
const selection=new RendererSelectionTestsIntegration();
const islandProps=new IslandReactPropsTestsIntegration();
const admission=new IslandAdmissionTestsIntegration();
const presentation=new PresentationIdentityTestsIntegration();
const contribution=new ContributionTestsIntegration();
const compositeHydration=new CompositeHydrationTestsIntegration();
test('integration: native default renderers share components assets and cleanup', contracts.renderers.bind(contracts));
test('integration: default renderer is selected through native Cordis', selection.selectedDefault.bind(selection));
test('integration: React undefined child is separate from strict island bootstrap', islandProps.boundary.bind(islandProps));
test('integration: island roots isolate model actions assets generations and disposal', admission.isolated.bind(admission));
test('integration: hydration identity binds selected presentation and ignores request scope labels', presentation.selectedOnly.bind(presentation));
test('integration: rendered contribution binds native provider model schema and exact style', contribution.binding.bind(contribution));
test('integration: actual island binding validates every composite member before rendering',compositeHydration.island.bind(compositeHydration));
