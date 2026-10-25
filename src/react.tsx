import { Component, createRef, createElement, type ReactNode } from 'react';
import type {ProviderLease} from '@treeseed-cordis/sdk/composition';
import type {UiPresentation} from './providers.js';
import {UiContributionIdentity} from './contribution.js';
import { UiSchemas, type UiComponent, type UiViewModel, type UiContribution, type UiActionDispatcher, type UiComponentProps } from './contracts.js';
export class UiStack extends Component<UiComponentProps> {
 render():ReactNode{const model=UiSchemas.stackModel.parse(this.props.model);if(!this.props.children)throw new Error('UI_COMPOSITE_NOT_PREPARED');return <section aria-label={model.title}>{model.title&&<h1>{model.title}</h1>}<div className="ui-stack">{this.props.children}</div></section>;}
}
export interface UiRenderNode {view:UiViewModel;component:UiComponent;children:UiRenderNode[];}
export class UiRenderTree {
 private readonly leases:ProviderLease<UiComponent>[]=[];private readonly ids=new Set<string>();private readonly nodes:UiRenderNode[]=[];
 root!:UiRenderNode;private disposal:Promise<void>|null=null;
 private constructor(private readonly presentation:UiPresentation){}
 static async prepare(view:UiViewModel,presentation:UiPresentation):Promise<UiRenderTree>{const tree=new UiRenderTree(presentation);try{tree.root=await tree.prepareNode(view,0);return tree;}catch(error){await tree.dispose();throw error;}}
 private async prepareNode(value:UiViewModel,depth:number):Promise<UiRenderNode>{const view=UiSchemas.view.parse(value);if(depth>8||this.ids.size>=256||this.ids.has(view.id))throw new Error('INVALID_UI_TREE');this.ids.add(view.id);const lease=await this.presentation.component(view.componentId);this.leases.push(lease);lease.value.validate(view.model);const node:UiRenderNode={view,component:lease.value,children:[]};this.nodes.push(node);for(const child of lease.value.children?.(view.model)??[])node.children.push(await this.prepareNode(child,depth+1));return node;}
 async contribution(styleDigest:string):Promise<UiContribution>{const root=await UiContributionIdentity.create(this.root.view,this.presentation,this.root.component,styleDigest);if(this.nodes.length===1)return root;const members=[];for(const node of this.nodes.slice(1))members.push(await UiContributionIdentity.create(node.view,this.presentation,node.component,styleDigest));return UiSchemas.contribution.parse({...root,members});}
 terminal():string{return this.terminalNode(this.root);}
 private terminalNode(node:UiRenderNode):string{const children:string[]=[];for(const child of node.children)children.push(this.terminalNode(child));return node.component.terminal(node.view.model,children);}
 dispose():Promise<void>{if(!this.disposal)this.disposal=this.close();return this.disposal;}
 private async close():Promise<void>{let failed=false;for(const lease of this.leases.splice(0).reverse())try{await lease.release();}catch{failed=true;}if(failed)throw new Error('UI_CLEANUP_FAILED');}
}
export class UiTreeView extends Component<{node:UiRenderNode;actions?:UiActionDispatcher}> {
 private child(node:UiRenderNode):ReactNode{return createElement(UiTreeView,{key:node.view.id,node,actions:this.props.actions});}
 render():ReactNode{const node=this.props.node;return createElement(node.component.type(),{key:node.view.id,instanceId:node.view.id,model:node.view.model,actions:this.props.actions},...node.children.map(this.child.bind(this)));}
}
export class UiText extends Component<UiComponentProps> {
    render(): ReactNode { const model = UiSchemas.textModel.parse(this.props.model); return <p>{model.text}</p>; }
}
export class UiStatus extends Component<UiComponentProps> {
    render(): ReactNode { const model = UiSchemas.statusModel.parse(this.props.model); return <section className="ui-status" aria-labelledby={this.props.instanceId + '-title'}><h2 id={this.props.instanceId + '-title'}>{model.title}</h2><p role="status">{model.state}</p>{model.detail && <p>{model.detail}</p>}</section>; }
}
export class UiTable extends Component<UiComponentProps> {
    private header(text: string, index: number): ReactNode { return <th scope="col" key={index}>{text}</th>; }
    private cell(text: string, index: number): ReactNode { return <td key={index}>{text}</td>; }
    private row(values: string[], index: number): ReactNode { return <tr key={index}>{values.map(this.cell.bind(this))}</tr>; }
    render(): ReactNode { const model = UiSchemas.tableModel.parse(this.props.model); for (const row of model.rows)
        if (row.length !== model.columns.length)
            throw new Error('INVALID_UI_TABLE'); return <section><h2 id={this.props.instanceId + '-title'}>{model.title}</h2><div className="ui-table-scroll" role="region" tabIndex={0} aria-labelledby={this.props.instanceId + '-title'}><table><caption>{model.title}</caption><thead><tr>{model.columns.map(this.header.bind(this))}</tr></thead><tbody>{model.rows.map(this.row.bind(this))}</tbody></table></div></section>; }
}
export class UiForm extends Component<UiComponentProps, {
    pending: boolean;
    message: string;
}> {
    override state = { pending: false, message: '' };
    private field(field: {
        id: string;
        label: string;
        type: string;
        value?: string;
        required: boolean;
    }): ReactNode { const id = this.props.instanceId + '-' + field.id; return <label key={field.id} htmlFor={id}>{field.label}<input id={id} name={field.id} type={field.type} defaultValue={field.value ?? ''} required={field.required}/></label>; }
    private async submit(event: React.SubmitEvent<HTMLFormElement>): Promise<void> { event.preventDefault(); if (!this.props.actions || this.state.pending)
        return; const model = UiSchemas.formModel.parse(this.props.model), input: Record<string, string> = {...model.actionData}; for (const [key, value] of new FormData(event.currentTarget))
        if (typeof value === 'string')
            input[key] = value; this.setState({ pending: true, message: '' }); try {
        const result = await this.props.actions.invoke(model.actionId, input);
        this.setState({ message: result.message ?? (result.success ? 'Complete' : 'Action unavailable') });
    }
    catch {
        this.setState({ message: 'Action unavailable' });
    }
    finally {
        this.setState({ pending: false });
    } }
    render(): ReactNode { const model = UiSchemas.formModel.parse(this.props.model); return <form onSubmit={this.submit.bind(this)} aria-labelledby={this.props.instanceId + '-title'}><h2 id={this.props.instanceId + '-title'}>{model.title}</h2><div className="ui-fields">{model.fields.map(this.field.bind(this))}</div><button type="submit" disabled={!this.props.actions || this.state.pending}>{model.submitLabel}</button><p role="status" aria-live="polite">{this.state.message}</p></form>; }
}
export class UiNavigation extends Component<UiComponentProps> {
    private item(item: {
        label: string;
        href: string;
    }, index: number): ReactNode { return <li key={index}><a href={item.href}>{item.label}</a></li>; }
    render(): ReactNode { const model = UiSchemas.navigationModel.parse(this.props.model); return <nav aria-label={model.label}><ul>{model.items.map(this.item.bind(this))}</ul></nav>; }
}
export class UiFeedback extends Component<UiComponentProps> {
    render(): ReactNode { const model = UiSchemas.feedbackModel.parse(this.props.model); return <section className={'ui-feedback-' + model.tone} role={model.tone === 'error' ? 'alert' : 'status'}><h2>{model.title}</h2><p>{model.message}</p></section>; }
}
export interface UiRenderObserver {
    loaded(): void;
    failed(): void;
}
export interface UiSurfaceProps {
    component: React.ComponentClass<UiComponentProps>;
    tree?:UiRenderNode;
    view: {
        id: string;
        model: unknown;
    };
    cssUrl: string;
    hostStyles?: boolean;
    observer?: UiRenderObserver;
    actions?: UiComponentProps['actions'];
}
export class UiSurface extends Component<UiSurfaceProps, {
    styled: boolean;
}> {
    override state = { styled: false };
    private readonly link = createRef<HTMLLinkElement>();
    override componentDidMount(): void { if (this.props.hostStyles) {
        const expected = new URL(this.props.cssUrl, document.baseURI).href;
        for (const sheet of document.styleSheets)
            if (sheet.href === expected) {
                this.loaded();
                return;
            }
        this.failed();
    }
    else if (this.link.current?.sheet)
        this.loaded(); }
    override componentDidUpdate(previous:Readonly<UiSurfaceProps>):void{if(previous.observer!==this.props.observer&&this.state.styled)this.acknowledge();}
    private loaded(): void { if (this.state.styled)
        this.acknowledge();
    else
        this.setState({ styled: true }, this.acknowledge.bind(this)); }
    private acknowledge(): void { this.props.observer?.loaded(); }
    private failed(): void { this.props.observer?.failed(); }
    render(): ReactNode { const Selected = this.props.component; return <main className="trsd-ui" data-ui-styled={String(this.state.styled)}>{!this.props.hostStyles && <link ref={this.link} rel="stylesheet" href={this.props.cssUrl} onLoad={this.loaded.bind(this)} onError={this.failed.bind(this)}/>}{this.props.tree?<UiTreeView node={this.props.tree} actions={this.state.styled?this.props.actions:undefined}/>:<Selected instanceId={this.props.view.id} model={this.props.view.model} actions={this.state.styled ? this.props.actions : undefined}/>}</main>; }
}
