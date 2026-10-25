import { Component, createElement, type ComponentClass, type ReactNode } from 'react';
import { z } from 'zod';
import { Context, type ProviderLease, type ProviderRegistration } from '@treeseed-cordis/sdk/composition';
import { CapabilityToken, ProviderV4Schemas } from '@treeseed-cordis/sdk/portable';
import { UiSchemas, type UiHydrationData, type UiComponent, type UiTheme, type UiScopeHandle } from './contracts.js';
import { UiContributionIdentity } from './contribution.js';
import { CanonicalJson } from '@treeseed-cordis/sdk/portable';
import { UiSurface } from './react.js';
import { UiStyles } from './styles.js';
import { UiProviderPolicy, UiScope, type UiPresentation, type UiApplicationConfiguration } from './providers.js';
import type { UiHostAdapters } from './browser.js';
/** Marker directly imported by Astro. The host adapter must prepare a request-local binding. */
export class UiIsland extends Component<UiHydrationData> {
    render(): ReactNode { throw new Error('UI_ISLAND_NOT_PREPARED'); }
}
export interface UiIslandBinding extends UiScopeHandle {
    readonly Component: ComponentClass<UiHydrationData>;
    readonly generation: string;
}
export interface UiIslandRendering {
    prepare(value: UiHydrationData, host: UiHostAdapters): Promise<UiIslandBinding>;
}
class IslandValidator {
    parse(value: unknown): UiIslandRendering {
        if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'prepare') !== 'function')
            throw new Error('INVALID_UI_ISLAND_RENDERER');
        return value as UiIslandRendering;
    }
}
export const UiIslandToken = new CapabilityToken<UiIslandRendering>('ui.renderer.island', ProviderV4Schemas.version, new IslandValidator());
class IslandActions {
    constructor(private readonly host: UiHostAdapters, private readonly admitted: readonly string[]) { }
    invoke(id: string, input: Readonly<Record<string, string>>) {
        if (!this.admitted.includes(id) || !this.host.actionIds.includes(id) || !this.host.actions)
            return Promise.reject(new Error('UI_ACTION_DENIED'));
        return this.host.actions.invoke(id, input);
    }
}
class ReactIslandBinding implements UiIslandBinding {
    private disposal: Promise<void> | null = null;
    private closed = false;
    readonly Component: ComponentClass<UiHydrationData>;
    constructor(readonly generation: string, private readonly component: ProviderLease<UiComponent>, private readonly theme: ProviderLease<UiTheme>, bootstrap: UiHydrationData, cssUrl: string, host: UiHostAdapters) {
        const binding = this, actions = new IslandActions(host, bootstrap.actionIds);
        class BoundIsland extends Component<UiHydrationData> {
            render(): ReactNode { binding.assert(this.props, bootstrap); return createElement(UiSurface, { component: component.value.component, view: this.props.view, cssUrl, hostStyles: true, actions }); }
        }
        this.Component = BoundIsland;
    }
    private assert(value: UiHydrationData, bootstrap: UiHydrationData): void {
        if (this.closed)
            throw new Error('UI_ISLAND_CLOSED');
        const { children, ...data } = value as UiHydrationData & {
            children?: unknown;
        };
        if (children !== undefined)
            throw new Error('UI_ISLAND_CHILDREN_DENIED');
        const parsed = UiSchemas.hydration.parse(data);
        if (CanonicalJson.stringify(parsed) !== CanonicalJson.stringify(bootstrap))
            throw new Error('UI_BOOTSTRAP_MISMATCH');
    }
    dispose(): Promise<void> {
        if (!this.disposal) {
            this.closed = true;
            this.disposal = this.close();
        }
        return this.disposal;
    }
    private async close(): Promise<void> {
        try {
            await this.component.release();
        }
        finally {
            await this.theme.release();
        }
    }
}
export class ReactIslandRenderer implements UiIslandRendering {
    constructor(private readonly presentation: UiPresentation) { }
    async prepare(value: UiHydrationData, host: UiHostAdapters): Promise<UiIslandBinding> {
        const bootstrap = UiSchemas.hydration.parse(value);
        if (bootstrap.presentationGeneration !== this.presentation.generation)
            throw new Error('UI_GENERATION_MISMATCH');
        if (bootstrap.assetGeneration !== host.assetGeneration)
            throw new Error('UI_ASSET_MISMATCH');
        for (const action of bootstrap.actionIds)
            if (!host.actionIds.includes(action))
                throw new Error('UI_ACTION_DENIED');
        const component = await this.presentation.component(bootstrap.view.componentId);
        let theme: ProviderLease<UiTheme> | undefined;
        try {
            component.value.validate(bootstrap.view.model);
            theme = await this.presentation.theme();
            const style = await UiStyles.asset(theme.value.css());
            UiContributionIdentity.assert(bootstrap.contribution, await UiContributionIdentity.create(bootstrap.view, this.presentation, component.value, style.digest));
            return new ReactIslandBinding(this.presentation.generation, component, theme, bootstrap, style.path, host);
        }
        catch (error) {
            try {
                await component.release();
            }
            finally {
                await theme?.release();
            }
            throw error;
        }
    }
}
export class ReactIslandRendererPlugin extends ReactIslandRenderer {
    static readonly provide = ['ui.renderer.island'];
    static readonly inject = ['ui.presentation'];
    static readonly Config = z.strictObject({});
    static readonly replacement = UiProviderPolicy.replacement;
    static readonly declaration = ProviderV4Schemas.declaration.parse({ id: 'ui.renderer.island.default', pluginId: 'ui', capability: this.provide[0], contractVersion: ProviderV4Schemas.version, target: 'browser', provide: this.provide, inject: this.inject });
    constructor(context: Context) { super(Reflect.get(context, 'ui.presentation') as UiPresentation); context.provide('ui.renderer.island', this); }
}
class OwnedIslandBinding implements UiIslandBinding {
    private disposal: Promise<void> | null = null;
    readonly Component: ComponentClass<UiHydrationData>;
    readonly generation: string;
    constructor(private readonly binding: UiIslandBinding, private readonly renderer: ProviderLease<UiIslandRendering>, private readonly scope: UiScope) { this.Component = binding.Component; this.generation = binding.generation; }
    dispose(): Promise<void> {
        if (!this.disposal)
            this.disposal = this.close();
        return this.disposal;
    }
    private async close(): Promise<void> {
        let failed = false;
        try {
            await this.binding.dispose();
        }
        catch {
            failed = true;
        }
        try {
            await this.renderer.release();
        }
        catch {
            failed = true;
        }
        try {
            await this.scope.dispose();
        }
        catch {
            failed = true;
        }
        if (failed)
            throw new Error('UI_CLEANUP_FAILED');
    }
}
export class UiIslandHost {
    static async prepare(value: UiHydrationData, host: UiHostAdapters, configuration: UiApplicationConfiguration = {}): Promise<UiIslandBinding> {
        const registration: ProviderRegistration = { token: UiIslandToken, plugin: ReactIslandRendererPlugin, declaration: ReactIslandRendererPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: configuration.artifactIdentity ?? '@treeseed-cordis/ui@0.0.0-cordis.5' } }, scope = await UiScope.create(configuration, [registration]);
        let renderer: ProviderLease<UiIslandRendering> | undefined;
        try {
            renderer = await scope.service(UiIslandToken);
            return new OwnedIslandBinding(await renderer.value.prepare(value, host), renderer, scope);
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
