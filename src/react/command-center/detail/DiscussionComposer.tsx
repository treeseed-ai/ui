import { useState } from 'react';
import { requestJson } from '../../../forms-client.ts';
import RichMarkdownEditor from '../../editors/RichMarkdownEditor.tsx';
import type { CommandEntity, CommandEntityDetail } from '../types.ts';

export function DiscussionComposer({ detail,initialKind,onClose,onSaved,parent }: { detail: CommandEntityDetail; initialKind: 'support' | 'concern' | 'question' | 'response'; onClose: () => void; onSaved: () => void; parent?: CommandEntity | null }) {
	const [kind,setKind] = useState(parent ? 'response' : initialKind); const [message,setMessage] = useState(''); const [resolve,setResolve] = useState(false); const [state,setState] = useState<'idle'|'saving'|'error'>('idle'); const [status,setStatus] = useState('');
	async function save() {
		if (!detail.projectId || !message.trim()) { setState('error'); setStatus('Write a meaningful note or question first.'); return; }
		setState('saving'); setStatus('Committing linked content through TreeDX…');
		const response = await requestJson(`/v1/projects/${encodeURIComponent(detail.projectId)}/proposals/${encodeURIComponent(detail.id)}/discussion`, { method:'POST',headers:{ 'content-type':'application/json','Idempotency-Key':globalThis.crypto?.randomUUID?.() ?? `${Date.now()}` },body:JSON.stringify({ kind,message,expectedProposalVersion:detail.version,...(parent && resolve ? { resolvesEventId: parent.id } : {}) }) });
		const result = await response.json();
		if (!response.ok) { setState('error'); setStatus(result.error ?? 'The discussion entry could not be published.'); return; }
		onSaved(); onClose();
	}
	return <section className="ts-discussion-composer" role="dialog" aria-modal="true" aria-label="Add proposal discussion"><header><div><span>Linked governance content</span><h3>{parent ? 'Reply in context' : `Add context to ${detail.title}`}</h3><p>The published entry becomes TreeDX-backed evidence on this proposal.</p></div><button type="button" onClick={onClose} aria-label="Close composer">×</button></header><div className="ts-discussion-composer__body">{parent ? <article className="ts-discussion-composer__parent"><span>{parent.kind}</span><strong>{parent.title}</strong><p>{parent.description}</p></article> : <label><span>Entry type</span><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="support">Note · support</option><option value="concern">Note · concern</option><option value="question">Question</option></select></label>}<RichMarkdownEditor label={parent ? 'Response' : kind === 'question' ? 'Question' : 'Note'} name={`proposal-discussion-${detail.id}`} initialMarkdown="" required onChange={setMessage} />{parent && ['question','open'].includes(String(parent.status)) ? <label className="ts-discussion-composer__resolve"><input type="checkbox" checked={resolve} onChange={(event) => setResolve(event.target.checked)} /> Resolve this blocking thread with the response</label> : null}</div><footer><button type="button" onClick={onClose}>Cancel</button><button type="button" data-tone="positive" disabled={state === 'saving'} onClick={() => void save()}>{state === 'saving' ? 'Publishing…' : parent ? 'Publish response' : kind === 'question' ? 'Publish question' : 'Publish note'}</button>{status ? <span role="status" data-state={state}>{status}</span> : null}</footer></section>;
}
