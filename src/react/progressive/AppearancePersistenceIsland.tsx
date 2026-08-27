import { useEffect } from 'react';
import { sendFormRequest } from '../../forms-client.ts';

interface ThemeChangeDetail {
	persist?: boolean;
	scheme?: string;
	mode?: string;
	workspace?: {
		enabled?: boolean;
		scheme?: string;
		mode?: string;
	};
}

export interface AppearancePersistenceIslandProps {
	endpoint: string;
	expectedUpdatedAt?: string;
	reloadOnSuccessPath?: string;
}

function normalizedPath(path: string) {
	return path.replace(/\/+$/u, '') || '/';
}

export function AppearancePersistenceIsland({ endpoint, expectedUpdatedAt, reloadOnSuccessPath }: AppearancePersistenceIslandProps) {
	useEffect(() => {
		let controller: AbortController | undefined;
		const persistAppearance = (event: Event) => {
			const detail = (event as CustomEvent<ThemeChangeDetail>).detail ?? {};
			if (detail.persist !== true || !detail.scheme || !detail.mode) return;
			controller?.abort();
			controller = new AbortController();
			void sendFormRequest({
				url: endpoint,
				init: {
					method: 'PATCH',
					headers: {
						accept: 'application/json',
						'content-type': 'application/json',
						'x-treeseed-csrf': document.cookie.split('; ').find((entry) => entry.startsWith('ts_csrf='))?.split('=').slice(1).join('=') || '',
					},
					body: JSON.stringify({
						colorScheme: detail.scheme,
						themeMode: detail.mode,
						expectedUpdatedAt,
						contentThemeOverlayEnabled: detail.workspace?.enabled === true,
						contentThemeOverlayScheme: detail.workspace?.scheme,
						contentThemeOverlayMode: detail.workspace?.mode,
					}),
					keepalive: true,
					signal: controller.signal,
				},
			}).then((response) => {
				if (response.ok && reloadOnSuccessPath && normalizedPath(window.location.pathname) === normalizedPath(reloadOnSuccessPath)) {
					window.location.reload();
				}
			}).catch(() => {
				// Cookies retain the immediate preference; a later explicit change can retry persistence.
			});
		};
		window.addEventListener('treeseed:theme-change', persistAppearance);
		return () => {
			controller?.abort();
			window.removeEventListener('treeseed:theme-change', persistAppearance);
		};
	}, [endpoint, expectedUpdatedAt, reloadOnSuccessPath]);
	return null;
}
