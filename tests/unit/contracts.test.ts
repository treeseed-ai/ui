import {test,expect} from 'bun:test';
import {spawnSync} from 'node:child_process';
class ContractTestsUnit {

 async models():Promise<void>{const {UiSchemas}=await import('../../src/contracts.js');expect(UiSchemas.tableModel.safeParse({title:'Records',columns:['Name'],rows:[['record']]}).success).toBe(true);expect(UiSchemas.tableModel.safeParse({title:'Records',columns:['Name'],rows:[['record','extra']]}).success).toBe(false);expect(UiSchemas.formModel.safeParse({title:'Identity',actionId:'submit',submitLabel:'Continue',fields:[{id:'password',label:'Password',type:'password',value:'credential-output-canary'}]}).success).toBe(false);}
}
const suite=new ContractTestsUnit();
test('unit: portable UI models validate data and reject secret defaults',suite.models.bind(suite));
