import { Context, type ProviderLease, type ProviderRegistration } from '@treeseed-cordis/sdk/composition';
import { CanonicalJson, CapabilityToken, ProviderV4Schemas } from '@treeseed-cordis/sdk/portable';
import { z } from 'zod';
import type { UiComponent, UiTheme } from './contracts.js';
import { UiContributionIdentity } from './contribution.js';
import { UiPresentationToken } from './providers.js';
import { UiStyles } from './styles.js';
import { createElement } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { UiDocumentBoundary, UiSchemas, type UiViewModel, type UiMount, type UiHydrationData, type UiScopeHandle, type UiActionDispatcher, type UiActionResult } from './contracts.js';
import { UiSurface, UiRenderTree, type UiRenderObserver } from './react.js';
import { UiPackageIdentity, UiProviderPolicy, UiScope, type UiApplicationConfiguration, type UiPresentation } from './providers.js';
export interface UiHostAdapters {
    actions?: UiActionDispatcher;
    actionIds: readonly string[];
    assetGeneration: string;
}
class UiAdmittedActions implements UiActionDispatcher {
 private closed=false;private pending=0;private readonly waiters=new Set<()=>void>();
 constructor(private readonly host:UiHostAdapters){}
 invoke(id:string,input:Readonly<Record<string,string>>):Promise<UiActionResult>{if(this.closed||!this.host.actions||!this.host.actionIds.includes(id))return Promise.reject(new Error('UI_ACTION_DENIED'));this.pending++;return this.call(id,input);}
 private async call(id:string,input:Readonly<Record<string,string>>):Promise<UiActionResult>{try{return await this.host.actions!.invoke(id,input);}finally{this.pending--;if(!this.pending){for(const waiter of this.waiters)waiter();this.waiters.clear();}}}
 close():Promise<void>{this.closed=true;return this.pending?new Promise<void>(this.wait.bind(this)):Promise.resolve();}
 private wait(resolve:()=>void):void{this.waiters.add(resolve);}
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
    private pending:Promise<void>|null=null;private fenced=false;
    constructor(readonly generation:string,private readonly root:Root,private tree:UiRenderTree,private readonly theme:ProviderLease<UiTheme>,private readonly presentation:UiPresentation,private readonly cssUrl:string,private readonly actions?:UiAdmittedActions){this.rootGeneration=generation;}
    view():UiViewModel{if(this.disposal||this.fenced)throw new Error('UI_MOUNT_CLOSED');return UiSchemas.view.parse(this.tree.root.view);}
    async update(view:UiViewModel):Promise<void>{if(this.disposal||this.fenced)throw new Error('UI_MOUNT_CLOSED');if(this.pending)throw new Error('UI_UPDATE_IN_PROGRESS');this.pending=this.replace(view);try{await this.pending;}finally{this.pending=null;}}
    private async replace(value:UiViewModel):Promise<void>{let candidate:UiRenderTree|undefined,readiness:UiReadiness|undefined,rendered=false;try{candidate=await UiRenderTree.prepare(value,this.presentation);if(this.disposal)throw new Error('UI_MOUNT_CLOSED');readiness=new UiReadiness();rendered=true;this.root.render(createElement(UiSurface,{component:candidate.root.component.component,tree:candidate.root,view:candidate.root.view,cssUrl:this.cssUrl,actions:this.actions,observer:readiness}));await readiness.promise;const previous=this.tree;this.tree=candidate;candidate=undefined;await previous.dispose();}catch(error){readiness?.cancel();if(rendered){this.fenced=true;await this.actions?.close();this.root.unmount();}await candidate?.dispose();throw error;}}
    dispose(): Promise<void> {
        if (!this.disposal)
            this.disposal = this.close();
        return this.disposal;
    }
    private async close(): Promise<void> {
        await this.actions?.close();try{await this.pending;}catch{}
        let failed = false;
        try {
            this.root.unmount();
        }
        catch {
            failed = true;
        }
        try {
            await this.tree.dispose();
        }
        catch {
            failed = true;
        }
        try {
            await this.theme.release();
        }
        catch {
            failed = true;
        }
        if (failed)
            throw new Error('UI_CLEANUP_FAILED');
    }
}
class UiAttachedScope implements UiScopeHandle {
    constructor(private readonly scope: UiScope) { }
    dispose(): Promise<void> { return this.scope.dispose(); }
}
export interface UiBrowserRendering {
    mount(target: Element, view: UiViewModel, host?: UiHostAdapters, hydrate?: boolean, bootstrap?:UiHydrationData): Promise<UiMount>;
}
class BrowserValidator {
    parse(value: unknown): UiBrowserRendering {
        if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'mount') !== 'function')
            throw new Error('INVALID_UI_BROWSER_RENDERER');
        return value as UiBrowserRendering;
    }
}
export const UiBrowserToken = new CapabilityToken<UiBrowserRendering>('ui.renderer.browser', ProviderV4Schemas.version, new BrowserValidator());
export class ReactBrowserRenderer implements UiBrowserRendering {
    constructor(private readonly presentation: UiPresentation) { }
    async mount(target: Element, value: UiViewModel, host?: UiHostAdapters, hydrate = false, bootstrap?:UiHydrationData): Promise<UiMount> {
        const view = UiSchemas.view.parse(value);
        let root: Root | undefined, tree: UiRenderTree | undefined, theme: ProviderLease<UiTheme> | undefined, readiness: UiReadiness | undefined, actions:UiAdmittedActions|undefined;
        try {
            tree = await UiRenderTree.prepare(view,this.presentation);
            theme = await this.presentation.theme();

            readiness = new UiReadiness();
            const style=await UiStyles.asset(theme.value.css());
            let admitted=host;
            if(hydrate){if(!bootstrap||!host)throw new Error('UI_BOOTSTRAP_REQUIRED');const accepted=UiSchemas.hydration.parse(bootstrap);if(CanonicalJson.stringify(accepted.view)!==CanonicalJson.stringify(view))throw new Error('UI_BOOTSTRAP_MISMATCH');if(accepted.presentationGeneration!==this.presentation.generation)throw new Error('UI_GENERATION_MISMATCH');if(accepted.assetGeneration!==host.assetGeneration)throw new Error('UI_ASSET_MISMATCH');for(const action of accepted.actionIds)if(!host.actionIds.includes(action))throw new Error('UI_ACTION_DENIED');UiContributionIdentity.assert(accepted.contribution,await tree.contribution(style.digest));admitted={...host,actionIds:accepted.actionIds};}
            actions=admitted?new UiAdmittedActions(admitted):undefined;
            const element = createElement(UiSurface, { component: tree.root.component.component, tree:tree.root, view, cssUrl:style.path, actions, observer: readiness });
            root = hydrate ? hydrateRoot(target, element) : createRoot(target);
            if (!hydrate)
                root.render(element);
            await readiness.promise;
            return new UiMountedRoot(this.presentation.generation, root, tree, theme,this.presentation,style.path,actions);
        }
        catch (error) {
            readiness?.cancel();await actions?.close();
            try {
                root?.unmount();
            }
            finally {
                try {
                    await tree?.dispose();
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
    static readonly replacement = UiProviderPolicy.replacement;
    static readonly declaration = ProviderV4Schemas.declaration.parse({ id: 'ui.renderer.browser.default', pluginId: 'ui', capability: this.provide[0], contractVersion: ProviderV4Schemas.version, target: 'browser', provide: this.provide, inject: this.inject });
    constructor(context: Context) { super(Reflect.get(context, 'ui.presentation') as UiPresentation); context.provide('ui.renderer.browser', this); }
}
class UiOwnedMount implements UiMount {
    private disposal: Promise<void> | null = null;
    readonly generation: string;
    readonly rootGeneration: string;
    constructor(private readonly inner: UiMount, private readonly renderer: ProviderLease<UiBrowserRendering>, private readonly scope: UiScope) { this.generation = inner.generation; this.rootGeneration = scope.handle.generation; }
    view():UiViewModel{if(this.disposal)throw new Error('UI_MOUNT_CLOSED');return this.inner.view();}
    update(view:UiViewModel):Promise<void>{if(this.disposal)return Promise.reject(new Error('UI_MOUNT_CLOSED'));return this.inner.update(view);}
    dispose(): Promise<void> {
        if (!this.disposal)
            this.disposal = this.close();
        return this.disposal;
    }
    private async close(): Promise<void> {
        let failed = false;
        try {
            await this.inner.dispose();
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
export class UiBrowserRenderer {
    constructor(private readonly configuration: UiApplicationConfiguration = {}) { }
    async mount(target: Element, value: UiViewModel, host?: UiHostAdapters, hydrate = false, bootstrap?:UiHydrationData): Promise<UiMount> {
        const registration: ProviderRegistration = { token: UiBrowserToken, plugin: ReactBrowserRendererPlugin, declaration: ReactBrowserRendererPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: this.configuration.artifactIdentity ?? UiPackageIdentity.artifact } }, scope = await UiScope.create(this.configuration, [registration]);
        let renderer: ProviderLease<UiBrowserRendering> | undefined;
        try {
            renderer = await scope.service(UiBrowserToken);
            return new UiOwnedMount(await renderer.value.mount(target, value, host, hydrate, bootstrap), renderer, scope);
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
    static hydrateDocument(host:UiHostAdapters,configuration:UiApplicationConfiguration={}):Promise<UiMount>{const target=document.getElementById(UiDocumentBoundary.rootId),element=document.getElementById(UiDocumentBoundary.bootstrapId);if(document.querySelectorAll('#'+UiDocumentBoundary.rootId).length!==1||document.querySelectorAll('#'+UiDocumentBoundary.bootstrapId).length!==1||!target||!element||element.tagName!=='SCRIPT'||element.getAttribute('type')!=='application/json'||!element.textContent||new TextEncoder().encode(element.textContent).byteLength>4*1024*1024)throw new Error('UI_BOOTSTRAP_REQUIRED');let value:unknown;try{value=JSON.parse(element.textContent);}catch{throw new Error('UI_BOOTSTRAP_REQUIRED');}return this.hydrate(target,UiSchemas.hydration.parse(value),host,configuration);}
    static hydrate(target:Element,bootstrap:UiHydrationData,host:UiHostAdapters,configuration:UiApplicationConfiguration={}):Promise<UiMount>{const accepted=UiSchemas.hydration.parse(bootstrap);return new UiBrowserRenderer(configuration).mount(target,accepted.view,host,true,accepted);}
    static async attach(value: UiHydrationData, host: UiHostAdapters, configuration: UiApplicationConfiguration = {}): Promise<UiScopeHandle> {
        const bootstrap = UiSchemas.hydration.parse(value);
        if (bootstrap.assetGeneration !== host.assetGeneration)
            throw new Error('UI_ASSET_MISMATCH');
        for (const action of bootstrap.actionIds)
            if (!host.actionIds.includes(action))
                throw new Error('UI_ACTION_DENIED');
        const scope = await UiScope.create(configuration);
        if (bootstrap.presentationGeneration !== scope.presentationGeneration) {
            await scope.dispose();
            throw new Error('UI_GENERATION_MISMATCH');
        }
        try {
            const presentation = await scope.service(UiPresentationToken);
            try {
                const tree = await UiRenderTree.prepare(bootstrap.view,presentation.value);
                let theme:ProviderLease<UiTheme>|undefined;
                try {
                    theme=await presentation.value.theme();
                    UiContributionIdentity.assert(bootstrap.contribution, await tree.contribution((await UiStyles.asset(theme.value.css())).digest));
                }
                finally {
                    try{await tree.dispose();}finally{await theme?.release();}
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
        }
    }
}
