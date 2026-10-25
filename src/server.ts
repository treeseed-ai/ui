import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { z } from 'zod';
import { CapabilityToken, ProviderV4Schemas } from '@treeseed-cordis/sdk/portable';
import { Context, type ProviderLease, type ProviderRegistration } from '@treeseed-cordis/sdk/composition';
import { UiSchemas, type UiViewModel, type RenderedPage } from './contracts.js';
import { UiSurface, UiRenderTree } from './react.js';
import { UiStyles } from './styles.js';
import { UiPackageIdentity, UiProviderPolicy, UiScope, type UiApplicationConfiguration, type UiPresentation } from './providers.js';
export interface UiServerRendering {
    render(view: UiViewModel): Promise<RenderedPage>;
    styles(): Promise<{
        path: string;
        digest: string;
        css: string;
    }>;
}
class ServerValidator {
    parse(value: unknown): UiServerRendering {
        if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'render') !== 'function' || typeof Reflect.get(value, 'styles') !== 'function')
            throw new Error('INVALID_UI_SERVER_RENDERER');
        return value as UiServerRendering;
    }
}
export const UiServerToken = new CapabilityToken<UiServerRendering>('ui.renderer.server', ProviderV4Schemas.version, new ServerValidator());
export class ReactServerRenderer implements UiServerRendering {
    constructor(private readonly presentation: UiPresentation) { }
    async styles(): Promise<{
        path: string;
        digest: string;
        css: string;
    }> {
        const theme = await this.presentation.theme();
        try {
            return await UiStyles.asset(theme.value.css());
        }
        finally {
            await theme.release();
        }
    }
    async render(value: UiViewModel): Promise<RenderedPage> {
        const view = UiSchemas.view.parse(value), tree = await UiRenderTree.prepare(view,this.presentation);
        let theme:ProviderLease<import('./contracts.js').UiTheme>|undefined;
        try {
            theme=await this.presentation.theme();
            const style = await UiStyles.asset(theme.value.css()), html = renderToString(createElement(UiSurface, { component: tree.root.component.component, tree:tree.root, view, cssUrl: style.path }));
            return { html, contribution: await tree.contribution(style.digest), generation: this.presentation.generation, rootGeneration: this.presentation.generation, assets: [style.path] };
        }
        finally {
            try{await tree.dispose();}finally{await theme?.release();}
        }
    }
}
export class ReactServerRendererPlugin extends ReactServerRenderer {
    static readonly provide = ['ui.renderer.server'];
    static readonly inject = ['ui.presentation'];
    static readonly Config = z.strictObject({});
    static readonly replacement = UiProviderPolicy.replacement;
    static readonly declaration = ProviderV4Schemas.declaration.parse({ id: 'ui.renderer.server.default', pluginId: 'ui', capability: this.provide[0], contractVersion: ProviderV4Schemas.version, target: 'browser', provide: this.provide, inject: this.inject });
    constructor(context: Context) { super(Reflect.get(context, 'ui.presentation') as UiPresentation); context.provide('ui.renderer.server', this); }
}
export class UiServerRenderer {
    private disposal: Promise<void> | null = null;
    private constructor(private readonly scope: UiScope, private readonly renderer: ProviderLease<UiServerRendering>) { }
    static async create(configuration: UiApplicationConfiguration = {}): Promise<UiServerRenderer> {
        const registration: ProviderRegistration = { token: UiServerToken, plugin: ReactServerRendererPlugin, declaration: ReactServerRendererPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: configuration.artifactIdentity ?? UiPackageIdentity.artifact } }, scope = await UiScope.create(configuration, [registration]);
        try {
            return new UiServerRenderer(scope, await scope.service(UiServerToken));
        }
        catch (error) {
            await scope.dispose();
            throw error;
        }
    }
    render(value: UiViewModel): Promise<RenderedPage> { return this.project(value); }
    private async project(value: UiViewModel): Promise<RenderedPage> { const page = await this.renderer.value.render(value); return { ...page, rootGeneration: this.scope.handle.generation }; }
    styles(): Promise<{
        path: string;
        digest: string;
        css: string;
    }> { return this.renderer.value.styles(); }
    identity(): {
        providerId: string;
        generation: string;
    } { return this.scope.identity(UiServerToken); }
    dispose(): Promise<void> {
        if (!this.disposal)
            this.disposal = this.close();
        return this.disposal;
    }
    private async close(): Promise<void> {
        try {
            await this.renderer.release();
        }
        finally {
            await this.scope.dispose();
        }
    }
}
