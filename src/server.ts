import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { z } from 'zod';
import { CapabilityToken, ProviderV4Schemas } from '@treeseed-cordis/sdk/portable';
import { Context, type ProviderLease, type ProviderRegistration } from '@treeseed-cordis/sdk/composition';
import { UiDocumentBoundary, UiSchemas, type UiDocumentOptions, type RenderedDocument, type UiViewModel, type RenderedPage } from './contracts.js';
import { UiSurface, UiRenderTree } from './react.js';
import { UiStyles } from './styles.js';
import { UiPackageIdentity, UiProviderPolicy, UiScope, type UiApplicationConfiguration, type UiPresentation } from './providers.js';
export interface UiServerRendering {
    render(view: UiViewModel): Promise<RenderedPage>;
    document(options:UiDocumentOptions):Promise<RenderedDocument>;
    styles(): Promise<{
        path: string;
        digest: string;
        css: string;
    }>;
}
class ServerValidator {
    parse(value: unknown): UiServerRendering {
        if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'render') !== 'function' || typeof Reflect.get(value, 'styles') !== 'function' || typeof Reflect.get(value,'document')!=='function')
            throw new Error('INVALID_UI_SERVER_RENDERER');
        return value as UiServerRendering;
    }
}
export const UiServerToken = new CapabilityToken<UiServerRendering>('ui.renderer.server', ProviderV4Schemas.version, new ServerValidator());
class DocumentMarkup {
 static escape(value:string):string{return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
 static render(options:ReturnType<typeof UiSchemas.document.parse>,page:RenderedPage,bootstrap:RenderedDocument['bootstrap']):string{const json=JSON.stringify(bootstrap).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');let raw='';for(let offset=0;offset<64;offset+=2)raw+=String.fromCharCode(Number.parseInt(options.script.sha256.slice(offset,offset+2),16));return '<!doctype html><html lang="'+this.escape(options.language)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+this.escape(options.title)+'</title></head><body><div id="'+UiDocumentBoundary.rootId+'">'+page.html+'</div><script type="application/json" id="'+UiDocumentBoundary.bootstrapId+'">'+json+'</script><script type="module" src="'+this.escape(options.script.path)+'" integrity="sha256-'+btoa(raw)+'"></script></body></html>';}
}
export class ReactServerRenderer implements UiServerRendering {
    constructor(private readonly presentation: UiPresentation) { }
    async document(input:UiDocumentOptions):Promise<RenderedDocument>{const options=UiSchemas.document.parse(input);if(new TextEncoder().encode(JSON.stringify(options.view)).byteLength>4*1024*1024)throw new Error('UI_BOOTSTRAP_LIMIT');const page=await this.render(options.view),bootstrap=UiSchemas.hydration.parse({view:options.view,contribution:page.contribution,presentationGeneration:page.generation,assetGeneration:options.assetGeneration,actionIds:options.actionIds});return {html:DocumentMarkup.render(options,page,bootstrap),bootstrap,assets:[...page.assets,options.script.path]};}
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
    document(options:UiDocumentOptions):Promise<RenderedDocument>{return this.renderer.value.document(options);}
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
