import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';
class UiProgramTests {
  server():void {
    const code="import {UiServerRenderer} from '@treeseed-cordis/ui/server';class Program{static async run(){const renderer=await UiServerRenderer.create();try{const page=await renderer.render({id:'fixture',componentId:'status',model:{title:'Installed',state:'ready',detail:'<script>canary</script>'}});if(!page.html.includes('&lt;script&gt;canary&lt;/script&gt;')||page.html.includes('<script>canary'))throw new Error('unsafe output');}finally{await renderer.dispose();}}}await Program.run();";
    const result=spawnSync('node',['--input-type=module','-e',code],{encoding:'utf8'});expect(result.status).toBe(0);expect(result.stderr).toBe('');
  }
}
const suite=new UiProgramTests();test('smoke: public UI renderer is a real program and escapes content',suite.server.bind(suite));

class UiContractTests {
  async schemas():Promise<void> {
    const {UiSchemas}=await import('../src/contracts.js');
    expect(UiSchemas.tableModel.safeParse({title:'t',columns:['a'],rows:[['a','b']]}).success).toBe(false);
    expect(UiSchemas.formModel.safeParse({title:'t',actionId:'save',submitLabel:'Save',fields:[{id:'a',label:'A'},{id:'a',label:'A'}]}).success).toBe(false);
    expect(UiSchemas.formModel.safeParse({title:'t',actionId:'save',submitLabel:'Save',fields:[{id:'a',label:'Password',type:'password',value:'credential-output-canary'}]}).success).toBe(false);
    for(const href of ['javascript:alert(1)','//foreign.invalid','/\\foreign.invalid','https://user:secret@host.invalid'])expect(UiSchemas.navigationModel.safeParse({label:'n',items:[{label:'x',href}]}).success).toBe(false);
    expect(UiSchemas.hydration.safeParse({view:{id:'v',componentId:'text',model:{text:'safe'}},presentationGeneration:'a'.repeat(64),assetGeneration:'b'.repeat(64),actionIds:[],token:'credential-output-canary'}).success).toBe(false);
  }
  async renderers():Promise<void> {
    const {UiServerRenderer}=await import('../src/server.js'),{UiTerminalRenderer}=await import('../src/terminal.js');
    const server=await UiServerRenderer.create(),terminal=await UiTerminalRenderer.create();
    try {const page=await server.render({id:'fixture',componentId:'status',model:{title:'Status',state:'Ready'}}),style=await server.styles();expect(page.html).not.toContain('<style>');expect(page.assets).toEqual([style.path]);expect(style.path).toContain(style.digest);expect(page.html).toContain(style.path);expect((await terminal.render({id:'fixture',componentId:'status',model:{title:'Status',state:'Ready'}})).text).toBe('Status: Ready\n');}
    finally{await server.dispose();await terminal.dispose();}
    await expect(server.render({id:'f',componentId:'text',model:{text:'closed'}})).rejects.toThrow();
  }
}
const contracts=new UiContractTests();
test('unit: UI rejects malformed models unsafe navigation and credential defaults',contracts.schemas.bind(contracts));
test('integration: native default renderers share components assets and cleanup',contracts.renderers.bind(contracts));
class RendererSelectionTests {
  async selectedDefault():Promise<void>{const {UiServerRenderer}=await import('../src/server.js');const renderer=await UiServerRenderer.create();try{const identity=(renderer as unknown as {identity():{providerId:string;generation:string}}).identity();expect(identity.providerId).toBe('ui.renderer.server.default');expect(identity.generation).toMatch(/^[a-f0-9]{64}$/);}finally{await renderer.dispose();}}
}
const selection=new RendererSelectionTests();test('integration: default renderer is selected through native Cordis',selection.selectedDefault.bind(selection));
class IslandProgramTests {
  missing():void {const code="import {UiIslandHost} from '@treeseed-cordis/ui/island';class Program{static async run(){const prepared=await UiIslandHost.prepare({view:{id:'v',componentId:'text',model:{text:'portable'}},presentationGeneration:'a'.repeat(64),assetGeneration:'b'.repeat(64),actionIds:[]},{assetGeneration:'b'.repeat(64),actionIds:[]});await prepared.dispose();}}await Program.run();";const result=spawnSync('node',['--input-type=module','-e',code],{encoding:'utf8'});expect(result.stderr).toContain('UI_GENERATION_MISMATCH');}
}
const island=new IslandProgramTests();test('smoke: public island boundary refuses unaccepted presentation before rendering',island.missing.bind(island));
class IslandReactPropsTests {
  async boundary():Promise<void>{const {UiSchemas}=await import('../src/contracts.js'),{UiIslandHost}=await import('../src/island.js'),{UiServerRenderer}=await import('../src/server.js'),{createElement}=await import('react'),{renderToString}=await import('react-dom/server');const server=await UiServerRenderer.create();try{const view={id:'fixture',componentId:'text',model:{text:'Hydrated'}},page=await server.render(view),bootstrap={view,presentationGeneration:page.generation,assetGeneration:'a'.repeat(64),actionIds:[]},binding=await UiIslandHost.prepare(bootstrap,{assetGeneration:'a'.repeat(64),actionIds:[]});try{expect(renderToString(createElement(binding.Component,bootstrap,undefined))).toContain('Hydrated');}finally{await binding.dispose();}expect(UiSchemas.hydration.safeParse({...bootstrap,children:'foreign'}).success).toBe(false);}finally{await server.dispose();}}
}
const islandProps=new IslandReactPropsTests();test('integration: React undefined child is separate from strict island bootstrap',islandProps.boundary.bind(islandProps));
class IslandAdmissionTests {
  async isolated():Promise<void>{const {UiServerRenderer}=await import('../src/server.js'),{UiIslandHost}=await import('../src/island.js'),{createElement}=await import('react'),{renderToString}=await import('react-dom/server');const renderer=await UiServerRenderer.create();try{const view={id:'v',componentId:'form',model:{title:'Alice',actionId:'save',submitLabel:'Save',fields:[]}},page=await renderer.render(view),bootstrap={view,presentationGeneration:page.generation,assetGeneration:'b'.repeat(64),actionIds:['save']},host={assetGeneration:'b'.repeat(64),actionIds:['save']};await expect(UiIslandHost.prepare(bootstrap,{...host,assetGeneration:'c'.repeat(64)})).rejects.toThrow('UI_ASSET_MISMATCH');await expect(UiIslandHost.prepare(bootstrap,{...host,actionIds:[]})).rejects.toThrow('UI_ACTION_DENIED');await expect(UiIslandHost.prepare({...bootstrap,presentationGeneration:'f'.repeat(64)},host)).rejects.toThrow('UI_GENERATION_MISMATCH');const alice=await UiIslandHost.prepare(bootstrap,host),bobBootstrap={...bootstrap,view:{...view,model:{...view.model,title:'Bob'}}},bob=await UiIslandHost.prepare(bobBootstrap,host);try{expect(renderToString(createElement(alice.Component,bootstrap))).not.toContain('Bob');expect(renderToString(createElement(bob.Component,bobBootstrap))).not.toContain('Alice');expect(renderToString.bind(null,createElement(alice.Component,bobBootstrap))).toThrow('UI_BOOTSTRAP_MISMATCH');}finally{await alice.dispose();await bob.dispose();}expect(renderToString.bind(null,createElement(alice.Component,bootstrap))).toThrow('UI_ISLAND_CLOSED');}finally{await renderer.dispose();}}
}
const admission=new IslandAdmissionTests();test('integration: island roots isolate model actions assets generations and disposal',admission.isolated.bind(admission));
class PresentationIdentityTests {
  async selectedOnly():Promise<void>{const {UiScope,StatusComponentPlugin}=await import('../src/providers.js'),{UiTokens}=await import('../src/contracts.js');const baseline=await UiScope.create(),scopeId='request-unique',registrations=UiScope.defaults();registrations.push({token:UiTokens.component('status'),plugin:StatusComponentPlugin,declaration:{...StatusComponentPlugin.declaration,id:'ui.status.unselected'},configuration:{},artifact:{kind:'bundled',identity:'fixture.unselected'}});const selections=[];for(const registration of UiScope.defaults()){const declaration=registration.declaration as {id:string};selections.push({scopeId,capability:registration.token.id,providerId:declaration.id});}const alternate=await UiScope.create({scopeId,registrations,selections});try{expect(alternate.presentationGeneration).toBe(baseline.presentationGeneration);expect(alternate.handle.generation).not.toBe(baseline.handle.generation);}finally{await baseline.dispose();await alternate.dispose();}}
}
const presentation=new PresentationIdentityTests();test('integration: hydration identity binds selected presentation and ignores request scope labels',presentation.selectedOnly.bind(presentation));
