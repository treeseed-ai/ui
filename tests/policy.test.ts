import { test, expect } from 'bun:test';
class PolicyTests {
    async consumers(): Promise<void> { const { UiSourcePolicy } = await import('../src/source-policy.js'); const gate = new UiSourcePolicy(); for (const source of ["class View{render(){return <section>duplicate</section>}}", "class View{run(){document.createElement('div')}}", "class View{run(node:Element){node.innerHTML='duplicate'}}", "class View{run(){return `<form>duplicate</form>`}}", "import './local.css';class View{}", "import {createRoot as root} from 'react-dom/client';class View{}"]) {
        expect(gate.inspect('src/view.tsx', source).length).toBeGreaterThan(0);
    } expect(gate.inspect('src/model.ts', "import {UiViewModel} from '@treeseed-cordis/ui/contracts';class View{model(){return {componentId:'status',model:{title:'Ready',state:'ready'}}}} ")).toEqual([]); expect(gate.inspect('src/View.astro', '<section>duplicate</section>').length).toBeGreaterThan(0); }
}
const suite = new PolicyTests();
test('unit: consumer semantic gate rejects duplicated visual implementations', suite.consumers.bind(suite));
class ComponentClassTests {
    async classOnly(): Promise<void> { const { UiTokens } = await import('../src/contracts.js'); expect(UiTokens.component('text').parse.bind(UiTokens.component('text'), { component: Object, validate: JSON.parse, modelSchema: JSON.parse, terminal: JSON.stringify })).toThrow('INVALID_UI_COMPONENT'); }
}
const components = new ComponentClassTests();
test('unit: advertised UI component must be a React class', components.classOnly.bind(components));
