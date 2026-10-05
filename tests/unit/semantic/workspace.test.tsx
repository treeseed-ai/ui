import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SemanticWorkspace } from '../../../src/react/semantic/SemanticWorkspace.tsx';

describe('semantic web workspace', () => {
	it('renders a registered root using the existing semantic surface vocabulary', () => {
		render(<SemanticWorkspace viewId="discover" regions={{ search: { content: 'Search all team knowledge' }, results: { items: [{ id: 'result-a', title: 'Capacity guide', status: 'published' }] } }} />);
		expect(screen.getByRole('heading', { name: 'Explore', level: 1 })).toBeInTheDocument();
		expect(screen.getByText('Capacity guide')).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: 'Core workspaces' })).toBeInTheDocument();
	});

	it('opens the shared command registry with the keyboard', () => {
		render(<SemanticWorkspace viewId="team" />);
		fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
		expect(screen.getByRole('dialog', { name: 'Command search' })).toBeInTheDocument();
		fireEvent.change(screen.getByRole('searchbox', { name: 'Search commands' }), { target: { value: 'agent build' } });
		expect(screen.getByRole('button', { name: 'Open Agent Builder' })).toBeInTheDocument();
	});

	it('uses the same action identifiers for renderer callbacks', async () => {
		const onAction = vi.fn();
		render(<SemanticWorkspace viewId="inbox" onAction={onAction} />);
		fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
		expect(onAction).toHaveBeenCalledWith('proposal.approve', undefined);
	});
});
