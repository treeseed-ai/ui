import { useEffect, useMemo, useRef, useState } from 'react';
import { parse } from 'yaml';
import { requestJson } from '../../../forms-client.ts';
import { AgentDesignerShell, AgentIdentityPanel, AgentProfilePanel, AgentSimulationSetup, type AgentDesignerSection } from '../../agent-designer/index.ts';
import { WorkspaceFocusSurface } from '../../workspace-surfaces/WorkspaceFocusSurface.tsx';
import { WorkspaceOverlay } from '../../workspace-surfaces/WorkspaceOverlay.tsx';
import { closeTopWorkspaceOverlay, currentWorkspaceReturnPath, setWorkspaceFocus, type WorkspaceExitRequest } from '../../workspace-surfaces/workspace-navigation.ts';
import { useWorkspaceSurfaceMode } from '../../workspace-surfaces/use-workspace-surface-mode.ts';
import type { CommandEntityDetail } from '../types.ts';
import { clearDesignerSession, designerSessionKey, readDesignerSession, writeDesignerSession } from './designer-session.ts';

type Row = Record<string,unknown>;
type SaveState = 'idle'|'saving'|'saved'|'error'|'conflict';
function object(value: unknown): Row { return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}; }
function list(value: unknown) { return Array.isArray(value) ? value : []; }
function sourceParts(source: string) { const match=source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/u); return match ? { frontmatter:object(parse(match[1] ?? '')),body:source.slice(match[0].length) } : { frontmatter:{},body:source }; }

export function AgentDefinitionEditor({ detail,authoring,saveEndpoint,onCommitted }: { detail:CommandEntityDetail; authoring:Row; saveEndpoint:string; onCommitted?:()=>void }) {
	const original=useMemo(()=>sourceParts(String(authoring.source ?? '')),[authoring.source]);
	const sessionKey=useMemo(()=>designerSessionKey(authoring.projectId,authoring.path),[authoring.path,authoring.projectId]);
	const restored=useMemo(()=>readDesignerSession(sessionKey,authoring.expectedBase),[authoring.expectedBase,sessionKey]);
	const [definition,setDefinition]=useState<Row>(()=>restored?.definition ?? original.frontmatter);
	const [contentBody,setContentBody]=useState(()=>restored?.contentBody ?? original.body);
	const [active,setActive]=useState(()=>restored?.active ?? 'identity');
	const [baseRevision,setBaseRevision]=useState(()=>String(authoring.expectedBase ?? ''));
	const [baseline,setBaseline]=useState(()=>JSON.stringify({definition:original.frontmatter,contentBody:original.body}));
	const [state,setState]=useState<SaveState>('idle');
	const [message,setMessage]=useState(restored?'Restored the uncommitted design from this browser session.':'');
	const [simulationOpen,setSimulationOpen]=useState(false);
	const [exitPending,setExitPending]=useState(false);
	const [surfaceMode,changeSurfaceMode]=useWorkspaceSurfaceMode({surfaceId:'designer'});
	const profiles=object(definition.activityProfiles);
	const fingerprint=JSON.stringify({definition,contentBody});
	const dirty=fingerprint!==baseline;
	const dirtyRef=useRef(dirty); dirtyRef.current=dirty;
	useEffect(()=>{if(dirty)writeDesignerSession(sessionKey,baseRevision,definition,active,contentBody);else clearDesignerSession(sessionKey);},[active,baseRevision,contentBody,definition,dirty,sessionKey]);
	useEffect(()=>{
		const detailId=detail.id;
		const requestExit=(event:Event)=>{const request=(event as CustomEvent<WorkspaceExitRequest>).detail;if(request?.id!==detailId||!dirtyRef.current)return;event.preventDefault();setExitPending(true);};
		const beforeUnload=(event:BeforeUnloadEvent)=>{if(!dirtyRef.current)return;event.preventDefault();(event as unknown as {returnValue:string}).returnValue='';};
		window.addEventListener('treeseed:workspace-exit-request',requestExit);
		window.addEventListener('beforeunload',beforeUnload);
		return()=>{window.removeEventListener('treeseed:workspace-exit-request',requestExit);window.removeEventListener('beforeunload',beforeUnload);};
	},[detail.id]);
	const sections=useMemo<AgentDesignerSection[]>(()=>[
		{ id:'identity',label:'Identity & purpose',description:'Agent content',state:dirty?'draft':'ready' },
		{ id:'context',label:'Common context',description:'Shared instructions + groups',state:dirty?'draft':'ready' },
		...Object.entries(profiles).map(([id,value])=>({id:`profile:${id}`,label:id,description:String(object(value).handler ?? 'activity profile'),state:dirty?'draft' as const:'ready' as const})),
	],[dirty,profiles]);
	function intent(next=definition){const identity=object(next.identity);return {name:String(next.name ?? next.title ?? ''),description:String(next.description ?? ''),purpose:String(identity.purpose ?? ''),responsibilities:list(identity.responsibilities).map(String),durableInstructions:String(identity.durableInstructions ?? ''),agentClass:String(next.agentClass ?? ''),template:String(next.template ?? ''),enabled:next.enabled!==false,designMaturity:String(next.designMaturity ?? 'draft'),groupIds:list(next.groupIds).map(String),primaryGroupId:String(next.primaryGroupId ?? ''),activityProfiles:object(next.activityProfiles)};}
	async function commit(){
		setState('saving'); setMessage('Compiling intent, validating the Zod-backed definition, and committing through TreeDX…');
		try {
			const response=await requestJson(saveEndpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({projectId:authoring.projectId,path:authoring.path,expectedBase:baseRevision,source:String(authoring.source ?? ''),intent:intent(),contentBody,changeSummary:`Update agent ${String(definition.name ?? detail.title)}`})});
			const result=await response.json();
			if(!response.ok){const diagnostics=Array.isArray(result.diagnostics)?result.diagnostics.map((item:Row)=>`${String(item.path ?? 'definition')}: ${String(item.message ?? 'invalid')}`).join(' · '):'';throw Object.assign(new Error([result.error,diagnostics].filter(Boolean).join(' ')),{conflict:response.status===409});}
			const commitRevision=String(result.payload?.commit ?? baseRevision);clearDesignerSession(sessionKey);setBaseRevision(commitRevision);setBaseline(fingerprint);setState('saved');setMessage(`Committed ${commitRevision.slice(0,12)}. TreeDX indexing and live class reconciliation completed.`);onCommitted?.();
		} catch(error) { setState(object(error).conflict===true?'conflict':'error');setMessage(error instanceof Error?error.message:'The agent could not be committed.'); }
	}
	function openSimulationBay(){
		setSimulationOpen(false); writeDesignerSession(sessionKey,baseRevision,definition,active,contentBody);
		const returnTo=currentWorkspaceReturnPath({focus:'designer',view:'edit',return:null,returnTo:null});
		setWorkspaceFocus('simulation','push',{return:'designer',returnTo,project:String(authoring.projectId ?? '')});
	}
	function discardAndExit(){dirtyRef.current=false;clearDesignerSession(sessionKey);setBaseline(fingerprint);setExitPending(false);queueMicrotask(closeTopWorkspaceOverlay);}
	const activeProfile=active.startsWith('profile:')?active.slice('profile:'.length):'';
	const title=String(definition.name ?? definition.title ?? detail.title);
	return <WorkspaceFocusSurface id={`agent-designer:${detail.id}`} label="Agent Designer" mode={surfaceMode} boundary="workspace-content" onModeChange={changeSurfaceMode} headerContext={<span><strong>Agent Designer</strong> · {title} · {baseRevision.slice(0,12) || 'working revision'}</span>}>
		<AgentDesignerShell title={title} slug={String(definition.slug ?? detail.id)} projectName={String(authoring.projectName ?? detail.projectName ?? 'Project')} revision={baseRevision} runtimeStatus={String(detail.status ?? 'idle').replace(/[_-]/gu,' ')} state={state} dirty={dirty} message={message} sections={sections} activeSection={active} onSectionChange={setActive} onCommit={()=>void commit()} onSimulation={()=>setSimulationOpen(true)} simulationOverlay={simulationOpen?<AgentSimulationSetup agentName={title} revision={baseRevision} onClose={()=>setSimulationOpen(false)} onContinue={openSimulationBay}/>:null}>
			{active==='identity'?<AgentIdentityPanel definition={definition} contentBody={contentBody} context={false} onDefinitionChange={(value)=>{setDefinition(value);setState('idle');}} onContentBodyChange={(value)=>{setContentBody(value);setState('idle');}}/>:active==='context'?<AgentIdentityPanel definition={definition} contentBody={contentBody} context onDefinitionChange={(value)=>{setDefinition(value);setState('idle');}} onContentBodyChange={setContentBody}/>:activeProfile?<AgentProfilePanel profileId={activeProfile} profile={object(profiles[activeProfile])} onChange={(profile)=>{setDefinition((current)=>({...current,activityProfiles:{...object(current.activityProfiles),[activeProfile]:profile}}));setState('idle');}}/>:null}
		</AgentDesignerShell>
		{exitPending?<WorkspaceOverlay reference={{kind:'confirmation',id:`discard:${detail.id}`}} label="Discard uncommitted agent design?" onClose={()=>setExitPending(false)} className="ts-agent-designer__exit-confirmation" header={<header><span aria-hidden="true">!</span><div><small>Uncommitted definition</small><h3>Leave Agent Designer?</h3></div></header>}><div><p>Your edits are retained only in this browser session. Leaving now will discard this draft.</p><dl><div><dt>Agent</dt><dd>{title}</dd></div><div><dt>Base revision</dt><dd>{baseRevision.slice(0,12)}</dd></div></dl></div><footer><button type="button" onClick={()=>setExitPending(false)}>Keep editing</button><button type="button" data-tone="danger" onClick={discardAndExit}>Discard draft</button></footer></WorkspaceOverlay>:null}
	</WorkspaceFocusSurface>;
}
