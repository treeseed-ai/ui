import type { ReactNode } from 'react';

export type AgentDesignerSection = {
	id: string;
	label: string;
	description: string;
	state?: 'ready' | 'draft' | 'invalid';
};

export type AgentDesignerShellProps = {
	title: string;
	slug: string;
	projectName: string;
	revision: string;
	runtimeStatus: string;
	state: 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
	dirty: boolean;
	message: string;
	sections: AgentDesignerSection[];
	activeSection: string;
	onSectionChange(id: string): void;
	onCommit(): void;
	onSimulation(): void;
	children: ReactNode;
	simulationOverlay?: ReactNode;
};
