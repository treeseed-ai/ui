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
    expect(UiSchemas.hydration.safeParse({view:{id:'v',componentId:'text',model:{text:'safe'}},compositionGeneration:'a'.repeat(64),assetGeneration:'b'.repeat(64),actionIds:[],token:'credential-output-canary'}).success).toBe(false);
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
