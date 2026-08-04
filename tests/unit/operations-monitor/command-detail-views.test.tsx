import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CommandDetailViews } from '../../../src/react/command-center/CommandDetailViews.tsx';

describe('command detail views', () => {
	it('opens in readability mode and preserves the complete debug record', async () => {
		const user = userEvent.setup();
		render(<CommandDetailViews timeZone="America/New_York" detail={{
			id: 'proposal-one', kind: 'proposal', title: 'Improve the guide', description: 'A concise summary.', status: 'voting',
			primary: { actor: { label: 'Proposed by', name: 'Adrian Webb' }, postedAt: '2026-08-04T14:00:00.000Z', content: { label: 'Proposal', classification: 'editorial-test', body: 'Publish the reviewed editorial cycle.', missing: false }, facts: [{ label: 'Status', value: 'Voting' }] },
			sections: [{ id: 'identity', title: 'Operational identity', fields: [{ label: 'Provider', value: { id: 'provider-one' } }] }],
			data: { created_by_id: 'user-one', active_version: 3 },
		}} />);

		expect(screen.getByText('Publish the reviewed editorial cycle.')).toBeVisible();
		expect(screen.getByText('editorial test')).toBeVisible();
		expect(screen.queryByText('Operational identity')).not.toBeInTheDocument();
		await user.click(screen.getByRole('tab', { name: /Debug/i }));
		expect(screen.getByRole('heading', { name: 'Data integrity' })).toBeVisible();
		expect(screen.getByText('Operational identity')).toBeVisible();
		expect(screen.getByRole('heading', { name: 'Complete record' })).toBeVisible();
	});

	it('makes missing primary content explicit instead of substituting a summary', () => {
		render(<CommandDetailViews timeZone="America/New_York" detail={{
			id: 'proposal-missing', kind: 'proposal', title: 'Incomplete proposal', description: 'This summary must not masquerade as proposal content.', status: 'draft',
			primary: { actor: { label: 'Proposed by', name: 'Agent Lab simulation operator' }, content: { label: 'Proposal', body: '', classification: 'editorial-test', missing: true } },
			data: { body: null },
		}} />);

		expect(screen.getByText(/No proposal content was returned/)).toBeVisible();
		expect(screen.queryByText('This summary must not masquerade as proposal content.')).not.toBeInTheDocument();
	});
});
