import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AtlasResourceDetail } from '../../../src/react/agent-atlas/AtlasResourceDetail.tsx';

describe('Atlas reusable inner resource surfaces', () => {
	it.each(['project', 'group', 'agent', 'capacity', 'workday', 'knowledge', 'book', 'signal', 'event', 'artifact', 'assignment'])(
		'renders a semantic %s presentation with stable landmarks', (kind) => {
			const { container } = render(<AtlasResourceDetail kind={kind} mode="easy" data={{ title: `${kind} record`, status: 'active', summary: { description: 'Operational summary', health: 'ready' }, data: {} }} onInspect={vi.fn()} />);
			expect(screen.getByRole('heading', { name: `${kind} record` })).toBeInTheDocument();
			expect(container.querySelector('[data-presentation]')).toHaveAttribute('data-presentation', `${kind}-easy`);
		},
	);

	it('opens relationships and activity through the common overlay callback', () => {
		const inspect = vi.fn();
		render(<AtlasResourceDetail kind="project" mode="observed" data={{ title: 'Project', data: {}, related: [{ id: 'agent-a', kind: 'agent', name: 'Agent A' }], activity: [{ id: 'event-a', summary: 'Work completed' }] }} onInspect={inspect} />);
		fireEvent.click(screen.getByRole('button', { name: 'Agent A' }));
		fireEvent.click(screen.getByRole('button', { name: 'Work completed' }));
		expect(inspect).toHaveBeenNthCalledWith(1, 'agent', 'agent-a');
		expect(inspect).toHaveBeenNthCalledWith(2, 'event', 'event-a');
	});

	it('redacts secret fields declared by the shared resource registry', () => {
		render(<AtlasResourceDetail kind="service" mode="observed" data={{ title: 'GitHub', data: { name: 'GitHub', credential: 'must-not-render' } }} onInspect={vi.fn()} />);
		expect(screen.getByText('Configured securely')).toBeInTheDocument();
		expect(screen.queryByText('must-not-render')).not.toBeInTheDocument();
	});
});
