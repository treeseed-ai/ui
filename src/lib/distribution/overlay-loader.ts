import type { OverlayStatusViewModel } from '../foundation/contracts.ts';

export async function loadOverlayEditorOnIntent(status: OverlayStatusViewModel): Promise<{ status: OverlayStatusViewModel; loaded: boolean }> {
	if (status.state !== 'available' && status.state !== 'preview') return { status, loaded: false };
	await import('./overlay-session.ts');
	return { status, loaded: true };
}
