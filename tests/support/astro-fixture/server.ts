import upstream from '@astrojs/react/server.js';
import { FixtureHost, UiIslandHost, UiIsland } from './host.js';
import type { UiHydrationData } from '@treeseed-cordis/ui/contracts';
class Server {
    static check(component: unknown): boolean { return component === UiIsland; }
    static async renderToStaticMarkup(this: unknown, _component: unknown, props: UiHydrationData, slots: Record<string, string>, metadata: Parameters<typeof upstream.renderToStaticMarkup>[3]) { const binding = await UiIslandHost.prepare(props, FixtureHost); try {
        return await upstream.renderToStaticMarkup.call(this, binding.Component, props, slots, metadata);
    }
    finally {
        await binding.dispose();
    } }
}
export default { check: Server.check, renderToStaticMarkup: Server.renderToStaticMarkup };
