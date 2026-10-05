import { renderToStaticMarkup } from 'react-dom/server';
import { describe,expect,it } from 'vitest';
import { AgentFlowCanvas,creatorUrl } from '../../../src/react/command-center/flow/AgentFlowCanvas.tsx';

describe('Agent Flow authoring entry', () => {
	it('keeps creation in browser history and removes only its own URL state on close', () => {
		expect(creatorUrl('http://local.test/app/work/build?date=2026-08-13', 'agent')).toBe('/app/work/build?date=2026-08-13&create=agent');
		expect(creatorUrl('http://local.test/app/work/build?date=2026-08-13&create=agent', null)).toBe('/app/work/build?date=2026-08-13');
	});

	it('offers team projects even before the first repository agent exists', () => {
		const markup=renderToStaticMarkup(<AgentFlowCanvas items={[]} relations={[]} projects={[{id:'project-a',name:'Project A'}]} authoringEndpoint="/authoring" />);
		expect(markup).toContain('<option value="project-a">Project A</option>');
		expect(markup).toContain('Create agent');
	});
});
