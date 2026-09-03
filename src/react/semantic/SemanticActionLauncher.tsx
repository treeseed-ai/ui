import type { MouseEvent } from 'react';
import { coreUiRegistry } from '../../lib/foundation/contracts.ts';

export interface SemanticActionLink {
	id: string;
	href: string;
	allowed?: boolean;
	reason?: string;
}

export interface SemanticActionLauncherProps {
	label: string;
	actions: SemanticActionLink[];
	className?: string;
}

/** Shell-free action launcher shared by embedded applications and route surfaces. */
export function SemanticActionLauncher({ label, actions, className = '' }: SemanticActionLauncherProps) {
	if (!actions.length) return null;
	return <details className={`ts-semantic-action-launcher ${className}`.trim()}>
		<summary>{label}</summary>
		<div role="menu" aria-label={label}>
			{actions.map((action) => {
				const definition = coreUiRegistry.action(action.id), allowed = action.allowed !== false;
				const block = (event: MouseEvent<HTMLAnchorElement>) => { if (!allowed) event.preventDefault(); };
				return <a key={action.id} role="menuitem" href={action.href} data-intent={definition.intent ?? 'default'} aria-disabled={!allowed || undefined} aria-description={!allowed ? action.reason : undefined} onClick={block}>
					<strong>{definition.label}</strong>
					{definition.description || (!allowed && action.reason) ? <small>{!allowed ? action.reason : definition.description}</small> : null}
				</a>;
			})}
		</div>
	</details>;
}

export default SemanticActionLauncher;
