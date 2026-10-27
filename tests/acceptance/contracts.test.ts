import {test,expect} from 'bun:test';
import {spawnSync} from 'node:child_process';
class ContractTestsAcceptance {

 program():void{const code="import {UiSchemas} from '@treeseed-cordis/ui/contracts';class Program{static run(){UiSchemas.view.parse({id:'public',componentId:'text',model:{text:'safe'}});if(typeof globalThis.document!=='undefined')throw new Error('unexpected DOM');process.stdout.write('UI-contract-ok\\n');}}Program.run();";const result=spawnSync('node',['--input-type=module','-e',code],{encoding:'utf8'});expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toBe('UI-contract-ok\n');}
}
const suite=new ContractTestsAcceptance();
test("acceptance: public contract is a real program without DOM startup",suite.program.bind(suite));
