import { useState } from 'react';
import { requestJson } from '../../../forms-client.ts';
import type { CommandEntityDetail } from '../types.ts';

type Action = 'open'|'start-voting'|'support'|'object'|'approve'|'reject'|'request_changes'|'withdraw'|'supersede';
const labels: Record<Action,string> = { open:'Open review','start-voting':'Start voting',support:'Support',object:'Object',approve:'Accept proposal',reject:'Reject proposal',request_changes:'Request changes',withdraw:'Withdraw',supersede:'Supersede' };

function endpoint(detail: CommandEntityDetail,action: Action) {
	const base = `/v1/projects/${encodeURIComponent(detail.projectId ?? '')}/proposals/${encodeURIComponent(detail.id)}`;
	if (['support','object'].includes(action)) return `${base}/vote`;
	if (['approve','reject','request_changes'].includes(action)) return `${base}/admin-decision`;
	return `${base}/${action}`;
}

function payload(detail: CommandEntityDetail,action: Action,reason: string,successorProposalId: string) {
	const common = { reason,expectedProposalVersion:detail.version };
	if (action === 'support' || action === 'object') return { ...common,vote:action };
	if (action === 'approve') return { ...common,status:'approved' };
	if (action === 'reject') return { ...common,status:'rejected' };
	if (action === 'request_changes') return { ...common,status:'request_changes' };
	if (action === 'supersede') return { ...common,successorProposalId };
	return common;
}

export function ProposalGovernanceActions({ detail,onSaved }: { detail:CommandEntityDetail; onSaved:()=>void }) {
	const [selected,setSelected] = useState<Action|null>(null); const [reason,setReason] = useState(''); const [successor,setSuccessor] = useState(''); const [state,setState] = useState<'idle'|'saving'|'error'>('idle'); const [message,setMessage] = useState('');
	const actions: Action[] = [
		...(detail.permissions?.open ? ['open'] as const : []),...(detail.permissions?.startVoting ? ['start-voting'] as const : []),
		...(detail.permissions?.vote ? ['support','object'] as const : []),...(detail.permissions?.decide ? ['approve','reject','request_changes'] as const : []),
		...(detail.permissions?.withdraw ? ['withdraw'] as const : []),...(detail.permissions?.supersede ? ['supersede'] as const : []),
	];
	async function submit() { if (!selected || !detail.projectId || !reason.trim()) { setState('error');setMessage('Explain the reason for this governance action.');return; } setState('saving');setMessage('Recording the governance consequence…'); const response=await requestJson(endpoint(detail,selected),{method:'POST',headers:{'content-type':'application/json','Idempotency-Key':globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`},body:JSON.stringify(payload(detail,selected,reason,successor))}); const result=await response.json(); if(!response.ok){setState('error');setMessage(result.error ?? 'The governance action could not be recorded.');return;} setSelected(null);setReason('');setSuccessor('');setState('idle');setMessage(`${labels[selected]} recorded. The proposal and affected work have been refreshed.`);onSaved(); }
	if (!actions.length) return null;
	return <section className="ts-proposal-governance" aria-label="Proposal governance actions"><header><span>Human governance</span><strong>Choose a consequential action after reviewing the plan.</strong></header><div className="ts-proposal-governance__actions">{actions.map((action)=><button key={action} type="button" data-action={action} aria-pressed={selected===action} onClick={()=>{setSelected(action);setMessage('');}}>{labels[action]}</button>)}</div>{selected?<div className="ts-proposal-governance__confirmation"><label><span>Decision rationale</span><textarea rows={3} value={reason} onChange={(event)=>setReason(event.target.value)} placeholder={`Why should the team ${labels[selected].toLowerCase()}?`} /></label>{selected==='supersede'?<label><span>Successor proposal</span><input value={successor} onChange={(event)=>setSuccessor(event.target.value)} placeholder="Optional successor proposal reference" /></label>:null}<div><button type="button" onClick={()=>setSelected(null)}>Cancel</button><button type="button" data-tone={['reject','withdraw'].includes(selected)?'danger':'positive'} disabled={state==='saving'} onClick={()=>void submit()}>{state==='saving'?'Recording…':`Confirm ${labels[selected]}`}</button></div></div>:null}{message?<p role="status" data-state={state}>{message}</p>:null}</section>;
}
