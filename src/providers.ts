import { z } from 'zod';
import { Context, CordisComposition, CordisServiceLocator, type CompositionHandle, type ProviderRegistration, type ProviderLease } from '@treeseed-cordis/sdk/composition';
import { ProviderV4Schemas, type NativeProviderDeclaration, type ProviderSelection, CapabilityToken, CanonicalJson } from '@treeseed-cordis/sdk/portable';
import { UiSchemas, UiTokens, type UiComponent, type UiTheme } from './contracts.js';
import { UiStack, UiText, UiStatus, UiTable, UiForm, UiNavigation, UiFeedback } from './react.js';
import { UiStyles } from './styles.js';
export class UiPackageIdentity {static readonly artifact='@treeseed-cordis/ui@0.0.0-cordis.9';}
export class UiTextSafety {
    static clean(value: string): string { return value.replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, ''); }
}
class UiDeclaration {
    static create(id: string, provide: string[], inject: string[]): NativeProviderDeclaration { return ProviderV4Schemas.declaration.parse({ id, pluginId: 'ui', capability: provide[0], contractVersion: ProviderV4Schemas.version, target: 'browser', provide, inject }); }
}
export class UiProviderPolicy {
    static readonly replacement = Object.freeze({ kind: 'restart' as const, stateVersion: 1, qualificationDigest: null });
}
abstract class ComponentProvider implements UiComponent {
    static readonly provide: string[] = [];
    static readonly inject: string[] = [];
    static readonly Config = z.strictObject({});
    static readonly replacement = UiProviderPolicy.replacement;
    abstract readonly component: UiComponent['component'];
    abstract readonly schema: z.ZodType;
    constructor(context: Context) { context.provide((this.constructor as typeof ComponentProvider).provide[0]!, this); }
    validate(value: unknown): unknown { return this.schema.parse(value); }
    modelSchema(): unknown { return z.toJSONSchema(this.schema, { unrepresentable: "throw" }); }
    abstract terminal(value: unknown): string;
}
export class StackComponentPlugin extends ComponentProvider {
 static override readonly provide=['ui.component.stack'];static readonly declaration=UiDeclaration.create('ui.stack.default',this.provide,this.inject);
 readonly component=UiStack;readonly schema=UiSchemas.stackModel;
 children(value:unknown){return UiSchemas.stackModel.parse(value).children;}
 terminal(value:unknown,children:readonly string[]=[]):string{const model=UiSchemas.stackModel.parse(value);return UiTextSafety.clean([...(model.title?[model.title]:[]),...children].join('\n\n'));}
}
export class TextComponentPlugin extends ComponentProvider {
    static override readonly provide = ['ui.component.text'];
    static readonly declaration = UiDeclaration.create('ui.text.default', this.provide, this.inject);
    readonly component = UiText;
    readonly schema = UiSchemas.textModel;
    terminal(value: unknown): string { return UiTextSafety.clean(UiSchemas.textModel.parse(value).text); }
}
export class StatusComponentPlugin extends ComponentProvider {
    static override readonly provide = ['ui.component.status'];
    static readonly declaration = UiDeclaration.create('ui.status.default', this.provide, this.inject);
    readonly component = UiStatus;
    readonly schema = UiSchemas.statusModel;
    terminal(value: unknown): string { const model = UiSchemas.statusModel.parse(value); return UiTextSafety.clean(model.title + ': ' + model.state + (model.detail ? '\n' + model.detail : '')); }
}
export class TableComponentPlugin extends ComponentProvider {
    static override readonly provide = ['ui.component.table'];
    static readonly declaration = UiDeclaration.create('ui.table.default', this.provide, this.inject);
    readonly component = UiTable;
    readonly schema = UiSchemas.tableModel;
    terminal(value: unknown): string {
        const model = UiSchemas.tableModel.parse(value), lines = [model.title, model.columns.join(' | ')];
        for (const row of model.rows) {
            if (row.length !== model.columns.length)
                throw new Error('INVALID_UI_TABLE');
            lines.push(row.join(' | '));
        }
        return UiTextSafety.clean(lines.join('\n'));
    }
}
export class FormComponentPlugin extends ComponentProvider {
    static override readonly provide = ['ui.component.form'];
    static readonly declaration = UiDeclaration.create('ui.form.default', this.provide, this.inject);
    readonly component = UiForm;
    readonly schema = UiSchemas.formModel;
    terminal(value: unknown): string {
        const model = UiSchemas.formModel.parse(value), lines = [model.title];
        for (const field of model.fields)
            lines.push(field.label + (field.required ? ' (required)' : ''));
        lines.push(model.submitLabel);
        return UiTextSafety.clean(lines.join('\n'));
    }
}
export class NavigationComponentPlugin extends ComponentProvider {
    static override readonly provide = ['ui.component.navigation'];
    static readonly declaration = UiDeclaration.create('ui.navigation.default', this.provide, this.inject);
    readonly component = UiNavigation;
    readonly schema = UiSchemas.navigationModel;
    terminal(value: unknown): string {
        const model = UiSchemas.navigationModel.parse(value), lines = [model.label];
        for (const item of model.items)
            lines.push(item.label + ' ' + item.href);
        return UiTextSafety.clean(lines.join('\n'));
    }
}
export class FeedbackComponentPlugin extends ComponentProvider {
    static override readonly provide = ['ui.component.feedback'];
    static readonly declaration = UiDeclaration.create('ui.feedback.default', this.provide, this.inject);
    readonly component = UiFeedback;
    readonly schema = UiSchemas.feedbackModel;
    terminal(value: unknown): string { const model = UiSchemas.feedbackModel.parse(value); return UiTextSafety.clean(model.title + ': ' + model.message); }
}
export class DefaultThemePlugin implements UiTheme {
    static readonly provide = ['ui.theme'];
    static readonly inject: string[] = [];
    static readonly Config = z.strictObject({});
    static readonly replacement = UiProviderPolicy.replacement;
    static readonly declaration = UiDeclaration.create('ui.theme.default', this.provide, this.inject);
    constructor(context: Context) { context.provide('ui.theme', this); }
    css(): string { return UiStyles.css; }
}
export interface UiPresentation {
    readonly generation: string;
    identity(id: string): string;
    component(id: string): Promise<ProviderLease<UiComponent>>;
    theme(): Promise<ProviderLease<UiTheme>>;
}
class PresentationValidator {
    parse(value: unknown): UiPresentation {
        if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'component') !== 'function' || typeof Reflect.get(value, 'identity') !== 'function' || typeof Reflect.get(value, 'theme') !== 'function' || typeof Reflect.get(value, 'generation') !== 'string')
            throw new Error('INVALID_UI_PRESENTATION');
        return value as UiPresentation;
    }
}
export const UiPresentationToken = new CapabilityToken<UiPresentation>('ui.presentation', ProviderV4Schemas.version, new PresentationValidator());
class PresentationServices implements UiPresentation {
    constructor(private readonly context: Context, readonly generation: string) { }
    identity(id: string): string {
        const locator = CordisServiceLocator.from(this.context);
        for (const selected of locator.describe(UiTokens.component(id)))
            if (selected.selected)
                return selected.id;
        throw new Error('UI_COMPONENT_NOT_SELECTED');
    }
    component(id: string): Promise<ProviderLease<UiComponent>> { return CordisServiceLocator.from(this.context).acquire(UiTokens.component(id)); }
    theme(): Promise<ProviderLease<UiTheme>> { return CordisServiceLocator.from(this.context).acquire(UiTokens.theme); }
}
class UiContextReceiver {
    context: Context | null = null;
    accept(context: Context): void { this.context = context; }
}
export interface UiApplicationConfiguration {
    scopeId?: string;
    artifactIdentity?: string;
    registrations?: readonly ProviderRegistration[];
    selections?: readonly ProviderSelection[];
    expectedGeneration?: string;
}
export class UiScope {
    private constructor(readonly handle: CompositionHandle, private readonly context: Context, readonly presentationGeneration: string) { }
    static defaults(identity = UiPackageIdentity.artifact): ProviderRegistration[] {
        const classes = [StackComponentPlugin, TextComponentPlugin, StatusComponentPlugin, TableComponentPlugin, FormComponentPlugin, NavigationComponentPlugin, FeedbackComponentPlugin], result: ProviderRegistration[] = [];
        for (const plugin of classes)
            result.push({ token: UiTokens.component(plugin.provide[0]!.slice('ui.component.'.length)), plugin, declaration: plugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity } });
        result.push({ token: UiTokens.theme, plugin: DefaultThemePlugin, declaration: DefaultThemePlugin.declaration, configuration: {}, artifact: { kind: 'bundled', identity } });
        return result;
    }
    static async create(configuration: UiApplicationConfiguration = {}, extensions: readonly ProviderRegistration[] = []): Promise<UiScope> {
        const scopeId = configuration.scopeId ?? 'ui', registrations = [...(configuration.registrations ?? this.defaults(configuration.artifactIdentity)), ...extensions], selections: ProviderSelection[] = [];
        if (configuration.selections)
            selections.push(...configuration.selections);
        else
            for (const item of registrations) {
                const declaration = ProviderV4Schemas.declaration.parse(item.declaration);
                selections.push({ scopeId, capability: item.token.id, providerId: declaration.id });
            }
        if (configuration.selections)
            for (const item of extensions)
                if (!selections.some(UiScope.capability.bind(null, item.token.id))) {
                    const declaration = ProviderV4Schemas.declaration.parse(item.declaration);
                    selections.push({ scopeId, capability: item.token.id, providerId: declaration.id });
                }
        for (const item of registrations)
            if (item.token.id === UiPresentationToken.id)
                throw new Error('RESERVED_UI_PRESENTATION');
        const projection = registrations.filter(UiScope.selectedPresentation.bind(null, selections)).map(UiScope.providerIdentity).sort(UiScope.identityOrder), selectedProjection = selections.filter(UiScope.presentationSelection).map(UiScope.presentationIdentity).sort(UiScope.selectionOrder), presentationGeneration = await UiScope.digest({ providers: projection, selections: selectedProjection });
        const inject = ['cordis.composition', 'ui.theme'];
        for (const selection of selections)
            if (selection.capability.startsWith('ui.component.'))
                inject.push(selection.capability);
        class PresentationPlugin {
            static readonly provide = ['ui.presentation'];
            static readonly inject = inject;
            static readonly Config = z.strictObject({});
            static readonly replacement = UiProviderPolicy.replacement;
            constructor(context: Context) { context.provide('ui.presentation', new PresentationServices(context, presentationGeneration)); }
        }
        registrations.push({ token: UiPresentationToken, plugin: PresentationPlugin, declaration: UiDeclaration.create('ui.presentation.default', PresentationPlugin.provide, inject), configuration: {}, artifact: { kind: 'bundled', identity: configuration.artifactIdentity ?? UiPackageIdentity.artifact } });
        selections.push({ scopeId, capability: UiPresentationToken.id, providerId: 'ui.presentation.default' });
        const handle = await CordisComposition.start({ registrations, selections }, { scopeId, target: 'browser', principalId: 'presentation', resourceScope: 'ui' });
        try {
            if (configuration.expectedGeneration && configuration.expectedGeneration !== handle.generation)
                throw new Error('UI_GENERATION_MISMATCH');
            const receiver = new UiContextReceiver(), consumerInject = ['cordis.composition'];
            for (const selection of selections)
                consumerInject.push(selection.capability);
            class UiConsumer {
                static readonly inject = consumerInject;
                constructor(context: Context) { receiver.accept(context); }
            }
            await handle.mount(UiConsumer, undefined);
            if (!receiver.context)
                throw new Error('UI_CONTEXT_UNAVAILABLE');
            return new UiScope(handle, receiver.context, presentationGeneration);
        }
        catch (error) {
            await handle.dispose();
            throw error;
        }
    }
    private static selectedPresentation(selections: ProviderSelection[], registration: ProviderRegistration): boolean {
        if (!UiScope.presentationRegistration(registration))
            return false;
        const declaration = ProviderV4Schemas.declaration.parse(registration.declaration);
        for (const selection of selections)
            if (selection.capability === registration.token.id && selection.providerId === declaration.id)
                return true;
        return false;
    }
    private static presentationIdentity(value: ProviderSelection): {
        capability: string;
        providerId: string;
    } { return { capability: value.capability, providerId: value.providerId }; }
    private static presentationRegistration(value: ProviderRegistration): boolean { return value.token.id.startsWith('ui.component.') || value.token.id === 'ui.theme'; }
    private static presentationSelection(value: ProviderSelection): boolean { return value.capability.startsWith('ui.component.') || value.capability === 'ui.theme'; }
    private static providerIdentity(value: ProviderRegistration): {
        declaration: unknown;
        configuration: unknown;
        artifact: unknown;
    } { return { declaration: value.declaration, configuration: value.configuration, artifact: value.artifact }; }
    private static identityOrder(a: unknown, b: unknown): number { return UiScope.order(CanonicalJson.stringify(a), CanonicalJson.stringify(b)); }
    private static selectionOrder(a: {
        capability: string;
    }, b: {
        capability: string;
    }): number { return UiScope.order(a.capability, b.capability); }
    private static order(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
    private static async digest(value: unknown): Promise<string> {
        const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(CanonicalJson.stringify(value))));
        let result = '';
        for (const byte of bytes)
            result += byte.toString(16).padStart(2, '0');
        return result;
    }
    private static capability(id: string, selection: ProviderSelection): boolean { return selection.capability === id; }
    service<T extends object>(token: CapabilityToken<T>): Promise<ProviderLease<T>> { return this.handle.locator(this.context).acquire(token); }
    identity(token: CapabilityToken): {
        providerId: string;
        generation: string;
    } {
        for (const item of this.handle.describe(token))
            if (item.selected)
                return { providerId: item.id, generation: this.handle.generation };
        throw new Error('UI_RENDERER_NOT_SELECTED');
    }
    component(id: string): Promise<ProviderLease<UiComponent>> { return this.handle.locator(this.context).acquire(UiTokens.component(id)); }
    theme(): Promise<ProviderLease<UiTheme>> { return this.handle.locator(this.context).acquire(UiTokens.theme); }
    dispose(): Promise<void> { return this.handle.dispose(); }
}
