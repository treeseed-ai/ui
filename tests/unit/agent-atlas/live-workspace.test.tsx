import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AgentAtlasWorkspace } from '../../../src/react/agent-atlas/AgentAtlasWorkspace.tsx';
import { projection } from '../../../sandbox/src/components/displays/AgentAtlasHarness.tsx';

class FakeEventSource extends EventTarget {
 static instances: FakeEventSource[] = [];
 close = vi.fn();
 constructor(readonly url: string) { super(); FakeEventSource.instances.push(this); }
 delta(data: unknown) { this.dispatchEvent(new MessageEvent('atlas.delta', { data: JSON.stringify(data) })); }
}
afterEach(() => { FakeEventSource.instances=[]; vi.unstubAllGlobals(); history.replaceState({},'', '/'); });
const endpoints={projection:'/projection?workday=workday-demo',delta:'/delta',stream:'/stream?workday=workday-demo',detail:'/detail',assignmentGraphs:'/graphs'};
describe('Atlas live inspector updates',()=>{
 it('refreshes on an assignment-only delta while preserving selection and exact scope',async()=>{
  const initial=structuredClone(projection),refreshed=structuredClone(projection);refreshed.revision='r2';refreshed.nodeStates[0]!.status='completed';refreshed.assignments[0]!.status='completed';
  const fetch=vi.fn(async(input:RequestInfo|URL)=>({ok:true,json:async()=>({payload:String(input).startsWith('/projection')?refreshed:{title:'UI builder',status:'running',data:{}}})}));
  vi.stubGlobal('fetch',fetch);vi.stubGlobal('EventSource',FakeEventSource);
  history.replaceState({},'', '/app/work?workday=workday-demo&date=2026-09-02');
  const view=render(<AgentAtlasWorkspace initialProjection={initial} endpoints={endpoints}/>);
  fireEvent.click(screen.getByRole('button',{name:'UI builder, engineering, running'}));
  expect(await screen.findByRole('heading',{name:'UI builder'})).toBeInTheDocument();
  const selection=location.search,source=FakeEventSource.instances.at(-1)!;
  await act(async()=>source.delta({assignments:[{id:'assignment-demo',status:'completed'}],activity:[]}));
  await waitFor(()=>expect(fetch).toHaveBeenCalledWith('/projection?workday=workday-demo&metric=activity',{headers:{accept:'application/json'}}));
  expect(document.querySelector('.ts-atlas-agent')).toHaveAttribute('data-status','completed');
  expect(screen.getByRole('button',{name:'Close detail'})).toBeInTheDocument();expect(location.search).toBe(selection);
  expect(new URLSearchParams(location.search).get('workday')).toBe('workday-demo');
  view.unmount();expect(FakeEventSource.instances.every(item=>item.close.mock.calls.length===1)).toBe(true);
 });
 it('does not subscribe or overwrite a historical projection',()=>{
  const historical=structuredClone(projection);historical.playback.mode='historical';
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);vi.stubGlobal('EventSource',FakeEventSource);
  render(<AgentAtlasWorkspace initialProjection={historical} endpoints={endpoints}/>);
  expect(FakeEventSource.instances).toHaveLength(0);expect(fetch).not.toHaveBeenCalled();
 });
});
