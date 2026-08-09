import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendFormRequest } from '../../../src/forms-client.ts';
import { AppearancePersistenceIsland } from '../../../src/react/progressive/AppearancePersistenceIsland.tsx';

vi.mock('../../../src/forms-client.ts', () => ({ sendFormRequest: vi.fn() }));

describe('AppearancePersistenceIsland', () => {
	beforeEach(() => {
		vi.mocked(sendFormRequest).mockReset().mockResolvedValue(new Response(null, { status: 200 }));
		document.cookie = 'ts_csrf=appearance-token; path=/';
	});

	it('persists only explicit theme changes and removes its listener when unmounted', async () => {
		const view = render(<AppearancePersistenceIsland endpoint="/v1/auth/web/appearance" />);
		window.dispatchEvent(new CustomEvent('treeseed:theme-change', { detail: { scheme: 'fern', mode: 'dark' } }));
		expect(sendFormRequest).not.toHaveBeenCalled();

		window.dispatchEvent(new CustomEvent('treeseed:theme-change', { detail: {
			persist: true,
			scheme: 'fern',
			mode: 'dark',
			workspace: { enabled: true, scheme: 'tidepool', mode: 'light' },
		} }));
		await waitFor(() => expect(sendFormRequest).toHaveBeenCalledOnce());
		expect(sendFormRequest).toHaveBeenCalledWith(expect.objectContaining({
			url: '/v1/auth/web/appearance',
			init: expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({ 'x-treeseed-csrf': 'appearance-token' }),
				body: JSON.stringify({
					colorScheme: 'fern',
					themeMode: 'dark',
					contentThemeOverlayEnabled: true,
					contentThemeOverlayScheme: 'tidepool',
					contentThemeOverlayMode: 'light',
				}),
			}),
		}));

		view.unmount();
		window.dispatchEvent(new CustomEvent('treeseed:theme-change', { detail: { persist: true, scheme: 'fern', mode: 'light' } }));
		expect(sendFormRequest).toHaveBeenCalledOnce();
	});
});
