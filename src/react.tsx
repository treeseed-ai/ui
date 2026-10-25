import { Component, createRef, type ReactNode } from 'react';
import { UiSchemas, type UiComponentProps } from './contracts.js';
export class UiText extends Component<UiComponentProps> {render():ReactNode {const model=UiSchemas.textModel.parse(this.props.model);return <p>{model.text}</p>;}}
export class UiStatus extends Component<UiComponentProps> {render():ReactNode {const model=UiSchemas.statusModel.parse(this.props.model);return <section className="ui-status" aria-labelledby={this.props.instanceId+'-title'}><h2 id={this.props.instanceId+'-title'}>{model.title}</h2><p role="status">{model.state}</p>{model.detail&&<p>{model.detail}</p>}</section>;}}
export class UiTable extends Component<UiComponentProps> {
  private header(text:string,index:number):ReactNode {return <th scope="col" key={index}>{text}</th>;}
  private cell(text:string,index:number):ReactNode {return <td key={index}>{text}</td>;}
  private row(values:string[],index:number):ReactNode {return <tr key={index}>{values.map(this.cell.bind(this))}</tr>;}
  render():ReactNode {const model=UiSchemas.tableModel.parse(this.props.model);for(const row of model.rows)if(row.length!==model.columns.length)throw new Error('INVALID_UI_TABLE');return <section><h2 id={this.props.instanceId+'-title'}>{model.title}</h2><div className="ui-table-scroll" role="region" tabIndex={0} aria-labelledby={this.props.instanceId+'-title'}><table><caption>{model.title}</caption><thead><tr>{model.columns.map(this.header.bind(this))}</tr></thead><tbody>{model.rows.map(this.row.bind(this))}</tbody></table></div></section>;}
}
export class UiForm extends Component<UiComponentProps,{pending:boolean;message:string}> {
  override state={pending:false,message:''};
  private field(field:{id:string;label:string;type:string;value?:string;required:boolean}):ReactNode {const id=this.props.instanceId+'-'+field.id;return <label key={field.id} htmlFor={id}>{field.label}<input id={id} name={field.id} type={field.type} defaultValue={field.value??''} required={field.required}/></label>;}
  private async submit(event:React.SubmitEvent<HTMLFormElement>):Promise<void> {event.preventDefault();if(!this.props.actions||this.state.pending)return;const model=UiSchemas.formModel.parse(this.props.model),input:Record<string,string>={};for(const [key,value] of new FormData(event.currentTarget))if(typeof value==='string')input[key]=value;this.setState({pending:true,message:''});try{const result=await this.props.actions.invoke(model.actionId,input);this.setState({message:result.message??(result.success?'Complete':'Action unavailable')});}catch{this.setState({message:'Action unavailable'});}finally{this.setState({pending:false});}}
  render():ReactNode {const model=UiSchemas.formModel.parse(this.props.model);return <form onSubmit={this.submit.bind(this)} aria-labelledby={this.props.instanceId+'-title'}><h2 id={this.props.instanceId+'-title'}>{model.title}</h2><div className="ui-fields">{model.fields.map(this.field.bind(this))}</div><button type="submit" disabled={!this.props.actions||this.state.pending}>{model.submitLabel}</button><p role="status" aria-live="polite">{this.state.message}</p></form>;}
}
export class UiNavigation extends Component<UiComponentProps> {private item(item:{label:string;href:string},index:number):ReactNode{return <li key={index}><a href={item.href}>{item.label}</a></li>;}render():ReactNode{const model=UiSchemas.navigationModel.parse(this.props.model);return <nav aria-label={model.label}><ul>{model.items.map(this.item.bind(this))}</ul></nav>;}}
export class UiFeedback extends Component<UiComponentProps> {render():ReactNode {const model=UiSchemas.feedbackModel.parse(this.props.model);return <section className={'ui-feedback-'+model.tone} role={model.tone==='error'?'alert':'status'}><h2>{model.title}</h2><p>{model.message}</p></section>;}}
export interface UiRenderObserver {loaded():void;failed():void;}
export interface UiSurfaceProps {component:React.ComponentClass<UiComponentProps>;view:{id:string;model:unknown};cssUrl:string;hostStyles?:boolean;observer?:UiRenderObserver;actions?:UiComponentProps['actions'];}
export class UiSurface extends Component<UiSurfaceProps,{styled:boolean}> {
  override state={styled:false};private readonly link=createRef<HTMLLinkElement>();
  override componentDidMount():void {if(this.props.hostStyles){const expected=new URL(this.props.cssUrl,document.baseURI).href;for(const sheet of document.styleSheets)if(sheet.href===expected){this.loaded();return;}this.failed();}else if(this.link.current?.sheet)this.loaded();}
  private loaded():void {if(this.state.styled)this.acknowledge();else this.setState({styled:true},this.acknowledge.bind(this));}
  private acknowledge():void {this.props.observer?.loaded();}
  private failed():void {this.props.observer?.failed();}
  render():ReactNode {const Selected=this.props.component;return <main className="trsd-ui" data-ui-styled={String(this.state.styled)}>{!this.props.hostStyles&&<link ref={this.link} rel="stylesheet" href={this.props.cssUrl} onLoad={this.loaded.bind(this)} onError={this.failed.bind(this)}/>}<Selected instanceId={this.props.view.id} model={this.props.view.model} actions={this.state.styled?this.props.actions:undefined}/></main>;}
}
