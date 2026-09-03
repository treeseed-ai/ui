import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SemanticActionLauncher } from '../../../src/react/semantic/SemanticActionLauncher.tsx';

describe('semantic action launcher', () => {
	it('resolves shared action presentation for an embedded application', () => {
		render(<SemanticActionLauncher label="Team actions" actions={[
			{ id: 'agent.create', href: '/agents/new' },
			{ id: 'service.connect', href: '/services/new' },
		]} />);
		expect(screen.getByText('Team actions')).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /New agent/ })).toHaveAttribute('href', '/agents/new');
		expect(screen.getByRole('menuitem', { name: /Connect service/ })).toHaveAttribute('data-intent', 'primary');
	});

	it('exposes but does not activate a permission-denied action', () => {
		render(<SemanticActionLauncher label="Team actions" actions={[
			{ id: 'capacity.configure', href: '/capacity', allowed: false, reason: 'Team owner permission required.' },
		]} />);
		const action = screen.getByRole('menuitem', { name: /Configure capacity/ });
		expect(action).toHaveAttribute('aria-disabled', 'true');
		expect(action).toHaveAttribute('aria-description', 'Team owner permission required.');
		expect(fireEvent.click(action)).toBe(false);
	});
});
