import { useMemo,useState } from 'react';
import { requestJson } from '../../../forms-client.ts';
import RichMarkdownEditor from '../../editors/RichMarkdownEditor.tsx';
import type { CommandEntityDetail } from '../types.ts';

type Plan = Record<string,string | string[]>;
const LIST_FIELDS = ['scope','nonGoals','deliverables','acceptanceCriteria','dependencies','risks','alternatives','verification','openQuestions'] as const;
function record(value: unknown): Record<string,unknown> { if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string,unknown>; if (typeof value === 'string') try { return record(JSON.parse(value)); } catch { return {}; } return {}; }
function text(...values: unknown[]) { return String(values.find((value) => typeof value === 'string' && value) ?? ''); }
function list(value: unknown) { if (Array.isArray(value)) return value.map(String); if (typeof value === 'string') try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : value.split('\n'); } catch { return value.split(/[\n,]/u); } return []; }
function initialPlan(metadata: Record<string,unknown>): Plan { const source = record(metadata.plan); return { desiredOutcome: text(source.desiredOutcome), currentProblem: text(source.currentProblem), proposedApproach: text(source.proposedApproach), ...Object.fromEntries(LIST_FIELDS.map((field) => [field,list(source[field])])) }; }
function lines(value: string) { return value.split('\n').map((entry) => entry.trim()).filter(Boolean); }

function PlanFields({ plan,onChange }: { plan: Plan; onChange: (plan: Plan) => void }) {
	const narrative = [['desiredOutcome','Desired outcome'],['currentProblem','Current problem'],['proposedApproach','Proposed approach']] as const;
	const labels: Record<typeof LIST_FIELDS[number],string> = { scope: 'Scope', nonGoals: 'Non-goals', deliverables: 'Deliverables', acceptanceCriteria: 'Acceptance criteria', dependencies: 'Dependencies', risks: 'Risks', alternatives: 'Alternatives', verification: 'Verification', openQuestions: 'Open questions' };
	return <section className="ts-proposal-editor__plan" aria-labelledby="proposal-plan-fields"><header><span>Decision structure</span><h4 id="proposal-plan-fields">What a reviewer needs to decide</h4><p>Use one line per item in the bounded lists. These fields drive readiness and agent participation.</p></header><div className="ts-proposal-editor__narrative">{narrative.map(([field,label]) => <label key={field}><span>{label}</span><textarea rows={4} value={String(plan[field] ?? '')} onChange={(event) => onChange({ ...plan,[field]: event.target.value })} /></label>)}</div><div className="ts-proposal-editor__commitments">{LIST_FIELDS.map((field) => <label key={field}><span>{labels[field]}</span><textarea rows={3} value={list(plan[field]).join('\n')} onChange={(event) => onChange({ ...plan,[field]: lines(event.target.value) })} /></label>)}</div></section>;
}

export function ProposalReviewEditor({ detail }: { detail: CommandEntityDetail }) {
	const source = record(detail.data); const metadata = record(source.metadata_json ?? source.metadata);
	const initialTypes = useMemo(() => list(source.proposal_types_json ?? metadata.proposalTypes).join(', '), [source.proposal_types_json,metadata.proposalTypes]);
	const [title,setTitle] = useState(detail.title); const [summary,setSummary] = useState(text(source.summary,detail.description)); const [body,setBody] = useState(text(source.body,detail.primary?.content?.body)); const [types,setTypes] = useState(initialTypes); const [plan,setPlan] = useState<Plan>(() => initialPlan(metadata)); const [reason,setReason] = useState(''); const [state,setState] = useState<'idle' | 'saving' | 'saved' | 'conflict' | 'error'>('idle'); const [message,setMessage] = useState('');
	async function save() {
		if (!detail.projectId || !reason.trim()) { setState('error'); setMessage('Describe what changed before publishing a proposal version.'); return; }
		setState('saving'); setMessage('Committing proposal content through TreeDX…');
		const response = await requestJson(`/v1/projects/${encodeURIComponent(detail.projectId)}/proposals/${encodeURIComponent(detail.id)}`, { method: 'PATCH',headers: { 'content-type': 'application/json' },body: JSON.stringify({ title,summary,body,plan,proposalTypes: types.split(',').map((value) => value.trim()).filter(Boolean),changeReason: reason,expectedProposalVersion: detail.version ?? Number(source.active_version ?? 0) }) });
		const result = await response.json().catch(() => ({}));
		if (response.ok) { setState('saved'); setMessage(`Version ${result.payload?.activeVersion ?? 'published'} committed at ${String(result.authoringReceipt?.commitSha ?? '').slice(0,12)}.`); setReason(''); }
		else { setState(response.status === 409 ? 'conflict' : 'error'); setMessage(result.error ?? 'The proposal version could not be published.'); }
	}
	return <section className="ts-proposal-editor" aria-label="Edit proposal"><header><span>Versioned proposal</span><h3>Refine the plan</h3><p>One save creates one immutable TreeDX commit and one governance version.</p></header><div className="ts-proposal-editor__fields"><label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>Summary</span><textarea rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} /></label><label><span>Proposal types</span><input value={types} onChange={(event) => setTypes(event.target.value)} placeholder="technical-accuracy, evidence-research" /></label></div><PlanFields plan={plan} onChange={setPlan} /><RichMarkdownEditor label="Proposal narrative" name={`proposal-${detail.id}`} initialMarkdown={body} required onChange={setBody} /><footer><label><span>Change summary</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain the purpose of this version" /></label><button type="button" onClick={() => void save()} disabled={state === 'saving'}>{state === 'saving' ? 'Publishing…' : 'Publish version'}</button></footer>{message ? <p className="ts-proposal-editor__status" data-state={state} role="status">{message}</p> : null}</section>;
}
