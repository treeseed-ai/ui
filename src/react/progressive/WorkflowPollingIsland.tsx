import { useEffect } from 'react';
import { refreshContentTargets } from '../../forms-client.ts';

export interface WorkflowPollingIslandProps { operationId: string; rootId: string; }

export function WorkflowPollingIsland({ operationId, rootId }: WorkflowPollingIslandProps) {
	useEffect(() => {
		let timer = 0;
		let controller: AbortController | undefined;
		const poll = async () => {
			if (document.hidden || !navigator.onLine) { schedule(); return; }
			const root = document.getElementById(rootId);
			const runs = [...(root?.querySelectorAll<HTMLElement>('[data-workflow-run-active="true"]') ?? [])];
			for (const run of runs) {
				const runId = run.dataset.workflowRunId;
				if (!runId) continue;
				controller = new AbortController();
				try {
					const response = await fetch(`/v1/workflow-operation-runs/${encodeURIComponent(runId)}`, {
						credentials: 'same-origin', headers: { accept: 'application/json' }, signal: controller.signal,
					});
					const payload = response.ok ? (await response.json()).payload : null;
					if (payload && payload.status !== run.dataset.workflowRunStatus) {
						await refreshContentTargets([`[data-workflow-operation-id="${CSS.escape(operationId)}"]`]);
						return;
					}
				} catch { /* Server-rendered status remains authoritative while offline. */ }
			}
			schedule();
		};
		const schedule = () => { window.clearTimeout(timer); timer = window.setTimeout(() => void poll(), 5_000); };
		const resume = () => { if (!document.hidden && navigator.onLine) schedule(); };
		document.addEventListener('visibilitychange', resume);
		window.addEventListener('online', resume);
		schedule();
		return () => {
			window.clearTimeout(timer); controller?.abort();
			document.removeEventListener('visibilitychange', resume);
			window.removeEventListener('online', resume);
		};
	}, [operationId, rootId]);
	return null;
}
