import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';
class UiProgramTests {
  server():void {
    const code="import {UiServerRenderer} from '@treeseed-cordis/ui/server';class Program{static async run(){const renderer=await UiServerRenderer.create();try{const page=await renderer.render({id:'fixture',componentId:'status',model:{title:'Installed',state:'ready',detail:'<script>canary</script>'}});if(!page.html.includes('&lt;script&gt;canary&lt;/script&gt;')||page.html.includes('<script>canary'))throw new Error('unsafe output');}finally{await renderer.dispose();}}}await Program.run();";
    const result=spawnSync('node',['--input-type=module','-e',code],{encoding:'utf8'});expect(result.status).toBe(0);expect(result.stderr).toBe('');
  }
}
const suite=new UiProgramTests();test('smoke: public UI renderer is a real program and escapes content',suite.server.bind(suite));
