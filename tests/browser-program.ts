import { UiBrowserApplication, ReactBrowserRendererPlugin, UiBrowserToken, type UiHostAdapters } from '@treeseed-cordis/ui/browser';
import { type UiViewModel, type UiMount, type UiActionResult, type UiHydrationData } from '@treeseed-cordis/ui/contracts';
import { UiScope, StatusComponentPlugin, DefaultThemePlugin } from '@treeseed-cordis/ui/providers';
import { ProviderV4Schemas, type ProviderSelection } from '@treeseed-cordis/sdk/portable';
import { UiTokens, type UiComponentProps, type UiViewModel as View } from '@treeseed-cordis/ui/contracts';
import { UiStatus } from '@treeseed-cordis/ui/react';
import { createElement, type ReactNode } from 'react';
class AlternateStatus extends UiStatus {
    override render(): ReactNode { return createElement(UiStatus, { ...this.props, model: { ...(this.props.model as {
                title: string;
                state: string;
            }), detail: 'Qualified alternate' } }); }
}
class AlternateStatusPlugin extends StatusComponentPlugin {
    static override readonly declaration = ProviderV4Schemas.declaration.parse({ ...StatusComponentPlugin.declaration, id: 'ui.status.browser-alternate' });
    override readonly component = AlternateStatus;
}
class AlternateBrowserPlugin extends ReactBrowserRendererPlugin {
    static override readonly declaration = ProviderV4Schemas.declaration.parse({ ...ReactBrowserRendererPlugin.declaration, id: 'ui.renderer.browser.alternate' });
}
class BrowserConfiguration {
    static create() { const registrations = UiScope.defaults(), selections: ProviderSelection[] = []; for (const registration of registrations) {
        const declaration = ProviderV4Schemas.declaration.parse(registration.declaration);
        selections.push({ scopeId: 'ui', capability: registration.token.id, providerId: registration.token.id === 'ui.component.status' ? 'ui.status.browser-alternate' : declaration.id });
    } registrations.push({ token: UiTokens.component('status'), plugin: AlternateStatusPlugin, declaration: AlternateStatusPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: 'fixture.browser.component' } }, { token: UiBrowserToken, plugin: AlternateBrowserPlugin, declaration: AlternateBrowserPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: 'fixture.browser.renderer' } }); selections.push({ scopeId: 'ui', capability: UiBrowserToken.id, providerId: 'ui.renderer.browser.alternate' }); return { registrations, selections }; }
}
class FixtureActions {
    async invoke(_id: string, input: Readonly<Record<string, string>>): Promise<UiActionResult> { return { success: true, message: 'Saved ' + (input.name ?? '')+(input.csrf?' '+input.csrf:'') }; }
}
export class UiBrowserProgram {
    private mount: UiMount | null = null;
    private alternative = false;
    async select(alternative: boolean): Promise<void> { this.alternative = alternative; await this.show({ id: "selection", componentId: "status", model: { title: "Status", state: "Ready" } }); }
    generation(): string { return this.mount!.rootGeneration; }
    async show(view: UiViewModel): Promise<void> { await this.mount?.dispose(); this.mount = await UiBrowserApplication.start({ ...this.alternative ? BrowserConfiguration.create() : {}, target: document.getElementById('app')!, view, host: { actions: new FixtureActions(), actionIds: ['fixture.save'], assetGeneration: 'a'.repeat(64) } }); }
    async close(): Promise<void> { await this.mount?.dispose(); this.mount = null; }
    async hydrateDocument():Promise<void>{await this.mount?.dispose();this.mount=await UiBrowserApplication.hydrateDocument({actions:new FixtureActions(),actionIds:['fixture.save'],assetGeneration:'a'.repeat(64)});}
    static async run(): Promise<void> { window.ui = new UiBrowserProgram();try{if(document.getElementById('trsd-ui-bootstrap'))await window.ui.hydrateDocument();else await window.ui.show({ id: 'initial', componentId: 'status', model: { title: 'Status', state: 'Ready' } }); document.documentElement.dataset.ready = 'true';}catch{document.documentElement.dataset.refused='true';} }
}
declare global {
    interface Window {
        ui: UiBrowserProgram;
    }
}
await UiBrowserProgram.run();
