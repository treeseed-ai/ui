import { z } from 'zod';
import { CapabilityToken, ProviderV4Schemas, type AdapterValidator } from '@treeseed-cordis/sdk/portable';
import type { ComponentClass, ReactNode } from 'react';
class UiValidation {
    static table(model: {
        columns: string[];
        rows: string[][];
    }): boolean { for (const row of model.rows)
        if (row.length !== model.columns.length)
            return false; return true; }
    static form(model: {
        actionData?:Record<string,string>;
        fields: Array<{
            id: string;
            type: string;
            value?: string;
        }>;
    }): boolean { if(Object.keys(model.actionData??{}).length>64)return false;const ids = new Set<string>();for(const key of Object.keys(model.actionData??{})){if(/password|secret|token|credential/i.test(key))return false;ids.add(key);} for (const field of model.fields) {
        if (ids.has(field.id) || (field.type === 'password' && field.value !== undefined))
            return false;
        ids.add(field.id);
    } return true; }
    static script(value:{path:string;sha256:string}):boolean{return value.path.includes(value.sha256);}
    static unique(values:string[]):boolean{return new Set(values).size===values.length;}
    static href(value: string): boolean { if (/[\\\x00-\x20\x7f]/.test(value))
        return false; if (value.startsWith('/'))
        return !value.startsWith('//'); if (value.startsWith('#'))
        return /^#[a-zA-Z0-9_-]+$/.test(value); try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password;
    }
    catch {
        return false;
    } }
}
export class UiSchemas {
    static readonly id = z.string().regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/);
    static readonly text = z.string().max(16384);
    static readonly action = this.id;
    static readonly view = z.strictObject({ id: this.id, componentId: this.id, model: z.json() });
    static readonly stackModel = z.strictObject({title:this.text.optional(),children:z.array(this.view).min(1).max(256)});
    static readonly textModel = z.strictObject({ text: this.text });
    static readonly statusModel = z.strictObject({ title: this.text, state: this.text, detail: this.text.optional() });
    static readonly tableModel = z.strictObject({ title: this.text, columns: z.array(this.text).min(1).max(64), rows: z.array(z.array(this.text).max(64)).max(1000) }).refine(UiValidation.table);
    static readonly formModel = z.strictObject({ title: this.text, actionId: this.action, submitLabel: this.text, actionData:z.record(this.id,z.string().max(4096)).default({}), fields: z.array(z.strictObject({ id: this.id, label: this.text, type: z.enum(['text', 'email', 'password', 'number']).default('text'), value: this.text.optional(), required: z.boolean().default(false) })).max(64) }).refine(UiValidation.form);
    static readonly navigationModel = z.strictObject({ label: this.text, items: z.array(z.strictObject({ label: this.text, href: z.string().max(2048).refine(UiValidation.href) })).max(128) });
    static readonly feedbackModel = z.strictObject({ title: this.text, message: this.text, tone: z.enum(['info', 'success', 'error']) });
    static readonly member = z.strictObject({ id: this.id, componentId: this.id, providerId: this.id, modelSchemaDigest: z.string().regex(/^[a-f0-9]{64}$/), styleDigest: z.string().regex(/^[a-f0-9]{64}$/) });
    static readonly contribution = this.member.extend({members:z.array(this.member).max(255).optional()});
    static readonly script=z.strictObject({path:z.string().regex(/^\/assets\/[a-zA-Z0-9/_-]+\.js$/),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).refine(UiValidation.script);
    static readonly document=z.strictObject({title:this.text,language:z.string().regex(/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/).default('en'),view:this.view,script:this.script,assetGeneration:z.string().regex(/^[a-f0-9]{64}$/),actionIds:z.array(this.action).max(128).refine(UiValidation.unique)});
    static readonly hydration = z.strictObject({ view: this.view, contribution: this.contribution, presentationGeneration: z.string().regex(/^[a-f0-9]{64}$/), assetGeneration: z.string().regex(/^[a-f0-9]{64}$/), actionIds: z.array(this.action).max(128) });
}
export type UiDocumentOptions=z.input<typeof UiSchemas.document>;
export interface RenderedDocument {html:string;bootstrap:UiHydrationData;assets:readonly string[];}
export class UiDocumentBoundary {static readonly rootId='trsd-ui-root';static readonly bootstrapId='trsd-ui-bootstrap';}
export type UiViewModel = z.infer<typeof UiSchemas.view>;
export type UiContribution = z.infer<typeof UiSchemas.contribution>;
export type UiHydrationData = z.infer<typeof UiSchemas.hydration>;
export interface UiActionResult {
    success: boolean;
    message: string | null;
}
export interface UiActionDispatcher {
    invoke(actionId: string, input: Readonly<Record<string, string>>): Promise<UiActionResult>;
}
export interface UiComponentProps {
    instanceId: string;
    model: unknown;
    actions?: UiActionDispatcher;
    children?:ReactNode;
}
export interface UiComponent {
    component: ComponentClass<UiComponentProps>;
    type():ComponentClass<UiComponentProps>;
    validate(value: unknown): unknown;
    modelSchema(): unknown;
    terminal(value: unknown, children?:readonly string[]): string;
    children?(value:unknown):UiViewModel[];
}
export interface UiTheme {
    css(): string;
}
export interface RenderedPage {
    html: string;
    contribution: UiContribution;
    generation: string;
    rootGeneration: string;
    assets: readonly string[];
}
export interface RenderedTerminal {
    text: string;
}
export interface UiScopeHandle {
    dispose(): Promise<void>;
}
export interface UiMount extends UiScopeHandle {
    view():UiViewModel;
    update(view:UiViewModel):Promise<void>;
    generation: string;
    rootGeneration: string;
}
class ComponentValidator implements AdapterValidator<UiComponent> {
    parse(value: unknown): UiComponent { if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'component') !== 'function' || !Reflect.get(value, 'component').prototype?.isReactComponent || typeof Reflect.get(value, 'type') !== 'function' || typeof Reflect.get(value, 'validate') !== 'function' || typeof Reflect.get(value, 'modelSchema') !== 'function' || typeof Reflect.get(value, 'terminal') !== 'function')
        throw new Error('INVALID_UI_COMPONENT'); return value as UiComponent; }
}
class ThemeValidator implements AdapterValidator<UiTheme> {
    parse(value: unknown): UiTheme { if (!value || typeof value !== 'object' || typeof Reflect.get(value, 'css') !== 'function')
        throw new Error('INVALID_UI_THEME'); return value as UiTheme; }
}
export class UiTokens {
    static readonly theme = new CapabilityToken<UiTheme>('ui.theme', ProviderV4Schemas.version, new ThemeValidator());
    static component(id: string): CapabilityToken<UiComponent> { UiSchemas.id.parse(id); return new CapabilityToken('ui.component.' + id, ProviderV4Schemas.version, new ComponentValidator()); }
}
