import { AgentAtlasWorkspace } from '../../../../src/react/agent-atlas/AgentAtlasWorkspace.tsx';
import { projection } from './agent-atlas-projection.ts';


export default function AgentAtlasHarness() {
	return <AgentAtlasWorkspace initialProjection={projection} endpoints={{ projection: '/api/atlas/projection', delta: '/api/atlas/delta', stream: '', detail: '/api/atlas/detail', assignmentGraphs: '/api/atlas/graphs' }} canManage canDiagnose />;
}
