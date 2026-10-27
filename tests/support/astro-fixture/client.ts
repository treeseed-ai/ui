import upstream from '@astrojs/react/client.js';
import { FixtureHost, FixtureActions, UiIslandHost } from './host.js';
import type { UiIslandBinding } from '@treeseed-cordis/ui/island';
import type { UiHydrationData } from '@treeseed-cordis/ui/contracts';
class Client {
    private binding: UiIslandBinding | null = null;
    private closed: Promise<void> | null = null;
    constructor(private readonly element: HTMLElement) { }
    static forElement(element: HTMLElement) { const client = new Client(element); return client.render.bind(client); }
    async render(_component: unknown, props: UiHydrationData, slots: Record<string, string>, metadata: Record<string, string>): Promise<void> { this.binding = await UiIslandHost.prepare(props, { assetGeneration: FixtureHost.assetGeneration, actionIds: FixtureHost.actionIds, actions: new FixtureActions() }); upstream(this.element)(this.binding.Component, props, slots, metadata); this.element.addEventListener('astro:unmount', this.dispose.bind(this), { once: true }); window.fixtureClose = this.close.bind(this); }
    private dispose(): void { this.closed = this.binding!.dispose(); }
    private async close(): Promise<void> { this.element.dispatchEvent(new CustomEvent('astro:unmount')); await this.closed; }
}
declare global {
    interface Window {
        fixtureClose: () => Promise<void>;
    }
}
export default Client.forElement;
