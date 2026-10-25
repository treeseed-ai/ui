import {UiServerRenderer} from '@treeseed-cordis/ui/server';
import type {UiHydrationData} from '@treeseed-cordis/ui/contracts';
import {FixtureHost} from './host.js';
export class FixtureBootstrap extends FixtureHost {
    static async bootstrap(principal: string): Promise<UiHydrationData> { const renderer = await UiServerRenderer.create(); try {
        const view={id:'page',componentId:'stack',model:{title:'Profile',children:[{ id: 'profile', componentId: 'form', model: { title: 'Profile ' + principal, actionId: 'fixture.save', submitLabel: 'Save', fields: [{ id: 'name', label: 'Name', required: true }] } }]}},page=await renderer.render(view);
        return { contribution: page.contribution, view, presentationGeneration: page.generation, assetGeneration: this.assetGeneration, actionIds: this.actionIds };
    }
    finally {
        await renderer.dispose();
    } }
}
