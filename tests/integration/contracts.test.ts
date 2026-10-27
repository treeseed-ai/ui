import {test,expect} from 'bun:test';
import {spawnSync} from 'node:child_process';
class ContractTestsIntegration {

 async boundary():Promise<void>{const {UiSchemas}=await import('../../src/contracts.js'),{UiSourcePolicy}=await import('../../src/source-policy.js');expect(UiSchemas.view.safeParse({id:'view',componentId:'text',model:{text:'safe'},principalToken:'credential-output-canary'}).success).toBe(false);expect(new UiSourcePolicy().inspect('src/host.tsx',"class Host{render(){return <section>duplicate</section>}}").length).toBeGreaterThan(0);}
}
const suite=new ContractTestsIntegration();
test('integration: view and source boundaries reject consumer-owned rendering',suite.boundary.bind(suite));
