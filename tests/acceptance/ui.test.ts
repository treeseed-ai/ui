import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';
class UiProgramTestsAcceptance {

    server(): void {
        const code = "import {UiServerRenderer} from '@treeseed-cordis/ui/server';class Program{static async run(){const renderer=await UiServerRenderer.create();try{const page=await renderer.render({id:'fixture',componentId:'status',model:{title:'Installed',state:'ready',detail:'<script>canary</script>'}});if(!page.html.includes('&lt;script&gt;canary&lt;/script&gt;')||page.html.includes('<script>canary'))throw new Error('unsafe output');}finally{await renderer.dispose();}}}await Program.run();";
        const result = spawnSync('node', ['--input-type=module', '-e', code], { encoding: 'utf8' });
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
    }
}
class IslandProgramTestsAcceptance {

    missing(): void { const code = "import {UiIslandHost} from '@treeseed-cordis/ui/island';class Program{static async run(){const prepared=await UiIslandHost.prepare({view:{id:'v',componentId:'text',model:{text:'portable'}},contribution:{id:'v',componentId:'text',providerId:'ui.text.default',modelSchemaDigest:'a'.repeat(64),styleDigest:'b'.repeat(64)},presentationGeneration:'a'.repeat(64),assetGeneration:'b'.repeat(64),actionIds:[]},{assetGeneration:'b'.repeat(64),actionIds:[]});await prepared.dispose();}}await Program.run();"; const result = spawnSync('node', ['--input-type=module', '-e', code], { encoding: 'utf8' }); expect(result.stderr).toContain('UI_GENERATION_MISMATCH'); }
}
const suite=new UiProgramTestsAcceptance();
const island=new IslandProgramTestsAcceptance();
test("acceptance: public UI renderer is a real program and escapes content", suite.server.bind(suite));
test("acceptance: public island boundary refuses unaccepted presentation before rendering", island.missing.bind(island));
