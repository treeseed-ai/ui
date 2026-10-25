import { Context, type ProviderLease, type ProviderRegistration } from '@treeseed-cordis/sdk/composition';
import { CapabilityToken, ProviderV4Schemas } from '@treeseed-cordis/sdk/portable';
import { z } from 'zod';
import type { UiComponent, UiTheme } from './contracts.js';
import { UiContributionIdentity } from './contribution.js';
import { UiPresentationToken } from './providers.js';
import { UiStyles } from './styles.js';
import { createElement } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { UiSchemas, type UiViewModel, type UiMount, type UiHydrationData, type UiScopeHandle, type UiActionDispatcher, type UiActionResult } from './contracts.js';
import { UiSurface, type UiRenderObserver } from './react.js';
import { UiScope, type UiApplicationConfiguration, type UiPresentation } from './providers.js';
export interface UiHostAdapters {
    actions?: UiActionDispatcher;
    actionIds: readonly string[];
    assetGeneration: string;
}
class UiAdmittedActions implements UiActionDispatcher {
    constructor(private readonly host: UiHostAdapters) { }
    invoke(actionId: string, input: Readonly<Record<string, string>>): Promise<UiActionResult> { if (!this.host.actions || !this.host.actionIds.includes(actionId))
        return Promise.reject(new Error('UI_ACTION_DENIED')); return this.host.actions.invoke(actionId, input); }
}
class UiReadiness implements UiRenderObserver {
    private resolve: (() => void) | null = null;
    private reject: ((error: Error) => void) | null = null;
    private timer: ReturnType<typeof setTimeout> | undefined;
    readonly promise = new Promise<void>(this.begin.bind(this));
    private begin(resolve: () => void, reject: (error: Error) => void): void { this.resolve = resolve; this.reject = reject; this.timer = setTimeout(this.failed.bind(this), 30000); }
    cancel(): void { clearTimeout(this.timer); }
    loaded(): void { clearTimeout(this.timer); this.resolve?.(); }
    failed(): void { clearTimeout(this.timer); this.reject?.(new Error('UI_STYLESHEET_UNAVAILABLE')); }
}
class UiMountedRoot implements UiMount {
    readonly rootGeneration: string;
    private disposal: Promise<void> | null = null;
    constructor(readonly generation: string, private readonly root: Root, private readonly component: ProviderLease<UiComponent>, private readonly theme: ProviderLease<UiTheme>) { this.rootGeneration = generation; }
    dispose(): Promise<void> { if (!this.disposal)
        this.disposal = this.close(); return this.disposal; }
    private async close(): Promise<void> { let failed = false; try {
        this.root.unmount();
    }
    catch {
        failed = true;
    } try {
        await this.component.release();
    }
    catch {
        failed = true;
    } try {
        await this.theme.release();
    }
    catch {
        failed = true;
    } if (failed)
        throw new Error('UI_CLEANUP_FAILED'); }
}
class UiAttachedScope implements UiScopeHandle {
    constructor(private readonly scope: UiScope) { }
    dispose(): Promise<void> { return this.scope.dispose(); }
}
export interface UiBrowserRendering {
    mount(target: Element, view: UiViewModel, host?: UiHostAdapters, hydrate?: boolean): Promise<UiMount>;
}
class BrowserValidator {
    parse(value: unknown): UiBrowserRendering { if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'mount') !== 'function')
        throw new Error('INVALID_UI_BROWSER_RENDERER'); return value as UiBrowserRendering; }
}
export const UiBrowserToken = new CapabilityToken<UiBrowserRendering>('ui.renderer.browser', ProviderV4Schemas.version, new BrowserValidator());
export class ReactBrowserRenderer implements UiBrowserRendering {
    constructor(private readonly presentation: UiPresentation) { }
    async mount(target: Element, value: UiViewModel, host?: UiHostAdapters, hydrate = false): Promise<UiMount> {
        const view = UiSchemas.view.parse(value);
        let root: Root | undefined, component: ProviderLease<UiComponent> | undefined, theme: ProviderLease<UiTheme> | undefined, readiness: UiReadiness | undefined;
        try {
            component = await this.presentation.component(view.componentId);
            theme = await this.presentation.theme();
            component.value.validate(view.model);
            readiness = new UiReadiness();
            const element = createElement(UiSurface, { component: component.value.component, view, cssUrl: (await UiStyles.asset(theme.value.css())).path, actions: host ? new UiAdmittedActions(host) : undefined, observer: readiness });
            root = hydrate ? hydrateRoot(target, element) : createRoot(target);
            if (!hydrate)
                root.render(element);
            await readiness.promise;
            return new UiMountedRoot(this.presentation.generation, root, component, theme);
        }
        catch (error) {
            readiness?.cancel();
            try {
                root?.unmount();
            }
            finally {
                try {
                    await component?.release();
                }
                finally {
                    await theme?.release();
                }
            }
            throw error;
        }
    }
}
export class ReactBrowserRendererPlugin extends ReactBrowserRenderer {
    static readonly provide = ['ui.renderer.browser'];
    static readonly inject = ['ui.presentation'];
    static readonly Config = z.strictObject({});
    static readonly declaration = ProviderV4Schemas.declaration.parse({ id: 'ui.renderer.browser.default', pluginId: 'ui', capability: this.provide[0], contractVersion: ProviderV4Schemas.version, target: 'browser', provide: this.provide, inject: this.inject });
    constructor(context: Context) { super(Reflect.get(context, 'ui.presentation') as UiPresentation); context.provide('ui.renderer.browser', this); }
}
class UiOwnedMount implements UiMount {
    private disposal: Promise<void> | null = null;
    readonly generation: string;
    readonly rootGeneration: string;
    constructor(private readonly inner: UiMount, private readonly renderer: ProviderLease<UiBrowserRendering>, private readonly scope: UiScope) { this.generation = inner.generation; this.rootGeneration = scope.handle.generation; }
    dispose(): Promise<void> { if (!this.disposal)
        this.disposal = this.close(); return this.disposal; }
    private async close(): Promise<void> { let failed = false; try {
        await this.inner.dispose();
    }
    catch {
        failed = true;
    } try {
        await this.renderer.release();
    }
    catch {
        failed = true;
    } try {
        await this.scope.dispose();
    }
    catch {
        failed = true;
    } if (failed)
        throw new Error('UI_CLEANUP_FAILED'); }
}
export class UiBrowserRenderer {
    constructor(private readonly configuration: UiApplicationConfiguration = {}) { }
    async mount(target: Element, value: UiViewModel, host?: UiHostAdapters, hydrate = false): Promise<UiMount> {
        const registration: ProviderRegistration = { token: UiBrowserToken, plugin: ReactBrowserRendererPlugin, declaration: ReactBrowserRendererPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: this.configuration.artifactIdentity ?? '@treeseed-cordis/ui@0.0.0-cordis.3' } }, scope = await UiScope.create(this.configuration, [registration]);
        let renderer: ProviderLease<UiBrowserRendering> | undefined;
        try {
            renderer = await scope.service(UiBrowserToken);
            return new UiOwnedMount(await renderer.value.mount(target, value, host, hydrate), renderer, scope);
        }
        catch (error) {
            try {
                await renderer?.release();
            }
            finally {
                await scope.dispose();
            }
            throw error;
        }
    }
}
export interface UiBrowserStart extends UiApplicationConfiguration {
    target: Element;
    view: UiViewModel;
    host?: UiHostAdapters;
}
export class UiBrowserApplication {
    static renderer(configuration: UiApplicationConfiguration = {}): UiBrowserRenderer { return new UiBrowserRenderer(configuration); }
    static start(configuration: UiBrowserStart): Promise<UiMount> { return new UiBrowserRenderer(configuration).mount(configuration.target, configuration.view, configuration.host); }
    static async attach(value: UiHydrationData, host: UiHostAdapters, configuration: UiApplicationConfiguration = {}): Promise<UiScopeHandle> { const bootstrap = UiSchemas.hydration.parse(value); if (bootstrap.assetGeneration !== host.assetGeneration)
        throw new Error('UI_ASSET_MISMATCH'); for (const action of bootstrap.actionIds)
        if (!host.actionIds.includes(action))
            throw new Error('UI_ACTION_DENIED'); const scope = await UiScope.create(configuration); if (bootstrap.presentationGeneration !== scope.presentationGeneration) {
        await scope.dispose();
        throw new Error('UI_GENERATION_MISMATCH');
    } try {
        const presentation = await scope.service(UiPresentationToken);
        try {
            const component = await presentation.value.component(bootstrap.view.componentId), theme = await presentation.value.theme();
            try {
                component.value.validate(bootstrap.view.model);
                UiContributionIdentity.assert(bootstrap.contribution, await UiContributionIdentity.create(bootstrap.view, presentation.value, component.value, (await UiStyles.asset(theme.value.css())).digest));
            }
            finally {
                await component.release();
                await theme.release();
            }
        }
        finally {
            await presentation.release();
        }
        return new UiAttachedScope(scope);
    }
    catch (error) {
        await scope.dispose();
        throw error;
    } }
}
