import {UiServerRenderer} from '@treeseed-cordis/ui/server';
import type {UiHydrationData} from '@treeseed-cordis/ui/contracts';
import {FixtureHost} from './host.js';
export class FixtureBootstrap extends FixtureHost {
    static async bootstrap(principal: string): Promise<UiHydrationData> { const renderer = await UiServerRenderer.create(); try {
        const page = await renderer.render({ id: 'profile', componentId: 'form', model: { title: 'Profile ' + principal, actionId: 'fixture.save', submitLabel: 'Save', fields: [{ id: 'name', label: 'Name', required: true }] } });
        return { contribution: page.contribution, view: { id: 'profile', componentId: 'form', model: { title: 'Profile ' + principal, actionId: 'fixture.save', submitLabel: 'Save', fields: [{ id: 'name', label: 'Name', required: true }] } }, presentationGeneration: page.generation, assetGeneration: this.assetGeneration, actionIds: this.actionIds };
    }
    finally {
        await renderer.dispose();
    } }
}
