import type { AgentDesignerShellProps } from './types.ts';

function initials(title: string) {
	return title.split(/\s+/u).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
}

export function AgentDesignerShell(props: AgentDesignerShellProps) {
	return <section className="ts-agent-designer" data-scene="agent-lab.agent-designer">
		<header className="ts-agent-designer__header">
			<span className="ts-agent-designer__mark" aria-hidden="true">{initials(props.title)}</span>
			<div className="ts-agent-designer__identity"><h3>{props.title}</h3><p>@{props.slug} · {props.projectName}</p></div>
			<div className="ts-agent-designer__draft"><strong data-state={props.dirty ? 'draft' : 'saved'}>{props.dirty ? 'Uncommitted draft' : `Base · ${props.revision.slice(0, 12)}`}</strong><span>{props.state === 'saving' ? 'Validating…' : props.runtimeStatus}</span></div>
			<div className="ts-agent-designer__actions"><button type="button" onClick={props.onCommit} disabled={props.state === 'saving' || !props.dirty}>{props.state === 'saving' ? 'Committing…' : 'Validate & commit'}</button></div>
		</header>
		<div className="ts-agent-designer__workspace">
			<nav className="ts-agent-designer__scope" aria-label="Agent definition sections">
				<div>Agent definition</div>
				{props.sections.map((section) => <button key={section.id} type="button" aria-current={props.activeSection === section.id ? 'page' : undefined} onClick={() => props.onSectionChange(section.id)}><i /><span><b>{section.label}</b><small>{section.description}</small></span><output data-state={section.state ?? 'ready'}>{section.state ?? 'ready'}</output></button>)}
			</nav>
			<main className="ts-agent-designer__canvas" tabIndex={-1}>{props.children}</main>
			<aside className="ts-agent-designer__status" aria-label="Repository and simulator status">
				<section><h4>{props.dirty ? 'Uncommitted draft' : 'Repository definition'}</h4><dl><div><dt>Base revision</dt><dd>{props.revision.slice(0, 12)}</dd></div><div><dt>Draft changes</dt><dd>{props.dirty ? 'Pending' : 'None'}</dd></div><div><dt>Runtime status</dt><dd>{props.runtimeStatus}</dd></div></dl><p>A successful commit creates a validated immutable definition revision through TreeDX.</p></section>
				<section className="ts-agent-designer__simulator"><span>Team inventory ready</span><h4>Test this definition</h4><p>Prepare the currently supported production-shaped team simulation, then inspect its workday in Atlas.</p><div><b>{props.title}</b> → Simulation Bay → <b>Agent Atlas</b></div><button type="button" onClick={props.onSimulation}>Set up test</button></section>
			</aside>
		</div>
		{props.message ? <p className="ts-agent-designer__message" role="status" data-state={props.state}>{props.message}</p> : null}
		{props.simulationOverlay}
	</section>;
}
