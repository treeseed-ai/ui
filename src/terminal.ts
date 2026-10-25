import { z } from 'zod';
import { CapabilityToken, ProviderV4Schemas } from '@treeseed-cordis/sdk/portable';
import { Context, type ProviderLease, type ProviderRegistration } from '@treeseed-cordis/sdk/composition';
import { UiSchemas, type UiViewModel, type RenderedTerminal } from './contracts.js';
import { UiProviderPolicy, UiScope, type UiApplicationConfiguration, type UiPresentation } from './providers.js';
export interface UiTerminalRendering {
    render(view: UiViewModel): Promise<RenderedTerminal>;
}
class TerminalValidator {
    parse(value: unknown): UiTerminalRendering {
        if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'render') !== 'function')
            throw new Error('INVALID_UI_TERMINAL_RENDERER');
        return value as UiTerminalRendering;
    }
}
export const UiTerminalToken = new CapabilityToken<UiTerminalRendering>('ui.renderer.terminal', ProviderV4Schemas.version, new TerminalValidator());
export class PlainTerminalRenderer implements UiTerminalRendering {
    constructor(private readonly presentation: UiPresentation) { }
    async render(value: UiViewModel): Promise<RenderedTerminal> {
        const view = UiSchemas.view.parse(value), component = await this.presentation.component(view.componentId);
        try {
            component.value.validate(view.model);
            return { text: component.value.terminal(view.model) + '\n' };
        }
        finally {
            await component.release();
        }
    }
}
export class PlainTerminalRendererPlugin extends PlainTerminalRenderer {
    static readonly provide = ['ui.renderer.terminal'];
    static readonly inject = ['ui.presentation'];
    static readonly Config = z.strictObject({});
    static readonly replacement = UiProviderPolicy.replacement;
    static readonly declaration = ProviderV4Schemas.declaration.parse({ id: 'ui.renderer.terminal.default', pluginId: 'ui', capability: this.provide[0], contractVersion: ProviderV4Schemas.version, target: 'browser', provide: this.provide, inject: this.inject });
    constructor(context: Context) { super(Reflect.get(context, 'ui.presentation') as UiPresentation); context.provide('ui.renderer.terminal', this); }
}
export class UiTerminalRenderer {
    private disposal: Promise<void> | null = null;
    private constructor(private readonly scope: UiScope, private readonly renderer: ProviderLease<UiTerminalRendering>) { }
    static async create(configuration: UiApplicationConfiguration = {}): Promise<UiTerminalRenderer> {
        const registration: ProviderRegistration = { token: UiTerminalToken, plugin: PlainTerminalRendererPlugin, declaration: PlainTerminalRendererPlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity: configuration.artifactIdentity ?? '@treeseed-cordis/ui@0.0.0-cordis.5' } }, scope = await UiScope.create(configuration, [registration]);
        try {
            return new UiTerminalRenderer(scope, await scope.service(UiTerminalToken));
        }
        catch (error) {
            await scope.dispose();
            throw error;
        }
    }
    async render(value: UiViewModel): Promise<RenderedTerminal> { return this.renderer.value.render(value); }
    identity(): {
        providerId: string;
        generation: string;
    } { return this.scope.identity(UiTerminalToken); }
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
