export type ApplicationKind = 'workspace' | 'utility' | 'dynamic';
export type ApplicationLauncher = 'team-links' | 'site-links' | 'identity' | 'command-palette';
export type ApplicationPlacement = 'content' | 'dock-end' | 'dock-bottom' | 'full-screen';

export interface ResponsiveApplicationPlacement {
	narrow: ApplicationPlacement;
	medium: ApplicationPlacement;
	wide: ApplicationPlacement;
}

export interface DynamicApplicationCapabilities {
	topology?: boolean;
	timeline?: boolean;
	playback?: boolean;
	simulation?: boolean;
	viewport?: boolean;
	selection?: boolean;
	alerts?: boolean;
}

/** A serializable application registration shared by web and terminal renderers. */
export interface ApplicationDefinition {
	id: string;
	label: string;
	description?: string;
	kind: ApplicationKind;
	viewId?: string;
	route?: string;
	icon?: string;
	launchers: ApplicationLauncher[];
	placements: ResponsiveApplicationPlacement;
	preserveState?: boolean;
	dynamic?: DynamicApplicationCapabilities;
}

export interface ShellContextControlDefinition {
	id: string;
	label: string;
	placement: 'prominent';
	action: 'select-team' | 'manage-current-team';
}

export interface ShellSectionDefinition {
	id: 'team-links' | 'identity';
	label: string;
	applicationIds?: string[];
	links?: Array<{ id: string; label: string; route: string; icon?: string }>;
}

export interface ShellDefinition {
	contextControls: ShellContextControlDefinition[];
	sections: ShellSectionDefinition[];
	utilityLauncher: 'site-links';
}
