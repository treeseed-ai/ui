export type Tone = 'default' | 'muted' | 'accent' | 'info' | 'success' | 'warning' | 'danger';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md';

export type ButtonAction = {
	label: string;
	href?: string;
	type?: 'button' | 'submit' | 'reset';
	variant?: ButtonVariant;
	ariaLabel?: string;
	disabled?: boolean;
	reload?: boolean;
};

export type ShellBrand = {
	name: string;
	tag?: string;
	href: string;
	logoSrc?: string;
	logoAlt?: string;
	mark?: string;
};

export type ShellNavItem = {
	label: string;
	href: string;
	ariaLabel?: string;
};

export type TeamOperationItem = ShellNavItem & {
	description?: string;
	tone?: Tone;
};

export type SiteUserControlItem = ShellNavItem & {
	kind?: 'link' | 'account' | 'settings';
};

export type SurfaceTabItem = {
	id: string;
	label: string;
	href?: string;
	panelId?: string;
	disabled?: boolean;
	count?: string | number;
};

export type PublicSectionAction = {
	label: string;
	href: string;
	variant?: ButtonVariant;
	ariaLabel?: string;
};
