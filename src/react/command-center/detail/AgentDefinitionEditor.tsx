import { useMemo,useState } from 'react';
import { parse } from 'yaml';
import type { CommandEntityDetail } from '../types.ts';

type Row = Record<string,unknown>;
type SaveState = 'idle'|'saving'|'saved'|'error'|'conflict';
function object(value: unknown): Row { return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}; }
function list(value: unknown) { return Array.isArray(value) ? value : []; }
function csv(value: unknown) { return list(value).map(String).filter(Boolean).join(', '); }
function values(value: string) { return value.split(',').map((entry)=>entry.trim()).filter(Boolean); }
function sourceParts(source: string) { const match=source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/u); return match ? { frontmatter:object(parse(match[1] ?? '')),body:source.slice(match[0].length) } : { frontmatter:{},body:source }; }
function contracts(value: unknown) { return list(value).map((entry)=>typeof entry === 'string' ? entry : String(object(entry).contract ?? '')).filter(Boolean); }

const anatomy = [
	{ id:'mind',glyph:'◉',title:'Mind',hint:'Identity, purpose, prompts and planning intent' },
	{ id:'senses',glyph:'⌁',title:'Senses',hint:'Signals and TreeDX context the agent can perceive' },
	{ id:'hands',glyph:'✣',title:'Hands',hint:'Tools, content operations and repository permissions' },
	{ id:'nerves',glyph:'⌘',title:'Nervous system',hint:'Handlers, profiles, triggers and execution flow' },
	{ id:'voice',glyph:'◒',title:'Voice',hint:'Signals, messages, artifacts and model mutations' },
	{ id:'metabolism',glyph:'⧖',title:'Metabolism',hint:'Provider demand, time, tokens, cost and retries' },
	{ id:'immunity',glyph:'◇',title:'Immune system',hint:'Boundaries, verification, approvals and blockers' },
] as const;

function AnatomyFigure({ active,onSelect,status }: { active:string; onSelect:(id:string)=>void; status:string }) {
	return <div className="ts-agent-anatomy__figure" aria-label="Interactive agent anatomy">
		<div className="ts-agent-anatomy__halo" aria-hidden="true" />
		<div className="ts-agent-anatomy__body" aria-hidden="true"><i data-part="head"/><i data-part="core"/><i data-part="left-arm"/><i data-part="right-arm"/><i data-part="root"/></div>
		{anatomy.map((part,index)=><button key={part.id} type="button" data-part={part.id} data-index={index} aria-pressed={active===part.id} onClick={()=>onSelect(part.id)}><b>{part.glyph}</b><span>{part.title}</span></button>)}
		<small data-status={status}>{status}</small>
	</div>;
}

function SystemFacts({ definition,path,status }: { definition:Row; path:string; status:string }) {
	const facts:Array<[string,unknown]>=[['ID',definition.id],['Slug',definition.slug],['Class ID',definition.projectAgentClassId],['Class slug',definition.projectAgentClassSlug],['Runtime status',status],['Repository path',path]];
	return <aside className="ts-agent-anatomy__facts"><header><span>Generated system facts</span><strong>Locked & continuously derived</strong></header><dl>{facts.map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{String(value || 'generated on save')}</dd></div>)}</dl></aside>;
}

function ProfileEditor({ profileId,profile,onChange }: { profileId:string; profile:Row; onChange:(value:Row)=>void }) {
	const execution=object(profile.execution); const prompt=object(profile.prompt); const signals=object(profile.signals); const tools=object(profile.tools); const outputs=object(profile.outputs);
	function set(name:string,value:unknown){onChange({...profile,[name]:value});}
	function setExecution(name:string,value:unknown){set('execution',{...execution,[name]:value});}
	return <div className="ts-agent-anatomy__profile">
		<div className="ts-agent-anatomy__profile-title"><span>{profileId}</span><label><input type="checkbox" checked={profile.enabled!==false} onChange={(event)=>set('enabled',event.target.checked)}/> Enabled</label></div>
		<label><span>Handler</span><input value={String(profile.handler ?? '')} onChange={(event)=>set('handler',event.target.value)}/></label>
		<label><span>Preferred providers</span><input value={csv(execution.providerPreference)} onChange={(event)=>setExecution('providerPreference',values(event.target.value))}/></label>
		<label><span>Runtime limit · seconds</span><input type="number" min="1" value={String(execution.maxRuntimeSeconds ?? '')} onChange={(event)=>setExecution('maxRuntimeSeconds',Number(event.target.value))}/></label>
		<label><span>Retry limit</span><input type="number" min="0" value={String(execution.maxRetries ?? 0)} onChange={(event)=>setExecution('maxRetries',Number(event.target.value))}/></label>
		<label className="wide"><span>System prompt</span><textarea rows={4} value={String(prompt.system ?? '')} onChange={(event)=>set('prompt',{...prompt,system:event.target.value})}/></label>
		<label className="wide"><span>Task prompt</span><textarea rows={3} value={String(prompt.task ?? '')} onChange={(event)=>set('prompt',{...prompt,task:event.target.value})}/></label>
		<label className="wide"><span>Input signals</span><input value={contracts(signals.subscribesTo).join(', ')} onChange={(event)=>set('signals',{...signals,subscribesTo:values(event.target.value).map((contract)=>({contract}))})}/></label>
		<label className="wide"><span>Published signals</span><input value={csv(signals.publishes)} onChange={(event)=>set('signals',{...signals,publishes:values(event.target.value)})}/></label>
		<label className="wide"><span>Allowed tools</span><input value={csv(tools.allowed)} onChange={(event)=>set('tools',{...tools,allowed:values(event.target.value)})}/></label>
		<label className="wide"><span>Denied tools</span><input value={csv(tools.denied)} onChange={(event)=>set('tools',{...tools,denied:values(event.target.value)})}/></label>
		<label><span>Message outputs</span><input value={csv(outputs.messageTypes)} onChange={(event)=>set('outputs',{...outputs,messageTypes:values(event.target.value)})}/></label>
		<label><span>Content mutations</span><input value={csv(outputs.modelMutations)} onChange={(event)=>set('outputs',{...outputs,modelMutations:values(event.target.value)})}/></label>
	</div>;
}

export function AgentDefinitionEditor({ detail,authoring,saveEndpoint }: { detail:CommandEntityDetail; authoring:Row; saveEndpoint:string }) {
	const original=useMemo(()=>sourceParts(String(authoring.source ?? '')),[authoring.source]); const [definition,setDefinition]=useState<Row>(original.frontmatter); const [active,setActive]=useState('mind'); const [state,setState]=useState<SaveState>('idle'); const [message,setMessage]=useState(''); const profiles=object(definition.activityProfiles);
	const status=String(detail.status ?? (definition.enabled===false?'dormant':'idle')).replace(/[_-]/gu,' ');
	function field(name:string,value:unknown){setDefinition((current)=>({...current,[name]:value}));setState('idle');}
	function intent(next=definition){const identity=object(next.identity);return {name:String(next.name ?? next.title ?? ''),description:String(next.description ?? ''),purpose:String(identity.purpose ?? ''),responsibilities:list(identity.responsibilities).map(String),durableInstructions:String(identity.durableInstructions ?? ''),agentClass:String(next.agentClass ?? ''),template:String(next.template ?? ''),enabled:next.enabled!==false,designMaturity:String(next.designMaturity ?? 'draft'),activityProfiles:object(next.activityProfiles)};}
	async function commit(next=definition,summary='Update agent definition',source=String(authoring.source ?? '')){setState('saving');setMessage('Compiling intent, validating contracts and committing through TreeDX…');const response=await fetch(saveEndpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({projectId:authoring.projectId,path:authoring.path,expectedBase:source?authoring.expectedBase:undefined,source,intent:intent(next),contentBody:original.body,changeSummary:summary})});const result=await response.json();if(response.ok){setState('saved');setMessage(`Committed ${String(result.payload?.commit ?? '').slice(0,12)}. Generated identity and live class roster are synchronized.`);}else{setState(response.status===409?'conflict':'error');setMessage(result.error ?? 'The agent could not be committed.');}}
	async function clone(){const name=`${String(definition.name ?? detail.title)} copy`;await commit({...definition,name,title:name},`Clone agent ${name}`,'');}
	async function deactivate(){if(!confirm(`Deactivate ${detail.title}? Future workdays will exclude it after this commit.`))return;const next={...definition,enabled:false};setDefinition(next);await commit(next,`Deactivate agent ${detail.title}`);}
	return <section className="ts-agent-anatomy">
		<header className="ts-agent-anatomy__lead"><div><span>Agent specimen · designed / assigned / observed</span><h3>{detail.title}</h3><p>{String(definition.description ?? detail.description)}</p></div><div><small>Operational state</small><strong data-status={status}>{status}</strong></div></header>
		<div className="ts-agent-anatomy__layers"><span data-active>Designed <b>editable intent</b></span><span>Assigned <b>lease-time snapshot</b></span><span>Observed <b>forensic activity</b></span></div>
		<div className="ts-agent-anatomy__stage"><nav aria-label="Agent anatomy index">{anatomy.map((part)=><button key={part.id} type="button" aria-pressed={active===part.id} onClick={()=>setActive(part.id)}><b>{part.glyph}</b><span>{part.title}<small>{part.hint}</small></span></button>)}</nav><AnatomyFigure active={active} onSelect={setActive} status={status}/><SystemFacts definition={definition} path={String(authoring.path ?? '')} status={status}/></div>
		<section className="ts-agent-anatomy__workbench"><header><span>{anatomy.find((part)=>part.id===active)?.title}</span><strong>{anatomy.find((part)=>part.id===active)?.hint}</strong></header>
			{active==='mind'?<div className="ts-agent-anatomy__fields"><label><span>Display name</span><input value={String(definition.name ?? definition.title ?? '')} onChange={(event)=>field('name',event.target.value)}/></label><label><span>Agent class</span><input value={String(definition.agentClass ?? '')} onChange={(event)=>field('agentClass',event.target.value)}/></label><label className="wide"><span>Description</span><textarea rows={2} value={String(definition.description ?? '')} onChange={(event)=>field('description',event.target.value)}/></label><label className="wide"><span>Purpose</span><textarea rows={2} value={String(object(definition.identity).purpose ?? '')} onChange={(event)=>field('identity',{...object(definition.identity),purpose:event.target.value})}/></label><label className="wide"><span>Responsibilities · one per line</span><textarea rows={4} value={list(object(definition.identity).responsibilities).join('\n')} onChange={(event)=>field('identity',{...object(definition.identity),responsibilities:event.target.value.split('\n').filter(Boolean)})}/></label><label className="wide"><span>Durable instructions</span><textarea rows={5} value={String(object(definition.identity).durableInstructions ?? '')} onChange={(event)=>field('identity',{...object(definition.identity),durableInstructions:event.target.value})}/></label></div>:<div className="ts-agent-anatomy__profiles">{Object.entries(profiles).map(([profileId,raw])=><ProfileEditor key={profileId} profileId={profileId} profile={object(raw)} onChange={(value)=>field('activityProfiles',{...profiles,[profileId]:value})}/>)}</div>}
		</section>
		<footer><div className="ts-agent-editor__lifecycle"><button type="button" disabled={state==='saving'} onClick={()=>void commit()}>{state==='saving'?'Compiling…':'Compile & commit design'}</button><button type="button" disabled={state==='saving'} onClick={()=>void clone()}>Clone from design</button>{definition.enabled!==false?<button type="button" data-tone="danger" disabled={state==='saving'} onClick={()=>void deactivate()}>Deactivate</button>:null}</div>{message?<span role="status" data-state={state}>{message}</span>:null}</footer>
	</section>;
}
