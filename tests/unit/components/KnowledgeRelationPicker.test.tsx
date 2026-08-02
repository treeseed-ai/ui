import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import KnowledgeRelationPicker from '../../../src/react/editors/KnowledgeRelationPicker';

describe('KnowledgeRelationPicker', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('searches authorized knowledge and submits only selected stable IDs', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
			ok: true,
			payload: { results: [{ id: 'team.invitation', title: 'Team invitations', summary: 'Accept invitations safely.' }] },
		}), { status: 200, headers: { 'content-type': 'application/json' } })));
		const user = userEvent.setup();
		const { container } = render(<KnowledgeRelationPicker name="relatedNoteIds" label="Related notes"
			searchEndpoint="/v1/knowledge/workspaces/workspace-1/relations/search?types=notes" initialIds={['account.identity']} />);

		expect(container.querySelector('[data-knowledge-relation-field="relatedNoteIds"]')).toBeVisible();
		expect(screen.getByLabelText('Selected related notes')).toBeVisible();
		await user.type(screen.getByRole('searchbox'), 'invitation');
		await waitFor(() => expect(screen.getByRole('button', { name: /team invitations/i })).toBeVisible());
		expect(container.querySelector('[data-knowledge-relation-results="relatedNoteIds"]')).toBeVisible();
		await user.click(screen.getByRole('button', { name: /team invitations/i }));
		expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('types=notes&q=invitation');

		expect([...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((input) => input.value))
			.toEqual(['account.identity', 'team.invitation']);
		await user.click(screen.getByRole('button', { name: 'Remove account.identity' }));
		expect([...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((input) => input.value))
			.toEqual(['team.invitation']);
	});
});
